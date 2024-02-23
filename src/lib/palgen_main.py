# interface for palgen_persune
# Copyright (C) 2024 Persune
# inspired by PalGen, Copyright (C) 2018 DragWx <https://github.com/DragWx>
# testing out the concepts from https://www.nesdev.org/wiki/NTSC_video#Composite_decoding
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import palgen_persune as pp
import colour.models
import numpy as np
import sys
from pyscript import display

print("palgen_persune @" + pp.VERSION)

def main(argv=None):
    args = pp.parse_argv(argv or sys.argv)

    if (args.skip_plot) and (args.output is None) and not (args.render_img is not None):
        sys.exit("warning! palette is generated but not plotted or outputted")

    # special thanks to NewRisingSun for teaching me how chromatic adaptations work!
    # special thanks to _aitchFactor for pointing out that colour-science has
    # chromatic adaptation functions!

    # suppress warnings for colour-science
    with colour.utilities.suppress_warnings(*[True] * 4):
        # reference color profile colorspace
        s_colorspace = colour.RGB_Colourspace(
            colour.RGB_COLOURSPACES[args.reference_colorspace].name,
            colour.RGB_COLOURSPACES[args.reference_colorspace].primaries,
            colour.RGB_COLOURSPACES[args.reference_colorspace].whitepoint)

        if (args.reference_primaries_r is not None
            and args.reference_primaries_g is not None
            and args.reference_primaries_b is not None):
            s_colorspace.name = "custom primaries"
            s_colorspace.primaries = np.array([
                args.reference_primaries_r,
                args.reference_primaries_g,
                args.reference_primaries_b
            ])
        else:
            s_colorspace.name = colour.RGB_COLOURSPACES[args.reference_colorspace].name
            s_colorspace.primaries = colour.RGB_COLOURSPACES[args.reference_colorspace].primaries

        if (args.reference_primaries_w is not None):
            s_colorspace.whitepoint = args.reference_primaries_w
            s_colorspace.whitepoint_name = "custom whitepoint"
        else:
            s_colorspace.whitepoint_name = colour.RGB_COLOURSPACES[args.reference_colorspace].whitepoint_name
            s_colorspace.whitepoint = colour.RGB_COLOURSPACES[args.reference_colorspace].whitepoint

        # display color profile colorspace
        t_colorspace = colour.RGB_Colourspace(
            colour.RGB_COLOURSPACES[args.display_colorspace].name,
            colour.RGB_COLOURSPACES[args.display_colorspace].primaries,
            colour.RGB_COLOURSPACES[args.display_colorspace].whitepoint)

        if (args.display_primaries_r is not None
            and args.display_primaries_g is not None
            and args.display_primaries_b is not None): 
            t_colorspace.name = "custom primaries"
            t_colorspace.primaries = np.array([
                args.display_primaries_r,
                args.display_primaries_g,
                args.display_primaries_b
            ])
        else:
            t_colorspace.name = colour.RGB_COLOURSPACES[args.display_colorspace].name
            t_colorspace.primaries = colour.RGB_COLOURSPACES[args.display_colorspace].primaries

        if (args.display_primaries_w is not None):
            t_colorspace.whitepoint = args.display_primaries_w
            t_colorspace.whitepoint_name = "custom whitepoint"
        else:
            t_colorspace.whitepoint_name = colour.RGB_COLOURSPACES[args.display_colorspace].whitepoint_name
            t_colorspace.whitepoint = colour.RGB_COLOURSPACES[args.display_colorspace].whitepoint

        s_colorspace.name = "Reference colorspace: {}".format(s_colorspace.name)
        t_colorspace.name = "Display colorspace: {}".format(t_colorspace.name)

        # decoded RGB buffer
        # has to be zero'd out for the normalize function to work
        RGB_buffer = np.zeros([8,4,16,3], np.float64)
        signal_black_point = 0
        signal_white_point = 100

        # generate color!
        match args.ppu:
            case "2C03"|"2C04-0000"|"2C04-0001"|"2C04-0002"|"2C04-0003"|"2C04-0004"|"2C05-99":
                # signal buffer normalization
                if (args.black_point is not None):
                    signal_black_point = args.black_point

                if (args.white_point is not None):
                    signal_white_point = args.white_point
                    
                # we use RGB_buffer[] as a temporary buffer for YUV
                RGB_buffer = pp.pixel_codec_rgb(RGB_buffer, args, signal_black_point, signal_white_point)
            case "2C02"|"2C07":
                # signal buffer normalization
                if (args.black_point is not None):
                    signal_black_point = args.black_point

                if (args.white_point is not None):
                    signal_white_point = args.white_point
                else:
                    signal_white_point = 140 * (pp.signal_table_composite[3, 0, 0] - pp.signal_table_composite[1, 1, 0])

                # we use RGB_buffer[] as a temporary buffer for YUV
                RGB_buffer = pp.pixel_codec_composite(RGB_buffer, args, signal_black_point, signal_white_point)

        # reshape buffer after encoding
        if (args.emphasis):
            RGB_buffer = np.reshape(RGB_buffer,(32, 16, 3))
        else:
            RGB_buffer = np.reshape(RGB_buffer,(4, 16, 3))

        # convert back to RGB
        RGB_buffer = np.einsum('ij,klj->kli', np.linalg.inv(pp.RGB_to_YUV), RGB_buffer, dtype=np.float64)

        # apply black and white points
        # this also scales the values back roughly within range of 0 to 1
        RGB_buffer -= signal_black_point
        RGB_buffer /= (signal_white_point - signal_black_point)

        # debug: a rough vectorscope plot
        # NES_SMPTE_plot(RGB_buffer, 0, args, plt)

        # fit RGB within range of 0.0-1.0
        pp.normalize_RGB(RGB_buffer, args)

        # convert RGB to display output

        # convert linear signal to linear light, if permitted
        if (not args.electro_optic_disable):
            RGB_buffer = colour.oetf_inverse(RGB_buffer, function=args.opto_electronic)

        # transform color primaries
        if (args.inverse_chromatic_transform):
            RGB_buffer = colour.RGB_to_RGB(
                RGB_buffer,
                t_colorspace,
                s_colorspace,
                chromatic_adaptation_transform=args.chromatic_adaptation_transform)
        else:
            RGB_buffer = colour.RGB_to_RGB(
                RGB_buffer,
                s_colorspace,
                t_colorspace,
                chromatic_adaptation_transform=args.chromatic_adaptation_transform)

        # convert linear light to linear signal, if permitted
        if (not args.opto_electronic_disable):
            RGB_buffer = colour.oetf(RGB_buffer, function=args.opto_electronic)

        # clip again, the transform may produce values beyond 0-1
        pp.normalize_RGB(RGB_buffer, args)
        
        display(RGB_buffer)

if __name__=='__main__':
    main(sys.argv)