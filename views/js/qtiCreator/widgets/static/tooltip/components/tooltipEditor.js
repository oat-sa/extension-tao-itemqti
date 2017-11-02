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
    'tpl!taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(_, $, componentFactory, makePlaceable, tpl) {
    'use strict';

    var defaultConfig = {

    };

    var tooltipEditorApi = {

    };

    return function tooltipEditorFactory(config) {
        var tooltipEditorComponent;

        config = _.defaults(config || {}, defaultConfig);

        tooltipEditorComponent = componentFactory(tooltipEditorApi, config)
            .setTemplate(tpl)
            .on('render', function() {
                var self = this,
                    $component = self.getElement();

            });

        makePlaceable(tooltipEditorComponent);

        return tooltipEditorComponent.init();
    };
});