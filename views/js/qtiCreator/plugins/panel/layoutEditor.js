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
 * Copyright (c) 2021-2024 (original work) Open Assessment Technologies SA ;
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
    const separatorClass = 'separator-between-columns';

    return pluginFactory({
        name: 'layoutEditor',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            const qtiCreatorProperties = this.getHost().getConfig().properties || {};
            const multiColEnabled = qtiCreatorProperties['scrollable-multi-column'];
            const separatorEnabled = qtiCreatorProperties['separator-between-columns'];

            const item = this.getHost().getItem();
            const $container = this.getAreaBroker().getContainer();
            // get style editor side panel
            const $stylePanel = $container.find('#sidebar-right-style-editor');

            // remove previous layout panel if exists
            $stylePanel.find('#item-editor-layout-panel').remove();

            // create item layout panel
            const tplData = {
                multiColEnabled,
                separatorEnabled
            };
            const $layoutEditorPanel = $(panelTpl(tplData));

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
             * Encapsulate the separator-between-columns checkbox logic
             * (Only used if separatorEnabled is true)
             */
            const separatorManager = {
                $panel: $('#item-editor-separator-between-columns'),
                // set on separatorManager init:
                $checkbox: null,
                $target: null,

                /**
                 * Sets checkbox state based on item class
                 */
                setCheckBox() {
                    if (item.hasClass(separatorClass)) {
                        this.$checkbox.prop('checked', true);
                    }
                },

                /**
                 * Checks checkbox state
                 */
                isCheckboxChecked() {
                    return this.$checkbox.prop('checked');
                },

                /**
                 * Sets correct class to item model's itemBody and itemBody DOM element
                 */
                setTargetClass(checked) {
                    if (checked) {
                        item.addClass(separatorClass);
                        addClassToTarget(this.$target, separatorClass);
                    } else {
                        item.removeClass(separatorClass);
                        removeClassFromTarget(this.$target, separatorClass);
                    }
                    console.log('setTargetClass ran');
                },

                /**
                 * Runs on editor init to set the correct checkbox state and classes
                 * and wires up checkbox
                 */
                init() {
                    this.$checkbox = this.$panel.find('[name="separator-between-columns"]');
                    this.$target = $itemEditorPanel.find(this.$panel.data('target'));

                    this.setCheckBox();
                    this.setTargetClass(this.isCheckboxChecked());

                    this.$checkbox.on('click', e => {
                        console.log('onclick');
                        this.setTargetClass(e.target.checked);
                    });
                    console.log('init ran');
                }
            };


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

            $container.on('ready.qti-widget', function () {
                setMultiColCheckbox();
                setMultiColCssClass();
                if (separatorEnabled) {
                    separatorManager.init();
                }
                $container.trigger('initDone.layout-editor');
            });
        }
    });
});
