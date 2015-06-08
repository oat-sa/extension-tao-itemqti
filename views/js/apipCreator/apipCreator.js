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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'taoQtiItem/apipCreator/api/apipItem',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector',
    'taoQtiItem/apipCreator/editor/qtiElementSelector',
    'taoQtiItem/apipCreator/editor/formBuilder'
], function(ApipItem, inclusionOrderSelector, qtiElementSelector, formBuilder){

    function ApipCreator($container, config){
        this.$container = $container;
        this.config = config;
        this.inclusionOrderType = 'textGraphicsDefaultOrder';
        this.apipItem = new ApipItem(config.properties.xml);
    }

    ApipCreator.prototype.initLabel = function initLabel(){
        this.$container.find('#item-editor-label').html(this.config.properties.label);
    };

    ApipCreator.prototype.initInclusionOrderSelector = function initInclusionOrderSelector(){
        inclusionOrderSelector.render(this.$container.find('.item-editor-action-bar'), this.inclusionOrderType);
    };

    ApipCreator.prototype.initQtiElementSelector = function initQtiElementSelector(){
        qtiElementSelector.render(this.$container.find('#item-editor-scroll-inner'), this.apipItem.getItemBodyModel());
    };

    ApipCreator.prototype.initEvents = function initQtiElementSelector(){

        var formPopup,
            self = this;

        this.$container.on('inclusionorderactivated', function(e, inclusionOrderType){

            console.log('activated', inclusionOrderType);
            self.inclusionOrderType = inclusionOrderType;

        }).on('activated.qti-element-selector', function(e, qtiElementSerial, $element){

            //show contextual popup + load form
            var qtiElement = self.apipItem.getQtiElementBySerial(qtiElementSerial);
            if(qtiElement){

                //one popup at once
                if(formPopup){
                    formPopup.destroy();
                }

                //build form popup and keep the reference for later
                formPopup = formBuilder.build($element, qtiElement, self.inclusionOrderType);

            }else{
                throw 'qti element not found in the apipItem model';
            }

        }).on('deactivated.qti-element-selector', function(){

            //destroy contextual popup
            //one popup at once
            if(formPopup){
                formPopup.destroy();
            }
        });
    };

    return ApipCreator;
});