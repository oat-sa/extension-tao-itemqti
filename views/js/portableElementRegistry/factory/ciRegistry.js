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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'taoQtiItem/portableElementRegistry/factory/factory',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function (_, portableElementRegistry, qtiElements){
    'use strict';

    /**
     * Create a ney interaction registry instance
     * interaction registry need to register newly loaded creator hooks in the list of available qti authoring elements
     *
     * @returns {Object} registry instance
     */
    return function customInteractionRegistry(){

        return portableElementRegistry({
            getAuthoringData : function getAuthoringData(typeIdentifier, version){
                var pciModel = this.get(typeIdentifier, version);
                if(pciModel && pciModel.creator && pciModel.creator.hook && pciModel.creator.icon){
                    return {
                        label : pciModel.label, //currently no translation available
                        icon : pciModel.creator.icon.replace(new RegExp('^' + typeIdentifier + '\/'), pciModel.baseUrl),
                        short : pciModel.short,
                        description : pciModel.description,
                        qtiClass : 'customInteraction.' + pciModel.typeIdentifier, //custom interaction is block type
                        tags : _.union(['Custom Interactions'], pciModel.tags)
                    };
                }
            }
        }).on('creatorsloaded', function(creators){
            _.each(creators, function(creator){
                qtiElements.classes['customInteraction.' + creator.getTypeIdentifier()] = {parents : ['customInteraction'], qti : true};
            });
        });
    }

});