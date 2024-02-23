/* interface for palgen_persune
 * Copyright (C) 2024 Persune
 * uses some UI code from PalGen, Copyright (C) 2018 DragWx <https://github.com/DragWx>
 * 
 * license for palgen_persune:
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 *
 * license for palgen.js by DragWx:
 * Copyright (C) 2018 DragWx <https://github.com/DragWx>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the author(s) be held liable for any damages arising from
 * the use of this software.
 ****/

var palette = [];	// DOM element + metadata for each entry in the palette
var appwindow;      // DOM element for the app's container
var paletteIndexTextVisible = true;
var saveLink;       // DOM element for the save link

window.onload = init_window;

function init_window() {
    // Get the DOM element for the app's container.
    appwindow = document.getElementById('app');
    
    // Create the palette display by using a bunch of DIV elements.
    var palettetable = document.createElement('div');
    palettetable.style.width = "100%";
    palettetable.style.aspectRatio = "1 / 0.25";
    palettetable.style.fontFamily = "monospace";
    palettetable.style.fontSize = "8pt";
    palettetable.style.fontWeight = "bold";
    palettetable.style.border = "2px solid var(--palette1)";
    
    // Create four rows.
    for (var lum = 0; lum < 4; lum++) {
        var newRow = document.createElement('div');
        newRow.style.height = (100/4) + "%";
        
        // For each row, create 16 cells.
        for (var hue = 0; hue < 16; hue++) {
            var paletteEntry = document.createElement('div');
            var paletteIndex = hue + (lum * 16);
            palette[paletteIndex] = paletteEntry;
            paletteEntry.style.display = "inline-block";
            paletteEntry.style.width = (100/16) + "%";
            paletteEntry.style.height = "100%";
            paletteEntry.style.background = "#000";
            paletteEntry.style.color = "#FFF";
            if (paletteIndexTextVisible) {
                paletteEntry.style.textAlign = "left";
                paletteEntry.textContent = "$" + paletteIndex.toString(16).padStart(2, '0');
            }
            newRow.appendChild(paletteEntry);
        }
        palettetable.appendChild(newRow);
    }
    appwindow.appendChild(palettetable);

    appwindow.appendChild(document.createElement('br'));

    // Create document.paletteTweaks
    var temp = document.createElement('form');
    temp.name = "paletteTweaks";
    appwindow.appendChild(temp);

    // generation options
    var currPane = document.createElement('fieldset');
    temp = document.createElement('legend');
    temp.innerHTML = "Generation options";
    currPane.appendChild(temp);
    document.paletteTweaks.appendChild(currPane);

    {
        // PPU type
        var childPane = document.createElement('fieldset');
        var childTemp = document.createElement('legend');
        childTemp.title = "Select PPU variant of which to generate video from";
        childTemp.innerHTML = "PPU type";
        childPane.appendChild(childTemp);
        currPane.appendChild(childPane);

        // Macro for creating a PPU type option.
        var newPPUOption = function (pane, value, selected, title) {
            var radio = document.createElement('input');
            radio.type = "radio";
            radio.name = "ppuType";
            radio.id = "ppuType" + "" + value;
            radio.value = value;
            if (selected === true)
                radio.checked = "checked";
            radio.onclick = generatePalette;
            pane.appendChild(radio);
            var label = document.createElement('label');
            label.id = "ppuType";
            label.innerHTML = value;
            label.htmlFor = radio.id;
            label.title = title;
            pane.appendChild(label);
        }

        // must match mapping in palgen_persune!
        newPPUOption(childPane, "2C02", true,
            "RP2C02, NTSC composite PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C03", false,
            "RP2C03, RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C04-0000", false,
            "RP2C04-0000, Scrambled palette RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C04-0001", false,
            "RP2C04-0001, Scrambled palette RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C04-0002", false,
            "RP2C04-0002, Scrambled palette RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C04-0003", false,
            "RP2C04-0003, Scrambled palette RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C04-0004", false,
            "RP2C04-0004, Scrambled palette RGB video PPU");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C05-99", false,
            "RC2C05-99, RGB video PPU (with Famicom Titler composite encoder)");

        childPane.appendChild(document.createElement('br'));
        newPPUOption(childPane, "2C07", false,
            "RP2C07, PAL-B composite video PPU");

        // Normalize
        childPane = document.createElement('fieldset');
        var childLegend = document.createElement('legend');
        childLegend.title = "Normalize all colors within gamut by scaling values";

        // Toggle box
        childTemp = document.createElement('input');
        childTemp.type = "checkbox";
        childTemp.id = "enableNormalizeMethod";
        childLegend.appendChild(childTemp);
        childTemp = document.createElement("label");
        childTemp.innerHTML = "Normalize";
        childTemp.htmlFor = "enableNormalizeMethod";
        childLegend.appendChild(childTemp);
        childTemp = childLegend;
        childPane.appendChild(childTemp);
        currPane.appendChild(childPane);

        // Macro for creating a normalize method option.
        var newNormalizeOption = function (pane, value, selected, title) {
            var radio = document.createElement('input');
            radio.type = "radio";
            radio.name = "normalizeMethod";
            radio.id = "normalizeMethod" + "" + value;
            radio.value = value;
            if (selected === true)
                radio.checked = "checked";
            radio.onclick = generatePalette;
            radio.disabled = true
            pane.appendChild(radio);
            var label = document.createElement('label');
            label.id = "normalizeMethod";
            label.innerHTML = value;
            label.htmlFor = radio.id;
            label.title = title;
            pane.appendChild(label);
        }
        

        // must match mapping in palgen_persune!
        newNormalizeOption(childPane, "Scale", true,
            "Scales values within 0-1");

        childPane.appendChild(document.createElement('br'));
        newNormalizeOption(childPane, "Scale+Clip negative", false,
            "Clips negative values to 0, then scales values within 0-1");

        document.paletteTweaks.enableNormalizeMethod.addEventListener(
            "change",
            (event) => {
                document.getElementById("normalizeMethodScale").disabled = !event.target.checked;
                document.getElementById("normalizeMethodScale+Clip negative").disabled = !event.target.checked;
            },
            false,
        );

        // Clip
        childPane = document.createElement('fieldset');
        childLegend = document.createElement('legend');
        childLegend.title = "Clips out-of-gamut RGB colors";

        // Toggle box
        childTemp = document.createElement('input');
        childTemp.type = "checkbox";
        childTemp.id = "enableClipMethod";
        childLegend.appendChild(childTemp);
        childTemp = document.createElement("label");
        childTemp.innerHTML = "Clip";
        childTemp.htmlFor = "enableClipMethod";
        childLegend.appendChild(childTemp);
        childTemp = childLegend;
        childPane.appendChild(childTemp);
        currPane.appendChild(childPane);

        // Macro for creating a normalize method option.
        var newClipeOption = function (pane, value, selected, title) {
            var radio = document.createElement('input');
            radio.type = "radio";
            radio.name = "clipMethod";
            radio.id = "clipMethod" + "" + value;
            radio.value = value;
            if (selected === true)
                radio.checked = "checked";
            radio.onclick = generatePalette;
            radio.disabled = true
            pane.appendChild(radio);
            var label = document.createElement('label');
            label.id = "clipMethod";
            label.innerHTML = value;
            label.htmlFor = radio.id;
            label.title = title;
            pane.appendChild(label);
        }
        

        // must match mapping in palgen_persune!
        newClipeOption(childPane, "Darken", true,
            "If any channels are out of range, the color is darkened until it is completely in range. Algorithm by DragWx.");

        childPane.appendChild(document.createElement('br'));
        newClipeOption(childPane, "Desaturate", false,
            "If any channels are out of range, the color is desaturated towards its luminance. Algorithm by DragWx.");

        document.paletteTweaks.enableClipMethod.addEventListener(
            "change",
            (event) => {
                document.getElementById("clipMethodDarken").disabled = !event.target.checked;
                document.getElementById("clipMethodDesaturate").disabled = !event.target.checked;
            },
            false,
        );
    }

    // color decoding options
    currPane = document.createElement('fieldset');
    temp = document.createElement('legend');
    temp.innerHTML = "Color decoding options";
    currPane.appendChild(temp);
    document.paletteTweaks.appendChild(currPane);

    currPane.appendChild(makeFancyRangeBox("bri"));
    currPane.appendChild(document.createTextNode("Brightness"));
    currPane.appendChild(document.createElement("br"));

    currPane.appendChild(makeFancyRangeBox("con"));
    currPane.appendChild(document.createTextNode("Contrast"));
    currPane.appendChild(document.createElement("br"));
    
    currPane.appendChild(makeFancyRangeBox("hue"));
    currPane.appendChild(document.createTextNode("Hue"));
    currPane.appendChild(document.createElement("br"));
    
    currPane.appendChild(makeFancyRangeBox("sat"));
    currPane.appendChild(document.createTextNode("Saturation"));
    currPane.appendChild(document.createElement("br"));

    currPane.appendChild(makeFancyRangeBox("blp"));
    currPane.appendChild(document.createTextNode("Black point"));
    currPane.appendChild(document.createElement("br"));

    currPane.appendChild(makeFancyRangeBox("whp"));
    currPane.appendChild(document.createTextNode("White point"));
    currPane.appendChild(document.createElement("br"));

    currPane.appendChild(makeFancyRangeBox("gai"));
    currPane.appendChild(document.createTextNode("Gain"));
    document.paletteTweaks.bri.value = "0.0";
    document.paletteTweaks.con.value = "1.0";
    document.paletteTweaks.hue.value = "0.0";
    document.paletteTweaks.sat.value = "1.0";
    document.paletteTweaks.gai.value = "0.0";

    // analog effects options
    currPane = document.createElement('fieldset');
    temp = document.createElement('legend');
    temp.innerHTML = "Analog effects options";
    currPane.appendChild(temp);
    document.paletteTweaks.appendChild(currPane);

    currPane.appendChild(makeFancyRangeBox("phs"));
    currPane.appendChild(document.createTextNode("Phase skew"));
    currPane.appendChild(document.createElement("br"));

    currPane.appendChild(makeFancyRangeBox("aps"));
    currPane.appendChild(document.createTextNode("Anti-emphasis phase skew"));
    currPane.appendChild(document.createElement("br"));
    
    currPane.appendChild(makeFancyRangeBox("ela"));
    currPane.appendChild(document.createTextNode("Emphasis luma attenuation"));

    // default:
    document.paletteTweaks.phs.value = "0.0";
    document.paletteTweaks.aps.value = "0.0";
    document.paletteTweaks.ela.value = "0.0";
    // Apply this after the defaults to prevent spurious calls.
    document.paletteTweaks.hue.onchange = generatePalette;
    document.paletteTweaks.sat.onchange = generatePalette;
    document.paletteTweaks.bri.onchange = generatePalette;
    document.paletteTweaks.con.onchange = generatePalette;
    document.paletteTweaks.blp.onchange = generatePalette;
    document.paletteTweaks.whp.onchange = generatePalette;
    document.paletteTweaks.gai.onchange = generatePalette;
    document.paletteTweaks.phs.onchange = generatePalette;
    document.paletteTweaks.aps.onchange = generatePalette;
    document.paletteTweaks.ela.onchange = generatePalette;
    
    // colorimetry options
    // colorimetry reference RGB and whitepoint primaries
    // colorimetry display RGB and whitepoint primaries

}

// Create an input box with [-] and [+] buttons.
// buttonStep is actually fixed point (1000 = 1.0f) to avoid rounding shenanigans.
function makeFancyRangeBox(name, buttonStep) {
    if (buttonStep === undefined)
        buttonStep = 50;
    var temp = document.createElement('div');
    temp.style.display = "inline-flex";
    temp.style.flexDirection = "row";
    
    var valueBox = document.createElement('input');
    valueBox.type = "number";
    valueBox.id = name;
    valueBox.name = name;
    valueBox.size = "5";
    valueBox.step = "0.0001";
    valueBox.style.width = "5em";

    var minusButton = document.createElement('input');
    minusButton.type = "button";
    minusButton.value = "-";
    minusButton.onclick = function() {
        valueBox.value = (Math.round(parseFloat(valueBox.value) * 1000) - buttonStep) / 1000;
        valueBox.onchange();
    }
    minusButton.style.width = "32px";

    var plusButton = document.createElement('input');
    plusButton.type = "button";
    plusButton.value = "+";
    plusButton.onclick = function() {
        valueBox.value = (Math.round(parseFloat(valueBox.value) * 1000) + buttonStep) / 1000;
        valueBox.onchange();
    }
    plusButton.style.width = "32px";

    temp.appendChild(minusButton);
    temp.appendChild(valueBox);
    temp.appendChild(plusButton);
    return temp;
}

function generatePalette() {
    // trigger palette generation
}