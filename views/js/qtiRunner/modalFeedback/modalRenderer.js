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
    'taoQtiItem/qtiItem/helper/pci'
], function(_, $, pci){
    'use strict';
    
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
        
        var lastFeedback,
            count = 0,
            messages = [],
            feedbacksToBeDisplayed = [];

        //find which modal feedbacks should be displayed according to the current item session:
        _.each(item.modalFeedbacks, function(feedback){

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

        if(count > 0 && _.isFunction(onShowCallback)){
            onShowCallback();
        }

        //show in reverse order
        lastFeedback = feedbacksToBeDisplayed.shift();//the last feedback to be shown is the first defined in the item
        _.eachRight(feedbacksToBeDisplayed, function(feedback){
            renderModalFeedback(feedback, loader, renderer);
        });

        //add callback to the last shown modal feedback
        renderModalFeedback(lastFeedback, loader, renderer, onCloseCallback);
        
        return count;
    }
    
    /**
     * Render modal feedback as a modal popup
     * 
     * @param {Object} feedback - object
     * @param {Object} loader - loader instance
     * @param {Object} renderer - renderer instance
     * @param {Function} [closeCallback] - feedback to be executed when the popop closes
     * @returns {undefined}
     */
    function renderModalFeedback(feedback, loader, renderer, closeCallback){

        var $feedback,
            $feedbackBox = $('#modalFeedbacks');//feedback.getItem().getContainer().find('#')

        if(feedback.is('modalFeedback')){
            //load (potential) new qti classes used in the modal feedback (e.g. math, img)
            renderer.load(function(){
                $feedback = $feedbackBox.find('#' + feedback.getSerial());
                if(!$feedback.length){
                    //render the modal feedback
                    $feedback = feedback.render();
                    $feedbackBox.append($feedback);
                }else{
                    $feedback.modal();
                }
                feedback.postRender({
                    callback : closeCallback
                });
            }, loader.getLoadedClasses());
        }
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
