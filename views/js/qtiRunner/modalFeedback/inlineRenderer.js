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
    'context',
    'taoQtiItem/qtiItem/helper/pci',
    'taoQtiItem/qtiItem/helper/container',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackPreviewButton',
    'tpl!taoQtiItem/qtiRunner/tpl/inlineModalFeedbackDeliveryButton',
    'iframeNotifier',
    'core/promise'
], function (_, $, context, pci, containerHelper, previewOkBtn, deliveryOkBtn, iframeNotifier, Promise){
    'use strict';
    
    var timeout = (context.timeout > 0 ? context.timeout + 1 : 30) * 1000;
    
    /**
     * Main function for the module. It loads and render the feedbacks accodring to the given itemSession variables
     *
     * @param {Object} item - the standard tao qti item object
     * @param {Object} loader - the item loader instance
     * @param {Object} renderer - the item render instance
     * @param {Object} itemSession - session information containing the list of feedbacks to display
     * @param {Function} onCloseCallback - the callback to be executed when the feedbacks are closed
     * @param {Function} [onShowCallback] - the callback to be executed when the feedbacks are shown
     * @returns {Number} Number of feedbacks to be displayed
     */
    function showFeedbacks(item, loader, renderer, itemSession, onCloseCallback, onShowCallback){

        var interactionsDisplayInfo = getInteractionsDisplayInfo(item);
        var messages = {};
        var renderedFeebacks = [];
        var renderingQueue = [];
        var $itemContainer = item.getContainer();
        var $itemBody = $itemContainer.children('.qti-itemBody');
        var firstFeedback;

        _.each(item.modalFeedbacks, function (feedback){

            var feedbackIds, message, $container, comparedOutcome, _currentMessageGroupId, interactionInfo;
            var outcomeIdentifier = feedback.attr('outcomeIdentifier');
            var order = -1;

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
                interactionInfo = _.find(interactionsDisplayInfo, {responseIdentifier : comparedOutcome});
                if(comparedOutcome && interactionInfo){
                    $container = interactionInfo.displayContainer;
                    _currentMessageGroupId = interactionInfo.messageGroupId;
                    order = interactionInfo.order;
                }else{
                    $container = $itemBody;
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
                renderingQueue.push({
                    feedback : feedback,
                    $container : $container,
                    order : order
                });
            }
        });


        if(renderingQueue.length){

            renderingQueue = _.sortBy(renderingQueue, 'order');
            
            //clear previously displayed feedbacks
            clearModalFeedbacks($itemContainer);
            
            //process rendering queue
            _.each(renderingQueue, function (renderingToken){
                renderModalFeedback(renderingToken.feedback, loader, renderer, renderingToken.$container, $itemContainer, function (renderingData){

                    // keep the first feedback to force focus on it if needed
                    if (!firstFeedback) {
                        firstFeedback = $(renderingData.dom);
                    }

                    $('img', renderingData.dom).on('load', function() {
                        iframeNotifier.parent('itemcontentchange');
                    });

                    //record rendered feedback for later reference
                    renderedFeebacks.push(renderingData);
                    if(renderedFeebacks.length === renderingQueue.length){
                        //rendering processing queue completed
                        iframeNotifier.parent('itemcontentchange');

                        // set the focus on the first feedback if needed
                        // TODO: this is heavily related to the old TestRunner, with the ugly iframes.
                        // To make this working, a search is made accross parent frames.
                        // When the InlineFeedbacks will be ported to the new TestRunner, a strong improvement will be needed!
                        if (firstFeedback) {
                            autoscroll(firstFeedback);
                        }

                        //if an optional "on show modal" callback has been provided, execute it
                        if(_.isFunction(onShowCallback)){
                            onShowCallback();
                        }
                    }
                });
            });

            //if any feedback is displayed, replace the controls by a "ok" button
            replaceControl(renderedFeebacks, $itemContainer, onCloseCallback);
        }

        return renderingQueue.length;
    }

    /**
     * Gets the QTI Container element
     * @returns {jQuery|null}
     */
    function getQtiContainer() {
        var me = window;
        var $container = null;
        var max = 10;

        while (me && me.__knownParent__ && max--) {
            me = me.parent;
            if (me && me.$) {
                $container = me.$('#qti-content');
                if ($container.length) {
                    return $container;
                }
            }
        }
        return null;
    }

    /**
     * Keeps an element visible inside the QTI container.
     * If the element is outside the container viewport, scroll to display it.
     * @param {String|jQuery|HTMLElement} element
     */
    function autoscroll(element) {
        var $element = $(element);
        var $container = getQtiContainer();
        var currentScrollTop, minScrollTop, maxScrollTop, scrollTop;

        if ($element.length && $container) {
            currentScrollTop = $container.scrollTop();
            maxScrollTop = $element.offset().top;
            minScrollTop = maxScrollTop - $container.height() + $element.outerHeight();
            scrollTop = Math.max(Math.min(maxScrollTop, currentScrollTop), minScrollTop);
            if (scrollTop !== currentScrollTop) {
                $container.animate({scrollTop: scrollTop});
            }
        }
    }

    /**
     * Extract the display information for an interaction-related feedback
     *
     * @private
     * @param {Object} interaction - a qti interaction object
     * @returns {Object} Object containing useful display information
     */
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
            messageGroupId : messageGroupId,
            order : -1
        };
    }

    /**
     * Get interaction display information sorted in the order of appearance within the item
     *
     * @param {Object} item
     * @returns {Array}
     */
    function getInteractionsDisplayInfo(item){

        var interactionsDisplayInfo = [];
        var $itemContainer = item.getContainer();
        var interactionOrder = 0;

        //extract all interction related information needed to display their
        _.each(item.getComposingElements(), function (element){
            var responseIdentifier;
            if(element.is('interaction')){
                responseIdentifier = element.attr('responseIdentifier');
                interactionsDisplayInfo.push(extractDisplayInfo(element));
            }
        });

        //sort interactionsDisplayInfo on the item level
        $itemContainer.find('.qti-interaction').each(function(){
            var interactionContainer = this;
            _.each(interactionsDisplayInfo, function(_interactionInfo){
                if(_interactionInfo.interactionContainer[0] === interactionContainer){
                    _interactionInfo.order = interactionOrder;
                    return false;
                }
            });
            interactionOrder++;
        });
        interactionsDisplayInfo = _.sortBy(interactionsDisplayInfo, 'order');

        return interactionsDisplayInfo;
    }
    
    /**
     * Remove previously displayed feedbacks contained in the given container element
     * 
     * @param {JQuery} $itemContainer
     */
    function clearModalFeedbacks($itemContainer){
        $itemContainer.find('.qti-modalFeedback').remove();
    }
    
    /**
     * Render a modal feedback into a given container, scoped within an item container
     *
     * @private
     * @param {type} feedback - feedback object
     * @param {type} loader - loader instance
     * @param {type} renderer - renderer instance
     * @param {JQuery} $container - the targeted feedback container
     * @param {JQuery} $itemContainer - the item container
     * @param {type} renderedCallback - callback when the feedback has been rendered
     * @returns {undefined}
     */
    function renderModalFeedback(feedback, loader, renderer, $container, $itemContainer, renderedCallback){

        //load (potential) new qti classes used in the modal feedback (e.g. math, img)
        renderer.load(function (){

            //render the modal feedback
            var $modalFeedback = $(feedback.render({
                inline : true
            }));
            var done = function done(){
                renderedCallback({
                    identifier : feedback.id(),
                    serial : feedback.getSerial(),
                    dom : $modalFeedback
                });
            };
            $container.append($modalFeedback);
            
            // Race between postRendering and timeout
            // postRendering waits for everything to be resolved or one reject
            Promise.race([
                Promise.all(_.map(feedback.getComposingElements(), function(elt){
                    //render also internal elements, such as math or img
                    return elt.postRender({}, '', renderer).pop();
                })),
                new Promise(function(resolve, reject){
                    _.delay(reject, timeout, new Error('Post rendering ran out of time.'));
                })
            ])
            .then(done)
            .catch(function(err){
                //in case of postRendering issue, we are also done
                done();
                throw new Error('Error in post rendering : ' + err);
            });

        }, loader.getLoadedClasses());
    }

    /**
     * Replace the controls in the running environment  with an "OK" button to trigger the end of the feedback state
     *
     * @private
     * @todo FIX ME ! replace the hack to preview and delivery toolbar with a proper plugin in the new test runner is ready
     * @param {Array} renderedFeebacks
     * @param {JQuery} $itemContainer
     * @param {Function} callback
     */
    function replaceControl(renderedFeebacks, $itemContainer, callback){
        var $scope, $controls, $toggleContainer;
        if(window.parent && window.parent.parent && window.parent.parent.$){
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
        }else{
            //not in an iframe, add to item body for now
            $scope = $itemContainer.find('#modalFeedbacks');
            initControlToggle(renderedFeebacks, $itemContainer, $(), $scope, previewOkBtn, callback);
        }
    }

    /**
     * Initialize the "OK" button to trigger the end of the feedback mode
     *
     * @private
     * @param {Array} renderedFeebacks
     * @param {JQuery} $itemContainer
     * @param {JQuery} $controls
     * @param {JQuery} $toggleContainer
     * @param {Function} toggleButtonTemplate
     * @param {Function} callback
     */
    function initControlToggle(renderedFeebacks, $itemContainer, $controls, $toggleContainer, toggleButtonTemplate, callback){

        var $ok = $(toggleButtonTemplate()).click(function (){

            //end feedback mode, hide feedbacks
            _.each(renderedFeebacks, function (fb){
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

    /**
     * Cover the given interaction containers with a transparent layer to prevent user interacting with the item
     * @private
     * @param {Array} interactionContainers
     */
    function cover(interactionContainers){
        var $cover = $('<div class="interaction-cover modal-bg">');
        _.each(interactionContainers, function ($interaction){
            $interaction.append($cover);
        });
    }

    /**
     * Remove the layer set by the function cover()
     * @private
     * @param {Array} interactionContainers
     */
    function uncover(interactionContainers){
        _.each(interactionContainers, function ($interaction){
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
        return ('' + feedback.body() + feedback.attr('title')).toLowerCase().trim().replace(/x-tao-[a-zA-Z0-9\-._\s]*/g, '');
    }

    return {
        showFeedbacks : showFeedbacks
    };
});
