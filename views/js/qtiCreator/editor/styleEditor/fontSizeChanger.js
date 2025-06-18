/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 */
define(['jquery', 'lodash', 'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'], function ($, _, styleEditor) {
    'use strict';

    /**
     * Changes the font size in the Style Editor
     */
    const fontSizeChanger = function () {
        const $fontSizeChanger = $('#item-editor-font-size-changer'),
            itemSelector = $fontSizeChanger.data('target'),
            figcaptionSelector = `${itemSelector} figure figcaption`,
            cssVariablesRootSelector = styleEditor.getConfig().cssVariablesRootSelector,
            $item = $(itemSelector),
            $resetBtn = $fontSizeChanger.parents('.reset-group').find('[data-role="font-size-reset"]'),
            $input = $('#item-editor-font-size-text');
        let itemFontSize = parseInt($item.css('font-size'), 10);

        /**
         * Writes new font size to virtual style sheet (or removes it)
         * @param {Number|String|null} val
         */
        const styleEditorApply = function (val) {
            const valStr = val ? `${val.toString()}px` : null;
            const varName = '--styleeditor-font-size';
            styleEditor.apply(cssVariablesRootSelector, varName, valStr);
            styleEditor.apply(itemSelector, 'font-size', valStr ? `var(${varName})` : null);
            if (val) {
                const figcaptionSize = val > 14 ? (val - 2).toString() : Math.min(val, 12).toString();
                styleEditor.apply(figcaptionSelector, 'font-size', `${figcaptionSize}px`);
            } else {
                styleEditor.apply(figcaptionSelector, 'font-size');
            }
        };

        /**
         * Handle input field
         */
        $fontSizeChanger.find('a').on('click', function (e) {
            e.preventDefault();
            if ($(this).data('action') === 'reduce') {
                if (itemFontSize <= 10) {
                    return;
                }
                itemFontSize--;
            } else {
                itemFontSize++;
            }
            styleEditorApply(itemFontSize);
            $input.val(itemFontSize);
            $(this).parent().blur();
        });

        /**
         * Disallows invalid characters
         */
        $input.on('keydown', function (e) {
            const c = e.keyCode;
            return _.includes([8, 37, 39, 46], c) || (c >= 48 && c <= 57) || (c >= 96 && c <= 105);
        });

        /**
         * Apply font size on blur
         */
        $input.on('blur', function () {
            if (this.value) {
                itemFontSize = parseInt(this.value, 10);
                styleEditorApply(itemFontSize);
            } else {
                styleEditorApply(null);
            }
        });

        /**
         * Apply font size on enter
         */
        $input.on('keydown', function (e) {
            const c = e.keyCode;
            if (c === 13) {
                $input.trigger('blur');
            }
        });

        /**
         * Remove font size from virtual style sheet
         */
        $resetBtn.on('click', function () {
            $input.val('');
            styleEditorApply(null);
            itemFontSize = parseInt($item.css('font-size'), 10);
        });

        /**
         * style loaded from style sheet
         */
        $(document).on('customcssloaded.styleeditor', function (e, style) {
            let val = style[cssVariablesRootSelector] && style[cssVariablesRootSelector]['--styleeditor-font-size'];
            if (!val) {
                val = style[itemSelector] && style[itemSelector]['font-size'];
            }

            if (val) {
                itemFontSize = parseInt(val, 10); // example 16px
                $input.val(itemFontSize);
                styleEditorApply(itemFontSize);
            } else {
                $input.val();
            }
        });
    };

    return fontSizeChanger;
});
