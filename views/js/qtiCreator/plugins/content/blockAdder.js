
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

/**
 * This plugin add a "plus" button below each content block to add content more easily.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/plugin',
    'taoQtiItem/qtiCreator/editor/blockAdder/blockAdder',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/portableElementRegistry/ciRegistry'
], function(_, pluginFactory, blockAdder, qtiElements, ciRegistry){
    'use strict';

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : 'blockAdder',

        /**
         * Hook to the host's init
         */
        init : function init(){

            var interactions = qtiElements.getAvailableAuthoringElements() || {};

            _.forIn(ciRegistry.getAllVersions(), function(versions, typeId){
                var data = ciRegistry.getAuthoringData(typeId, {enabledOnly : true});
                if(data && data.tags){
                    interactions[data.qtiClass] = data;
                }
            });

            this.interations = interactions;
        },

        /**
         * Hook to the host's render
         */
        render : function render(){

            //set up the block adder
            blockAdder.create(
                this.getHost().getItem(),
                this.getAreaBroker().getItemPanelArea(),
                this.interations
            );
        }
    });
});
