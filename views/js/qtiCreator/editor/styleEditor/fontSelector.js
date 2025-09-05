define([
    'jquery',
    'lodash',
    'json!taoQtiItem/qtiCreator/editor/resources/font-stacks.json',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'i18n',
    'select2'
], function ($, _, fontStacks, styleEditor, __) {
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
            cssVariablesRootSelector = styleEditor.getConfig().cssVariablesRootSelector,
            normalize = function (font) {
                return font.replace(/"/g, "'").replace(/, /g, ',');
            },
            clean = function (font) {
                return font.substring(0, font.indexOf(',')).replace(/'/g, '');
            },
            resetButton = $selector.parent().find('[data-role="font-selector-reset"]'),
            toLabel = function (font) {
                font = font.replace(/-/g, ' ');
                return `${font}`.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
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
            styleEditorApply = function (val) {
                const varName = '--styleeditor-font-family';
                styleEditor.apply(cssVariablesRootSelector, varName, val);
                styleEditor.apply(target, 'font-family', val ? `var(${varName})` : null);
            };

        $selector.append(`<option value="">${__('Default')}</option>`);

        _.forEach(fontStacks, (value, key) => {
            const optGroup = $('<optgroup>', { label: toLabel(key) });
            _.forEach(value, font => {
                const normalizeFont = normalize(font);
                const option = $('<option>', {
                    value: normalizeFont,
                    text: clean(normalizeFont)
                }).css({
                    fontFamily: normalizeFont
                });
                optGroup.append(option);
            });
            $selector.append(optGroup);
        });

        resetButton.on('click', function () {
            styleEditorApply(null);
            $selector.select2('val', '');
        });

        $selector.select2({
            formatResult: format,
            formatSelection: format,
            width: 'resolve'
        });

        $(document).on('customcssloaded.styleeditor', function (e, style) {
            let shouldFireStyleChange = false;
            let val = style[cssVariablesRootSelector] && style[cssVariablesRootSelector]['--styleeditor-font-family'];
            if (!val) {
                val = style[target] && style[target]['font-family'];
                shouldFireStyleChange = true; //migrate older stylesheets
            }

            if (val) {
                $selector.select2('val', val);
                $(`${selector} option:selected`).first().attr('selected', 'selected');
                if (shouldFireStyleChange) {
                    styleEditorApply(val);
                }
            }
        });

        $selector.on('change', function () {
            styleEditorApply($(this).val());
            $(`${selector} option:selected`).first().attr('selected', 'selected');
        });
    }

    return fontSelector;
});
