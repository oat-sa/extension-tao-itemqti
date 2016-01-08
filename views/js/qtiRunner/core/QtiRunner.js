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
 * Copyright (c) 2013 (original work) Open Assessment Techonologies SA (under the project TAO-PRODUCT);
 *
 *
 */
/**
 * A class to regroup QTI functionalities
 *
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 * @package taoItems
 * @requires jquery {@link http://www.jquery.com}
 */
define([
    'jquery',
    'lodash',
    'context',
    'core/promise',
    'iframeNotifier',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/helper/pci',
    'taoQtiItem/qtiItem/helper/container',
    'taoQtiItem/qtiItem/core/feedbacks/ModalFeedback',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackPreviewButton',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackDeliveryButton',
], function($, _, context, Promise, iframeNotifier, ItemLoader, pci, containerHelper, ModalFeedback, previewOkBtn, deliveryOkBtn){
    'use strict';

    var timeout = (context.timeout > 0 ? context.timeout + 1 : 30) * 1000;

    var QtiRunner = function(){
        this.item = null;
        this.rpEngine = null;
        this.renderer = null;
        this.loader = null;
        this.itemApi = undefined;
    };

    QtiRunner.prototype.updateItemApi = function() {
        var responses = this.getResponses();
        var states = this.getStates();
        // Transform responses into state variables.
        for (var key in states) {

        	var value = states[key];
        	// This is where we set variables that will be collected and stored
        	// as the Item State. We do not want to store large files into
        	// the state, and force the client to download these files
        	// all over again. We then transform them as a place holder, that will
        	// simply indicate that a file composes the state.

        	if (value.response && typeof(value.response.base) !== 'undefined') {

                for (var property in value.response.base) {

                    if (property === 'file') {

                        var file = value.response.base.file;
                        // QTI File found! Replace it with an appropriate placeholder.
                        // The data is base64('qti_file_datatype_placeholder_data')
                        value.response = {"base" : {"file" : {"name" : file.name, "mime" : 'qti+application/octet-stream', "data" : "cXRpX2ZpbGVfZGF0YXR5cGVfcGxhY2Vob2xkZXJfZGF0YQ=="}}};
                    }
                }
            }

            this.itemApi.setVariable(key, value);
        }

        // Save the responses that will be used for response processing.
        this.itemApi.saveResponses(responses);
        this.itemApi.resultApi.setQtiRunner(this);
    };

    QtiRunner.prototype.setItemApi = function(itemApi){
        this.itemApi = itemApi;
        var that = this;
        var oldStateVariables = JSON.stringify(itemApi.stateVariables);

        itemApi.onKill(function(killCallback) {
            // If the responses did not change,
            // just close gracefully.

            // Collect new responses and update item API.
            that.updateItemApi();
            var newStateVariables = JSON.stringify(itemApi.stateVariables);

            // Store the results.
            if (oldStateVariables !== newStateVariables) {
                itemApi.submit(function() {
                    // Send successful signal.
                    killCallback(0);
                });
            }
            else {
                killCallback(0);
            }
        });
    };

    QtiRunner.prototype.setRenderer = function(renderer){
        if(renderer.isRenderer){
            this.renderer = renderer;
        }else{
            throw 'invalid renderer';
        }
    };

    QtiRunner.prototype.getLoader = function(){
        if(!this.loader){
            this.loader = new ItemLoader();
        }
        return this.loader;
    };

    QtiRunner.prototype.loadItemData = function(data, callback){
        var self = this;
        this.getLoader().loadItemData(data, function(item){
            self.item = item;
            callback(self.item);
        });
    };

    QtiRunner.prototype.loadElements = function(elements, callback){
        if(this.getLoader().item){
            this.getLoader().loadElements(elements, callback);
        }else{
            throw 'QtiRunner : cannot load elements in empty item';
        }
    };

    QtiRunner.prototype.renderItem = function(data, done){

        var self = this;

        done = _.isFunction(done) ? done : _.noop;

        var render = function(){
            if(!self.item){
                throw 'cannot render item: empty item';
            }
            if(self.renderer){

                self.renderer.load(function(){

                    self.item.setRenderer(self.renderer);
                    self.item.render({}, $('#qti_item'));

                    // Race between postRendering and timeout
                    // postRendering waits for everything to be resolved or one reject
                    Promise.race([
                        Promise.all(self.item.postRender()),
                        new Promise(function(resolve, reject){
                            _.delay(reject, timeout, new Error('Post rendering ran out of time.'));
                        })
                    ])
                    .then(function(){
                        self.item.getContainer().on('responseChange', function(e, data){
                            if(data.interaction && data.interaction.attr('responseIdentifier') && data.response){
                                iframeNotifier.parent('responsechange', [data.interaction.attr('responseIdentifier'), data.response]);
                            }
                        });

                        self.initInteractionsResponse();
                        self.listenForThemeChange();
                        done();

                    })
                    .catch(function(err){

                        //in case of postRendering issue, we are also done
                        done();

                        throw new Error('Error in post rendering : ' + err);
                    });

                }, self.getLoader().getLoadedClasses());

            }else{
                throw 'cannot render item: no rendered set';
            }
        };

        if(typeof data === 'object'){
            this.loadItemData(data, render);
        }else{
            render();
        }
    };

    QtiRunner.prototype.initInteractionsResponse = function(){
        var self = this;
        if(self.item){
            var interactions = self.item.getInteractions();
            for(var i in interactions){
                var interaction = interactions[i];
                var responseId = interaction.attr('responseIdentifier');
                self.itemApi.getVariable(responseId, function(values){
                    if(values){
                        interaction.setState(values);
                        iframeNotifier.parent('stateready', [responseId, values]);
                    }
                    else{
                        var states = self.getStates();
                        if(_.indexOf(states, responseId)){
                            self.itemApi.setVariable(responseId, states[responseId]);
                            interaction.setState(states[responseId]);
                            iframeNotifier.parent('stateready', [responseId, states[responseId]]);
                        }
                    }
                });
            }
        }
    };

    /**
     * If an event 'themechange' bubbles to "#qti_item" node
     * then we tell the renderer to switch the theme.
     */
    QtiRunner.prototype.listenForThemeChange = function listenForThemeChange(){
        var self = this;
        var $container = this.renderer.getContainer(this.item);
        if(!$container.length){
            $container = $('.qti-item');
        }
        $container
            .off('themechange')
            .on('themechange', function(e, themeName){
                var themeLoader = self.renderer.getThemeLoader();
                themeName = themeName || e.originalEvent.detail;
                if(themeLoader){
                    themeLoader.change(themeName);
                }
            });
    };

    QtiRunner.prototype.validate = function(){
        this.updateItemApi();
        this.itemApi.finish();
    };

    QtiRunner.prototype.getResponses = function() {

        var responses = {};
        var interactions = this.item.getInteractions();

        _.forEach(interactions, function(interaction){
            var response = {};
            try {
                response = interaction.getResponse();
            } catch(e){
                console.error(e);
            }
            responses[interaction.attr('responseIdentifier')] = response;
        });

        return responses;
    };

    QtiRunner.prototype.getStates = function() {

        var states = {};
        var interactions = this.item.getInteractions();

        _.forEach(interactions, function(interaction){
            var state = {};
            try {
                state = interaction.getState();
            } catch(e){
                console.error(e);
            }
            states[interaction.attr('responseIdentifier')] = state;
        });

        return states;
    };

    QtiRunner.prototype.setResponseProcessing = function(callback){
        this.rpEngine = callback;
    };

    QtiRunner.prototype.showFeedbacks = function(itemSession, callback, onShowCallback){
        
        var count = 0;
        var inlineDisplay = true;
        var self = this;
        
        if(inlineDisplay){
            
            var interactionsDisplayInfo = {};
            var messages = {};
            var renderedFeebacks = [];
            var $itemContainer = this.item.getContainer();
            _.each(this.item.getComposingElements(), function(element){
                if(element.is('interaction')){
                    var $interactionContainer = element.getContainer();
                    var messageGroupId = element.attr('responseIdentifier');
                    var $displayContainer = $interactionContainer;
                    
                    if(element.is('inlineInteraction')){
                        $displayContainer = $interactionContainer.closest('[class*=" col-"], [class^="col-"]');
                        messageGroupId = $displayContainer.attr('data-messageGroupId');
                        if(!messageGroupId){
                            //generate a messageFroupId
                            messageGroupId = _.uniqueId('inline_message_group_');
                            $displayContainer.attr('data-messageGroupId', messageGroupId);
                        }
                    }
                    
                    interactionsDisplayInfo[element.attr('responseIdentifier')] = {
                        displayContainer : $displayContainer,
                        interactionContainer : $interactionContainer,
                        messageGroupId : messageGroupId
                    };
                }
            });
            
            _.each(this.item.modalFeedbacks, function(feedback){
                
                var feedbackIds, message, $container, comparedOutcome, messageGroup, _currentMessageGroupId;
                var outcomeIdentifier = feedback.attr('outcomeIdentifier');
                
                //verify if the feedback should be displayed
                if(itemSession[outcomeIdentifier]){
                    
                    //is the feedback in the list of feedbacks to be displayed ?
                    feedbackIds = pci.getRawValues(itemSession[outcomeIdentifier]);
                    if(_.indexOf(feedbackIds, feedback.id()) === -1){
                        return true;//continue with next feedback
                    }
                    
                    //which group of feedbacks (interaction related) the feedback belongs to ?
                    message = getFeedbackMessageSignature(feedback);
                    comparedOutcome = containerHelper.getEncodedData(feedback, 'relatedOutcome');
                    if(comparedOutcome && interactionsDisplayInfo[comparedOutcome]){
                        $container =  interactionsDisplayInfo[comparedOutcome].displayContainer;
                        _currentMessageGroupId = interactionsDisplayInfo[comparedOutcome].messageGroupId;
                    }else{
                        $container = $itemContainer;
                        _currentMessageGroupId = '__item__';
                    }
                    //is this message already displayed ?
                    if(!messages[_currentMessageGroupId]){
                        messages[_currentMessageGroupId] = [];
                    }
                    if(_.indexOf(messages[_currentMessageGroupId], message) >= 0){
                        return true; //continue
                    }else{
                        messages[_currentMessageGroupId].push(message);
                    }
                    
                    //ok, display feedback
                    count++;
                    
                    //load (potential) new qti classes used in the modal feedback (e.g. math, img)
                    self.renderer.load(function(){
                        
                        var $modalFeedback = $itemContainer.find('#' + feedback.getSerial());
                        if (!$modalFeedback.length) {
                            //render the modal feedback
                            $modalFeedback = $(feedback.render({
                                inline : true
                            }));
                            $container.append($modalFeedback);
                        }else{
                            //already rendered, just show it
                            $modalFeedback.show();
                        }
                        
                        //record rendered feedback for later reference
                        renderedFeebacks.push({
                            identifier : feedback.id(),
                            serial : feedback.getSerial(),
                            dom : $modalFeedback
                        });
                        
                    }, self.getLoader().getLoadedClasses());
                    
                }
            });
            
            //if any feedback is displayed, replace the controls by a "ok" button
            if(count){
                if($itemContainer.parents('.tao-preview-scope').length){
                    //preview
                    var $scope = window.parent.parent.$('#preview-console');
                    var $controls = $scope.find('.preview-console-header .action-bar li:visible');
                    $controls.hide();
                    var $ok = $(previewOkBtn()).click(function(){
                        
                        //end feedback mode, hide feedbacks
                        _.each(renderedFeebacks, function(fb){
                            fb.dom.hide();
                        });
                        
                        //restore controls
                        uncover([$itemContainer]);
                        $ok.remove();
                        $controls.show();
                        
                        //exec callback
                        callback();
                    });
                    $scope.find('.console-button-action-bar').append($ok);
                    cover([$itemContainer]);
                }else{
                    //delivery
                    var $scope = window.parent.parent.$('body.qti-test-scope .bottom-action-bar');
                    var $controls = $scope.find('li:visible');
                    $controls.hide();
                    var $ok = $(deliveryOkBtn()).click(function(){
                        
                        //end feedback mode, hide feedbacks
                        _.each(renderedFeebacks, function(fb){
                            fb.dom.hide();
                        });
                        
                        //restore controls
                        $ok.remove();
                        $controls.show();
                        
                        //exec callback
                        callback();
                    });
                    $scope.find('.navi-box-list').append($ok);
                }
                
                if (_.isFunction(onShowCallback)) {
                    onShowCallback();
                }
            }
                        
        }else{
            
            //currently only modal feedbacks are available
            var lastFeedback,
                messages = [],
                feedbacksToBeDisplayed = [];

            //find which modal feedbacks should be displayed according to the current item session:
            _.each(this.item.modalFeedbacks, function(feedback){
                
                var feedbackIds, message;
                var outcomeIdentifier = feedback.attr('outcomeIdentifier');
                
                if(itemSession[outcomeIdentifier]){
                    feedbackIds = pci.getRawValues(itemSession[outcomeIdentifier]);
                    message = getFeedbackMessageSignature(feedback);
                    if(_.indexOf(feedbackIds, feedback.id()) >= 0 && _.indexOf(messages, message) === -1){
                        //check content if is already in the display queue
                        feedbacksToBeDisplayed.push(feedback);
                        messages.push(message);
                    }
                }
            });

            //record the number of feedbacks to be displayed:
            count = feedbacksToBeDisplayed.length;
            
            if (count > 0 && _.isFunction(onShowCallback)) {
                onShowCallback();
            }

            //show in reverse order
            lastFeedback = feedbacksToBeDisplayed.shift();//the last feedback to be shown is the first defined in the item
                _.eachRight(feedbacksToBeDisplayed, function(feedback){
                self.showModalFeedback(feedback);
            });

            //add callback to the last shown modal feedback
            this.showModalFeedback(lastFeedback, callback);
        }

        return count;
    };

    QtiRunner.prototype.showModalFeedback = function(modalFeedback, callback){
        var $modalFeedback,
            $modalFeedbackBox = $('#modalFeedbacks');

        if(modalFeedback instanceof ModalFeedback){
            //load (potential) new qti classes used in the modal feedback (e.g. math, img)
            this.renderer.load(function(){
                $modalFeedback = $modalFeedbackBox.find('#' + modalFeedback.getSerial());
                if (!$modalFeedback.length) {
                    //render the modal feedback
                    $modalFeedback = modalFeedback.render();
                    $modalFeedbackBox.append($modalFeedback);
                } else {
                    $modalFeedback.modal();
                }
                modalFeedback.postRender({
                    callback : callback
                });
            }, this.getLoader().getLoadedClasses());
        }
    };
    
    /**
     * Provide the feedbackMessage signature to check if the feedback contents should be considered equals
     * 
     * @param {type} feedback
     * @returns {String}
     */
    function getFeedbackMessageSignature(feedback){
        return (''+feedback.body()+feedback.attr('title')).toLowerCase().trim().replace(/x-tao-relatedoutcome-[a-zA-Z0-9\-._]*/,'');
    }
    
    function cover(interactionContainers){
        var $cover = $('<div class="interaction-cover modal-bg">').css({
            display : 'block',
            opacity : 0.05
//            background : 'none'
        });
        _.each(interactionContainers, function($interaction){
            $interaction.append($cover);
        });
    }
    
    function uncover(interactionContainers){
        _.each(interactionContainers, function($interaction){
            $interaction.find('.interaction-cover').remove();
        });
    }
    
    return QtiRunner;
});
