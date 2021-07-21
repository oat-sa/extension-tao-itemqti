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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 *
 */
define(['jquery', 'lodash', 'taoQtiItem/qtiCreator/editor/gridEditor/content'], function ($, _, contentHelper) {
    'use strict';

    const dualColClass = 'dual-column-layout';
    const multiColConfigKey = 'scrollable-multi-column';

    /**
     * Activate a specific item layout template so that my item will have a
     * scrollable multi-column layout without nested scrollbars
     */
    const layoutSelector = function (item, config) {
        const selector = $('#item-editor-scrollable-multi-column'),
            target = selector.data('target'),
            $target = $(target),
            scrollableMultiCol = selector.find('[name="scrollable-multi-column"]');

        /**
         * Check scrollable multi-column checkbox if enabled in config
         */
        if (config[multiColConfigKey]) {
            scrollableMultiCol.prop('checked', true);
        }

        /**
         * Get the qti item body dom
         *
         * @returns {JQuery}
         */
        function _getItemBody() {
            return $('#item-editor-panel').find('.qti-itemBody');
        }

        /**
         * Adds css class to the data target and updates item body
         *
         * @param cssClass string
         */
        function addClassToTarget (cssClass) {
            $target.addClass(cssClass);

            //need to update item body
            item.body(contentHelper.getContent(_getItemBody()));
        }

        /**
         * Removes css class from the data target and updates item body
         *
         * @param cssClass string
         */
        function removeClassFromTarget (cssClass) {
            $target.removeClass(cssClass);

            //need to update item body
            item.body(contentHelper.getContent(_getItemBody()));
        }

        scrollableMultiCol.on('click', function () {
            if(this.checked) {
                addClassToTarget(dualColClass);
            } else {
                removeClassFromTarget(dualColClass);
            }
        });
    };
    return layoutSelector;
});
