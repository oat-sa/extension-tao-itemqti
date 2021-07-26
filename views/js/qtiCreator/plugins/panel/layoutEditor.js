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
    'tpl!taoQtiItem/qtiCreator/tpl/layoutEditor/panel',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function ($, pluginFactory, panelTpl, contentHelper) {
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
            const $stylePanel = $container.find('#sidebar-right-style-editor');
            let $layoutEditorPanel;

            $stylePanel.find('#item-editor-layout-panel').remove();

            //create new one
            $layoutEditorPanel = $(panelTpl());

            //attach to response form side panel
            $stylePanel.append($layoutEditorPanel);

            const selector = $('#item-editor-scrollable-multi-column'),
                $itemEditorPanel = $('#item-editor-panel'),
                target = selector.data('target'),
                $scrollableMultiCol = selector.find('[name="scrollable-multi-column"]');

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
                $scrollableMultiCol.prop('checked', $target.hasClass(dualColClass));
            }

            /**
             * Sets scrollable multi-column css class if checkbox is checked
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
             */
            function isMultiColChecked() {
                return $scrollableMultiCol.prop('checked');
            }

            /**
             * Adds css class to the data target and updates item body
             *
             * @param $target element to add class to
             * @param cssClass string
             */
            function addClassToTarget($target, cssClass) {
                $target.addClass(cssClass);

                //need to update item body
                item.body(contentHelper.getContent(_getItemBody()));
            }

            /**
             * Removes css class from the data target and updates item body
             *
             * @param $target element to remove class from
             * @param cssClass string
             */
            function removeClassFromTarget($target, cssClass) {
                $target.removeClass(cssClass);

                // need to update item body
                item.body(contentHelper.getContent(_getItemBody()));
            }

            $scrollableMultiCol.on('click', function () {
                setMultiColCssClass(this.checked);
            });

            $(document)
                .on('ready.qti-widget', function () {
                    setMultiColCheckbox();
                })
                .on('elementCreated.qti-widget', function () {
                    setMultiColCssClass();
                });
        }
    });
});
