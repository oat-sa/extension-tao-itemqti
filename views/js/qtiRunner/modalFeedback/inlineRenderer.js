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
 * Copyright (c) 2015 (original work) Open Assessment Techonologies SA;
 *
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/helper/pci',
    'taoQtiItem/qtiItem/helper/container',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackPreviewButton',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackDeliveryButton'
], function(_, $, pci, containerHelper, previewOkBtn, deliveryOkBtn){
    'use scrict';

    function extractDisplayInfo(interaction){

        var $interactionContainer = interaction.getContainer();
        var responseIdentifier = interaction.attr('responseIdentifier');
        var messageGroupId, $displayContainer;

        if(interaction.is('inlineInteraction')){
            $displayContainer = $interactionContainer.closest('[class*=" col-"], [class^="col-"]');
            messageGroupId = $displayContainer.attr('data-messageGroupId');
            if(!messageGroupId){
                //generate a messageFroupId
                messageGroupId = _.uniqueId('inline_message_group_');
                $displayContainer.attr('data-messageGroupId', messageGroupId);
            }
        }else{
            messageGroupId = responseIdentifier;
            $displayContainer = $interactionContainer;
        }

        return {
            responseIdentifier : responseIdentifier,
            interactionContainer : $interactionContainer,
            displayContainer : $displayContainer,
            messageGroupId : messageGroupId
        };
    }

    function showFeedbacks(item, loader, renderer, itemSession, callback, onShowCallback){

        var count = 0;
        var interactionsDisplayInfo = {};
        var messages = {};
        var renderedFeebacks = [];
        var $itemContainer = item.getContainer();

        _.each(item.getComposingElements(), function(element){
            if(element.is('interaction')){
                interactionsDisplayInfo[element.attr('responseIdentifier')] = extractDisplayInfo(element);
            }
        });

        _.each(item.modalFeedbacks, function(feedback){

            var feedbackIds, message, $container, comparedOutcome, _currentMessageGroupId;
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
                    $container = interactionsDisplayInfo[comparedOutcome].displayContainer;
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

                renderModalFeedback(feedback, loader, renderer, $container, $itemContainer, function(renderingData){
                    //record rendered feedback for later reference
                    renderedFeebacks.push(renderingData);
                });
            }
        });


        if(count){
            //if any feedback is displayed, replace the controls by a "ok" button
            replaceControl(renderedFeebacks, $itemContainer, callback);

            //if an optional "on show modal" callback has been provided, execute it
            if(_.isFunction(onShowCallback)){
                onShowCallback();
            }
        }

        return count;

    }

    function renderModalFeedback(feedback, loader, renderer, $container, $itemContainer, renderedCallback){

        //load (potential) new qti classes used in the modal feedback (e.g. math, img)
        renderer.load(function(){

            var $modalFeedback = $itemContainer.find('#' + feedback.getSerial());
            if(!$modalFeedback.length){
                //render the modal feedback
                $modalFeedback = $(feedback.render({
                    inline : true
                }));
                $container.append($modalFeedback);
            }else{
                //already rendered, just show it
                $modalFeedback.show();
            }

            renderedCallback({
                identifier : feedback.id(),
                serial : feedback.getSerial(),
                dom : $modalFeedback
            });

        }, loader.getLoadedClasses());
    }

    function replaceControl(renderedFeebacks, $itemContainer, callback){
        var $scope, $controls, $toggleContainer;
        if($itemContainer.parents('.tao-preview-scope').length){
            //preview mode
            $scope = window.parent.parent.$('#preview-console');
            $controls = $scope.find('.preview-console-header .action-bar li:visible');
            $toggleContainer = $scope.find('.console-button-action-bar');
            initControlToggle(renderedFeebacks, $itemContainer, $controls, $toggleContainer, previewOkBtn, callback);

        }else{
            //delivery delivery
            $scope = window.parent.parent.$('body.qti-test-scope .bottom-action-bar');
            $controls = $scope.find('li:visible');
            $toggleContainer = $scope.find('.navi-box-list');
            initControlToggle(renderedFeebacks, $itemContainer, $controls, $toggleContainer, deliveryOkBtn, callback);
        }
    }

    function initControlToggle(renderedFeebacks, $itemContainer, $controls, $toggleContainer, toggleButtonTemplate, callback){

        var $ok = $(toggleButtonTemplate()).click(function(){

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

        $controls.hide();
        $toggleContainer.append($ok);
        cover([$itemContainer]);
    }

    function cover(interactionContainers){
        var $cover = $('<div class="interaction-cover modal-bg">');
        _.each(interactionContainers, function($interaction){
            $interaction.append($cover);
        });
    }

    function uncover(interactionContainers){
        _.each(interactionContainers, function($interaction){
            $interaction.find('.interaction-cover').remove();
        });
    }

    /**
     * Provide the feedbackMessage signature to check if the feedback contents should be considered equals
     * 
     * @param {type} feedback
     * @returns {String}
     */
    function getFeedbackMessageSignature(feedback){
        return ('' + feedback.body() + feedback.attr('title')).toLowerCase().trim().replace(/x-tao-relatedoutcome-[a-zA-Z0-9\-._]*/, '');
    }

    return {
        showFeedbacks : showFeedbacks
    };
});