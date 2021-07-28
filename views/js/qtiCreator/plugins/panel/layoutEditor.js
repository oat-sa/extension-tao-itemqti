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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'core/plugin',
    'ui/tooltip',
    'tpl!taoQtiItem/qtiCreator/tpl/layoutEditor/panel',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function ($, pluginFactory, tooltip, panelTpl, contentHelper) {
    'use strict';

    const dualColClass = 'dual-column-layout';

    return pluginFactory({
        name: 'layoutEditor',
        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            const item = this.getHost().getItem();
            const $container = this.getAreaBroker().getContainer();
            // get style editor side panel
            const $stylePanel = $container.find('#sidebar-right-style-editor');

            // remove previous layout panel if exists
            $stylePanel.find('#item-editor-layout-panel').remove();

            // create item layout panel
            const $layoutEditorPanel = $(panelTpl());

            // attach to the style editor panel
            $stylePanel.append($layoutEditorPanel);

            // show tooltip
            tooltip.lookup($layoutEditorPanel);

            // get scrollable multi-column checkbox and target element
            const selector = $('#item-editor-scrollable-multi-column'),
                target = selector.data('target'),
                $scrollableMultiCol = selector.find('[name="scrollable-multi-column"]');

            const $itemEditorPanel = $('#item-editor-panel');

            /**
             * Get the qti item body dom
             *
             * @returns {JQuery}
             */
            function _getItemBody() {
                return $itemEditorPanel.find('.qti-itemBody');
            }

            /**
             * Checks scrollable multi-column checkbox if css class is present
             */
            function setMultiColCheckbox() {
                const $target = $(target);
                if ($target.hasClass(dualColClass)) {
                    $scrollableMultiCol.prop('checked', true);
                }
            }

            /**
             * Sets scrollable multi-column css class if checkbox is checked
             * @param checked
             */
            function setMultiColCssClass(checked = isMultiColChecked()) {
                const $target = $(target);
                if (checked) {
                    addClassToTarget($target, dualColClass);
                } else {
                    removeClassFromTarget($target, dualColClass);
                }
            }

            /**
             * Returns true if multi-column checkbox is checked
             *
             * @returns {boolean}
             */
            function isMultiColChecked() {
                return $scrollableMultiCol.prop('checked');
            }

            /**
             * Adds css class to the data target and updates item body
             *
             * @param {JQuery} $target - element to remove class from
             * @param {string} cssClass
             */
            function addClassToTarget($target, cssClass) {
                $target.addClass(cssClass);
                //need to update item body
                item.body(contentHelper.getContent(_getItemBody()));
            }

            /**
             * Removes css class from the data target and updates item body
             *
             * @param {JQuery} $target - element to remove class from
             * @param {string} cssClass
             */
            function removeClassFromTarget($target, cssClass) {
                $target.removeClass(cssClass);
                item.body(contentHelper.getContent(_getItemBody()));
            }

            $scrollableMultiCol.on('click', function () {
                setMultiColCssClass(this.checked);
            });

            $(document).on('ready.qti-widget', function () {
                setMultiColCheckbox();
                setMultiColCssClass();
            });
        }
    });
});
