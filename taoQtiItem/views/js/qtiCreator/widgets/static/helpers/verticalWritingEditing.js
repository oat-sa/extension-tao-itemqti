/**
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
 * Copyright (c) 2020-2021 (original work) Open Assessment Technologies SA ;
 */

define([
    'i18n',
    'jquery',
    'taoQtiItem/qtiCreator/helper/languages',
    'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting'
], function (__, $, languages, verticalWriting) {
    'use strict';

    return {
        /**
         * @param {Object} widget
         * @returns {Promise<{isSupported: boolean, isItemVertical: boolean}>}
         */
        checkItemWritingMode: function (widget) {
            const rootElement = widget.element.getRootElement();
            const itemLang = rootElement.attr('xml:lang');

            return languages.getVerticalWritingModeByLang(itemLang).then(supportedVerticalMode => {
                return {
                    isVerticalSupported: supportedVerticalMode === 'vertical-rl',
                    isItemVertical: !!rootElement.hasClass(verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS)
                };
            });
        }
    };
});
