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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *
 */

/**
 * Helpers for portable elements
 *
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/helper/util'
], function(_, $, util){
    'use strict';

    /**
     * Get common methods to augment a portableElement implementation
     *
     * @param {object} registry
     * @returns {object}
     */
    function getDefaultMethods(registry){

        return {
            getDefaultAttributes : function(){
                return {};
            },
            getDefaultProperties : function(){
                
                var creator = registry.getCreator(this.typeIdentifier);
                if(creator && creator.module && _.isFunction(creator.module.getDefaultProperties)){
                    return creator.getDefaultProperties(this);
                }else{
                    return {};
                }
            },
            afterCreate : function(){

                var typeId = this.typeIdentifier,
                    creator = registry.getCreator(typeId),
                    creatorModule = creator.module,
                    response;

                //set default markup (for initial rendering)
                creatorModule.getMarkupTemplate();

                //set pci props
                this.properties = creatorModule.getDefaultProperties();

                //@todo fix this !
                if(creator.response && _.size(creator.response)){//for custom interaciton only
                    //create response
                    response = this.createResponse({
                        cardinality : creator.response.cardinality
                    });
                    
                    //the base type is optional
                    if(creator.response.baseType){
                        response.attr('baseType', creator.response.baseType);
                    }
                } else {
                    //the attribute is mandatory for info control
                    this.attr('title', creator.label);

                    //we ensure the info control has an identifier
                    if(!this.attr('id')){
                        this.attr('id', util.buildId(this.getRelatedItem(), typeId));
                    }
                }

                //set markup
                this.markup = this.renderMarkup();

                //set pci namespace to item
                this.getNamespace();

                //after create
                //@todo need afterCreate() to return a promise
                if(_.isFunction(creatorModule.afterCreate)){
                    return creatorModule.afterCreate(this);
                }
            },
            renderMarkup : function(){

                var creatorModule = registry.getCreator(this.typeIdentifier).module,
                    markupTpl = creatorModule.getMarkupTemplate(),
                    markupData = this.getDefaultMarkupTemplateData();

                if(_.isFunction(creatorModule.getMarkupData)){
                    //extends the default data with the custom one
                    markupData = creatorModule.getMarkupData(this, markupData);
                }

                return markupTpl(markupData);
            },
            updateMarkup : function(){
                this.markup = this.renderMarkup();
            }
        };
    }

    return {
        getDefaultMethods : getDefaultMethods
    };
});
