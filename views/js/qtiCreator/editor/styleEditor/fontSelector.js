define([
    'jquery',
    'json!taoQtiItem/qtiCreator/editor/resources/font-stacks.json',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
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
    var fontSelector = function () {
        var fontSelector = $('select#item-editor-font-selector'),
            target = fontSelector.data('target'),
            normalize = function (font) {
                return font.replace(/"/g, "'").replace(/, /g, ",");
            },
            clean = function (font) {
                return font.substring(0, font.indexOf(',')).replace(/'/g, '');
            },
            resetButton =  fontSelector.parent().find('[data-role="font-selector-reset"]'),
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
                return '<span style="font-size: 12px;' + $(originalOption).attr('style') + '">' + state.text + '</span>';
            };


        fontSelector.append('<option/>');

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
                fontSelector.append(optGroup);
            }
        }



        resetButton.on('click', function () {
            styleEditor.apply(target, 'font-family');
            fontSelector.select2('val', '');
        });

        fontSelector.on('change', function () {
            styleEditor.apply(target, 'font-family', $(this).val());
        }).select2({
            formatResult: format,
            formatSelection: format,
            width: 'resolve'
        });
    };

    return fontSelector;
});

