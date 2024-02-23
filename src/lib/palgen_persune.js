/* interface for palgen_persune
 * Copyright (C) 2024 Persune
 * uses some code from PalGen, Copyright (C) 2018 DragWx <https://github.com/DragWx>
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
var paletteEntryTextVisible = true;

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
    palettetable.style.paddingBottom = "20px";
    palettetable.style.paddingTop = "20px";
    
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
            if (paletteEntryTextVisible) {
                paletteEntry.style.textAlign = "left";
                paletteEntry.textContent = "$" + paletteIndex.toString(16).padStart(2, '0');
            }
            newRow.appendChild(paletteEntry);
        }
        palettetable.appendChild(newRow);
    }
    appwindow.appendChild(palettetable);
}