define([
    'jquery',
    'json!taoQtiItem/qtiCreator/editor/resources/font-stacks.json',
    'taoQtiItem/qtiCreator/editor/styleEditor',
    'select2'
], function ($, fontStacks, styleEditor) {
    'use strict'

    /**
     * Populate a select box with a list of fonts to select from.
     * On change apply the selected font to the specified target.
     *
     * @example
     * The expected mark-up must be like this:
     * <select
     *   data-target="selector-of-targeted-element"
     *   data-not-selected="Select a font
     *   data-selected="Reset to default">
     * <option value=""></option>
     *
     * The function is called like this:
     * fontSelector('the-select-box-selector');
     *
     * @param selector
     */
    var fontSelector = function (selector) {
        var selectBox = $(selector),
            target = selectBox.data('target'),
            oldFont = $(target).css('font-family'),
            normalize = function (font) {
                return font.replace(/"/g, "'").replace(/, /g, ",");
            },
            clean = function (font) {
                return font.substring(0, font.indexOf(',')).replace(/'/g, '');
            },
            generic,
            optGroup,
            option,
            i = 0,
            l,
            toLabel = function (font) {
                font = font.replace(/-/g, ' ');
                return (font + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
                    return $1.toUpperCase();
                });
            },
            format = function (state) {
                var originalOption = state.element;
                if (!state.id) return state.text;
                return '<span style="' + $(originalOption).attr('style') + '">' + state.text + '</span>';
            };


        for (generic in fontStacks) {
            if (fontStacks.hasOwnProperty(generic)) {
                optGroup = $('<optgroup>', { label: toLabel(generic) });
                l = fontStacks[generic].length;
                for (i = 0; i < l; i++) {
                    // normalize quotes
                    fontStacks[generic][i] = normalize(fontStacks[generic][i]);
                    option = $('<option>', {
                        value: fontStacks[generic][i],
                        text: clean(fontStacks[generic][i])
                    })
                        .css({
                            fontFamily: fontStacks[generic][i]
                        });
                    optGroup.append(option);
                }
                selectBox.append(optGroup);
            }
        }
        selectBox.on('change',function () {
            console.log(target, 'font-family', ($(this).val() || oldFont));
            styleEditor.apply(target, 'font-family', ($(this).val() || oldFont));
        }).select2({
            formatResult: format,
            formatSelection: format,
            width: 'resolve'
        });
    };

    return fontSelector;
});

