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
    'i18n',
    'taoQtiItem/portableElementRegistry/factory/factory',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function (_, __, portableElementRegistry, qtiElements){
    'use strict';

    /**
     * Create a ney interaction registry instance
     * interaction registry need to register newly loaded creator hooks in the list of available qti authoring elements
     *
     * @returns {Object} registry instance
     */
    return function customInteractionRegistry(){

        return portableElementRegistry({
            getAuthoringData : function getAuthoringData(typeIdentifier, options){
                let pciModel;
                options = _.defaults(options || {}, {version : 0, enabledOnly : false});
                pciModel = this.get(typeIdentifier, options.version);
                if(pciModel && pciModel.creator && pciModel.creator.hook && pciModel.creator.icon && (pciModel.enabled || !options.enabledOnly)){
                    return {
                        label : pciModel.label, //currently no translation available
                        icon : pciModel.creator.icon.replace(new RegExp('^' + typeIdentifier + '\/'), pciModel.baseUrl),
                        short : pciModel.short,
                        description : pciModel.description,
                        qtiClass : 'customInteraction.' + pciModel.typeIdentifier, //custom interaction is block type
                        tags : _.union([__('Custom Interactions')], pciModel.tags),
                        group : 'custom-interactions'
                    };
                }
            }
        }).on('creatorsloaded', function(){
            var creators = this.getLatestCreators();
            _.forEach(creators, function(creator, typeIdentifier){
                qtiElements.classes['customInteraction.' + typeIdentifier] = {parents : ['customInteraction'], qti : true};
            });
        });
    };

});