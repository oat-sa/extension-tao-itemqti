
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'core/plugin',
    'taoQtiItem/qtiCreator/editor/blockAdder/blockAdder',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry'
], function(_, pluginFactory, blockAdder, qtiElements, ciRegistry){
    'use strict';

    return pluginFactory({
        name : 'blockAdder',

        init : function init(){

            var customInterations = this.getHost().getCustomInteractions();
            var interactions = qtiElements.getAvailableAuthoringElements();

            _.forEach(customInterations, function(interactionModel){
                var data = ciRegistry.getAuthoringData(interactionModel.getTypeIdentifier());
                if(data.tags){
                    interactions[data.qtiClass] = data;
                }
            });
            this.interations = interactions;
        },

        render : function render(){
            var item = this.getHost().getItem();

            blockAdder.create(
                this.getHost().getItem(),
                this.getAreaBroker().getItemPanelArea(),
                this.interations
            );
        }
    });
});
