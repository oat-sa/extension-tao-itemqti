define([
    'jquery',
    'json!taoQtiItem/qtiCreator/editor/resources/font-stacks.json',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'i18n',
    'select2'
], function ($, fontStacks, styleEditor, __) {
    'use strict';

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
    function fontSelector() {
        const selector = 'select#item-editor-font-selector',
            fontSelector = $(selector),
            target = fontSelector.data('target'),
            $target = $(target),
            normalize = function (font) {
                return font.replace(/"/g, "'").replace(/, /g, ",");
            },
            clean = function (font) {
                return font.substring(0, font.indexOf(',')).replace(/'/g, '');
            },
            resetButton = fontSelector.parent().find('[data-role="font-selector-reset"]');
        let generic,
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
                const originalOption = state.element;
                if (!state.id) {
                    return state.text;
                }
                return '<span style="font-size: 12px;' + $(originalOption).attr('style') + '">' + state.text + '</span>';
            },
            reset = function () {
                styleEditor.apply(target, 'font-family');
                fontSelector.select2('val', '');
            };

        fontSelector.append('<option value="">' + __('Default') + '</option>');

        for (generic in fontStacks) {
            if (fontStacks.hasOwnProperty(generic)) {
                optGroup = $('<optgroup>', { label: toLabel(generic) });
                l = fontStacks[generic].length;
                for (i = 0; i < l; i++) {
                    // normalize quotes
                    fontStacks[generic][i] = normalize(fontStacks[generic][i]);
                    const value = fontStacks[generic][i];
                    option = $('<option>', {
                        value,
                        text: clean(value)
                    })
                        .css({
                            fontFamily: value
                        });
                    optGroup.append(option);
                }
                fontSelector.append(optGroup);
            }
        }

        resetButton.on('click', reset);

        fontSelector.select2({
            formatResult: format,
            formatSelection: format,
            width: 'resolve'
        });

        $(document).on('customcssloaded.styleeditor', function (e, style) {
            if (style[target] && style[target]['font-family']) {
                fontSelector.select2('val', style[target]['font-family']);
            }
        });

        fontSelector.on('change', function () {
            styleEditor.apply(target, 'font-family', $(this).val());
            $(`${selector} option:selected`).first().attr('selected', 'selected');
        });
    }

    return fontSelector;
});
