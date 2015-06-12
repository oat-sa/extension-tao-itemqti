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
    'jquery',
    'helpers',
    'ui/feedback',
    'taoQtiItem/apipCreator/api/apipItem',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector',
    'taoQtiItem/apipCreator/editor/qtiElementSelector',
    'taoQtiItem/apipCreator/editor/formBuilder'
], function($, helpers, feedback, ApipItem, inclusionOrderSelector, qtiElementSelector, formBuilder){
    
    var _ns = '.apip-creator';
    
    function ApipCreator($container, config){
        this.$container = $container;
        this.config = config;
        this.inclusionOrderType = 'textGraphicsDefaultOrder';//initial selected inclusion order
        this.apipItem = new ApipItem(config.properties.xml, {id : config.id});
		this.elementSelector;    
	}

    ApipCreator.prototype.initLabel = function initLabel(){
        this.$container.find('#item-editor-label').html(this.config.properties.label);
    };

    ApipCreator.prototype.initInclusionOrderSelector = function initInclusionOrderSelector(){
        inclusionOrderSelector.render(this.$container.find('.item-editor-action-bar'), this.inclusionOrderType);
    };

    ApipCreator.prototype.initQtiElementSelector = function initQtiElementSelector(){
        this.elementSelector = qtiElementSelector.render(this.$container.find('#item-editor-scroll-inner'), this.apipItem.getItemBodyModel());
        this.refreshVisualApipFeatures();
    };

    ApipCreator.prototype.initEvents = function initEvents(){

        var formPopup,
            self = this;

        this.$container.on('activated.inclusion-order-selector', function(e, inclusionOrderType){

            self.inclusionOrderType = inclusionOrderType;

            //blur the current selected element
            self.elementSelector.deactivate();
            self.refreshVisualApipFeatures();
            
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
            
        }).on('done.contextual-popup', function(){
            //done editing
            //blur the current selected element
            self.elementSelector.deactivate();
            
        }).on('formready.form-builder', function(){
            
            //refresh the vial apip features here because a new access element might have been created when init the form
            //@todo could be improved by only listening to event of new access element info creation
            self.refreshVisualApipFeatures();
            
        }).on('destroy.apip-from', function(){
            
            self.elementSelector.deactivate();
            if(formPopup){
                formPopup.destroy();
            }
            //@todo could be improved by only listening to event of new access element info deletion
            self.refreshVisualApipFeatures();
        });
    };
    
    /**
     * Init the save trigger event 'on click'
     * 
     * @fires ApipCreator#saved.apip-creator - when the save is successful
     * @returns {undefined}
     */
    ApipCreator.prototype.initSave = function initSave(){
        var self = this;
        this.$container.find('#save-trigger').off('click').on('click', function(){
            var $trigger = $(this);
            self.save().done(function(r){
                if(r && r.success){
                    feedback().success('Item saved');
                    $trigger.trigger('saved'+_ns, [r.xml]);
                }else{
                    feedback().error('Item cannot be saved');
                }
            });
        });
    };
    
    /**
     * Save the item + apip content to the server
     * 
     * @returns {jqXHR} 
     */
    ApipCreator.prototype.save = function save(){
        var itemUri = this.config.properties.uri;
        var lang = this.config.properties.lang;
        var xml = this.apipItem.toXML();
        return $.ajax({
            url : helpers._url('save', 'ApipCreator', 'taoQtiItem', {id : itemUri, lang : lang}),
            type : 'POST',
            contentType : 'text/xml',
            dataType : 'json',
            data : xml
        });
    };
    
    ApipCreator.prototype.refreshVisualApipFeatures = function(){
        qtiElementSelector.resetApipFeatures(this.$container);
        qtiElementSelector.setApipFeatures(this.$container, this.apipItem, this.inclusionOrderType);
    };
    
    return ApipCreator;
});