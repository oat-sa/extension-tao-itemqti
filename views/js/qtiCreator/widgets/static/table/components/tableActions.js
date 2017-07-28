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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'ui/component',
    'ui/component/placeable',
    'tpl!taoQtiItem/qtiCreator/widgets/static/table/components/tableActions'
], function(_, $, componentFactory, makePlaceable, tpl) {
    'use strict';

    var defaultConfig = {
        'delete': true,
        'insertRow': false,
        'insertCol': false
    };

    var tableActionsApi = {
        hideDelete: function hideDelete() {
            var $component = this.getElement(),
                $delete = $component.find('[data-role="delete"]');

            $delete.hide();
        },

        showDelete: function hideDelete() {
            var $component = this.getElement(),
                $delete = $component.find('[data-role="delete"]');

            $delete.show();
        }
    };

    function click(eventName) {
        var self = this;
        return function(event) {
            event.stopPropagation();
            self.trigger(eventName);
        };
    }

    function mousedown() {
        return function(event) {
            event.stopPropagation();
        };
    }

    return function tableActionsFactory(config) {
        var tableActionsComponent;

        config = _.defaults(config || {}, defaultConfig);

        tableActionsComponent = componentFactory(tableActionsApi, config)
            .setTemplate(tpl)
            .on('render', function() {
                var self = this,
                    $component = this.getElement(),
                    $delete    = $component.find('[data-role="colRowDelete"]'),
                    $insertRow = $component.find('[data-role="insertRow"]'),
                    $insertCol = $component.find('[data-role="insertCol"]');

                if (this.config.delete) {
                    $delete.on('mousedown', mousedown.call());
                    $delete.on('click', click.call(self, 'delete'));
                } else {
                    $delete.hide();
                }

                if (this.config.insertRow) {
                    $insertRow.on('mousedown', mousedown.call());
                    $insertRow.on('click', click.call(self, 'insertRow'));
                } else {
                    $insertRow.hide();
                }

                if (this.config.insertCol) {
                    $insertCol.on('mousedown', mousedown.call());
                    $insertCol.on('click', click.call(self, 'insertCol'));
                } else {
                    $insertCol.hide();
                }
            });

        makePlaceable(tableActionsComponent);

        return tableActionsComponent.init();
    };
});