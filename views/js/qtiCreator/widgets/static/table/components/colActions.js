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
    'jquery',
    'ui/component',
    'ui/component/placeable',
    'tpl!taoQtiItem/qtiCreator/widgets/static/table/components/colActions'
], function($, componentFactory, makePlaceable, tpl) {
    'use strict';

    return function colActionsComponentFactory($container) {
        var colActionsComponent = componentFactory({}, {})
            .setTemplate(tpl)
            .on('render', function() {
                var self = this,
                    $component = this.getElement();

                $component.find('[data-role="delete"]').on('mousedown', function(e) { //todo: do we need mousedown?
                    e.stopPropagation();
                    self.trigger('deleteCol');
                });
                $component.find('[data-role="insertCol"]').on('mousedown', function(e) {
                    e.stopPropagation();
                    self.trigger('insertCol');
                });
            })
            .on('destroy', function() {
                //todo
            });

        makePlaceable(colActionsComponent);

        return colActionsComponent.init({
            renderTo: $container
        });
    };
});