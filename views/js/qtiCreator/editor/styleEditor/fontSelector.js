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
     */
    function fontSelector() {
        const selector = 'select#item-editor-font-selector',
            $selector = $(selector),
            target = $selector.data('target'),
            normalize = function (font) {
                return font.replace(/"/g, "'").replace(/, /g, ",");
            },
            clean = function (font) {
                return font.substring(0, font.indexOf(',')).replace(/'/g, '');
            },
            resetButton = $selector.parent().find('[data-role="font-selector-reset"]'),
            toLabel = function (font) {
                font = font.replace(/-/g, ' ');
                return (`${font}`).replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
                    return $1.toUpperCase();
                });
            },
            format = function (state) {
                const originalOption = state.element;
                if (!state.id) {
                    return state.text;
                }
                return `<span style="font-size: 12px;${$(originalOption).attr('style')}">${state.text}</span>`;
            },
            reset = function () {
                styleEditor.apply(target, 'font-family');
                $selector.select2('val', '');
            };

        $selector.append(`<option value="">${__('Default')}</option>`);

        for (let key in fontStacks) {
            if (fontStacks.hasOwnProperty(key)) {
                const optGroup = document.createElement('optgroup');
                optGroup.setAttribute('label', toLabel(key));

                fontStacks[key].forEach(font => {
                    const normalizeFont = normalize(font);
                    const option = document.createElement('option');

                    option.value = normalizeFont;
                    option.textContent = clean(normalizeFont);
                    option.style.fontFamily = normalizeFont;

                    optGroup.appendChild(option);
                });

                $selector[0].appendChild(optGroup);
            }
        }

        resetButton.on('click', reset);

        $selector.select2({
            formatResult: format,
            formatSelection: format,
            width: 'resolve'
        });

        $(document).on('customcssloaded.styleeditor', function (e, style) {
            if (style[target] && style[target]['font-family']) {
                $selector.select2('val', style[target]['font-family']);
                $(`${selector} option:selected`).first().attr('selected', 'selected');
            }
        });

        $selector.on('change', function () {
            styleEditor.apply(target, 'font-family', $(this).val());
            $(`${selector} option:selected`).first().attr('selected', 'selected');
        });
    }

    return fontSelector;
});
