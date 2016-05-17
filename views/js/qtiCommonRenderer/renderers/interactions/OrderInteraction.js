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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'core/mouseEvent',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/orderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'OAT/interact'
], function(_, $, __, triggerMouseEvent, tpl, containerHelper, instructionMgr, pciResponse, interact){
    'use strict';

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10283
     *
     * @param {Object} interaction - the interaction instance
     */
    var render = function(interaction){

        var $container = containerHelper.get(interaction),
            $choiceArea = $container.find('.choice-area'),
            $resultArea = $container.find('.result-area'),
            $iconAdd = $container.find('.icon-add-to-selection'),
            $iconRemove = $container.find('.icon-remove-from-selection'),
            $iconBefore = $container.find('.icon-move-before'),
            $iconAfter = $container.find('.icon-move-after'),
            $activeChoice = null,

            choiceSelector = $choiceArea.selector + ' >li:not(.deactivated)',
            resultSelector = $resultArea.selector + ' >li',

            isDragAndDropEnabled,
            dragOptions,
            $dropzoneElement,
            $dragContainer = $container.find('.drag-container');

        var _activeControls = function _activeControls(){
            $iconAdd.addClass('inactive');
            $iconRemove.removeClass('inactive').addClass('active');
            $iconBefore.removeClass('inactive').addClass('active');
            $iconAfter.removeClass('inactive').addClass('active');
        };

        var _resetControls = function _resetControls(){
            $iconAdd.removeClass('inactive');
            $iconRemove.removeClass('active').addClass('inactive');
            $iconBefore.removeClass('active').addClass('inactive');
            $iconAfter.removeClass('active').addClass('inactive');
        };

        var _setSelection = function _setSelection($choice){
            if($activeChoice){
                $activeChoice.removeClass('active');
            }
            $activeChoice = $choice;
            $activeChoice.addClass('active');
        };

        var _resetSelection = function _resetSelection(){
            if($activeChoice){
                $activeChoice.removeClass('active');
                $activeChoice = null;
            }
            _resetControls();
        };

        var _addChoiceToSelection = function _addChoiceToSelection($target, position) {
            var $results = $(resultSelector);
            _resetSelection();

            $iconAdd.addClass('triggered');
            setTimeout(function(){
                $iconAdd.removeClass('triggered');
            }, 150);

            //move choice to the result list:
            if (typeof(position) !== 'undefined' && position < $results.length) {
                $results.eq(position).before($target);
            } else {
                $resultArea.append($target);
            }

            containerHelper.triggerResponseChangeEvent(interaction);

            //update constraints :
            instructionMgr.validateInstructions(interaction);
        };

        var _toggleResultSelection = function _toggleResultSelection($target) {
            if($target.hasClass('active')){
                _resetSelection();
            }else{
                _setSelection($target);
                _activeControls();
            }
        };

        var _removeChoice = function _removeChoice() {
            if($activeChoice){

                //restore choice back to choice list
                $choiceArea.append($activeChoice);
                containerHelper.triggerResponseChangeEvent(interaction);

                //update constraints :
                instructionMgr.validateInstructions(interaction);
            }

            _resetSelection();
        };

        var _moveResultBefore = function _moveResultBefore() {
            var $prev = $activeChoice.prev();

            if($prev.length){
                $prev.before($activeChoice);
                containerHelper.triggerResponseChangeEvent(interaction);
            }
        };

        var _moveResultAfter = function _moveResultAfter() {
            var $next = $activeChoice.next();

            if($next.length){
                $next.after($activeChoice);
                containerHelper.triggerResponseChangeEvent(interaction);
            }
        };


        // Point & click handlers

        interact($container.selector).on('tap', function () {
            _resetSelection();
        });

        interact(choiceSelector).on('tap', function (e) {
            var $target = $(e.currentTarget);
            e.stopPropagation();
            _addChoiceToSelection($target);
        });

        interact(resultSelector).on('tap', function (e) {
            var $target = $(e.currentTarget);
            e.stopPropagation();
            _toggleResultSelection($target);
        });

        interact($iconRemove.selector).on('tap', function (e) {
            e.stopPropagation();
            _removeChoice();
        });

        interact($iconBefore.selector).on('tap', function (e) {
            e.stopPropagation();
            _moveResultBefore();
        });

        interact($iconAfter.selector).on('tap', function (e) {
            e.stopPropagation();
            _moveResultAfter();
        });


        // Drag & drop handlers

        if (this.getOption("enableDragAndDrop") && this.getOption("enableDragAndDrop").order) {
            isDragAndDropEnabled = this.getOption("enableDragAndDrop").order;
            // todo remove this (begin)
        } else {
            isDragAndDropEnabled = true;
            // todo remove this (end)
        }

        if (isDragAndDropEnabled) {
            $dropzoneElement = $('<li>', {'class' : 'dropzone qti-choice'});
            $('<div>', {'class': 'qti-block'}).appendTo($dropzoneElement);

            dragOptions = {
                inertia: false,
                autoScroll: true,
                restrict: {
                    restriction: ".qti-interaction",
                    endOnly: false,
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                }
            };

            // makes choices draggables
            // todo add drag listener on inactive choice to highlight the warning message
            interact(choiceSelector).draggable(_.assign({}, dragOptions, {
                onstart: function (e) {
                    // todo move to drag container ?
                    var $target = $(e.target);
                    $target.addClass("dragged");
                },
                onmove: function (e) {
                    var $target = $(e.target);
                    _moveItem(e, $target);
                    if (_isDropzoneVisible()) {
                        _adjustDropzonePosition(e);
                    }
                },
                onend: function (e) {
                    var $target = $(e.target);
                    $target.removeClass("dragged");
                    _restoreOriginalPosition($target);
                }
            })).styleCursor(false);

            // makes result draggables
            interact(resultSelector).draggable(_.assign({}, dragOptions, {
                onstart: function (e) {
                    var $target = $(e.target);
                    $target.addClass("dragged");

                    _setSelection($target);

                    // move dragged result to drag container
                    // todo correct position
                    $dragContainer.show();
                    $dragContainer.width($resultArea.width());
                    // $dragContainer.offset({ top: 0, left: 0 });
                    $dragContainer.offset($target.offset());
                    $dragContainer.append($target);
                },
                onmove: function (e) {
                    _moveItem(e, $dragContainer);
                    if (_isDropzoneVisible()) {
                        _adjustDropzonePosition(e);
                    }
                },
                onend: function (e) {
                    var $target = $(e.target),
                        hasBeenDroppedInResultArea = ($target.parent === $resultArea);

                    $target.removeClass("dragged");
                    $dragContainer.hide();

                    if (! hasBeenDroppedInResultArea) {
                        _removeChoice();
                    }
                    _restoreOriginalPosition($target);
                }
            })).styleCursor(false);

            // makes result area droppable
            interact($resultArea.selector).dropzone({
                overlap: 0.6,
                ondragenter: function (e) {
                    var $dragged = $(e.relatedTarget);
                    _addDropzoneToPosition($dragged); // todo
                },
                ondrop: function (e) {
                    var $dragged = $(e.relatedTarget),
                        dropzoneIndex = $(resultSelector).index($dropzoneElement);

                    $dropzoneElement.remove();

                    _addChoiceToSelection($dragged, dropzoneIndex);
                    _restoreOriginalPosition($dragged);
                },
                ondragleave: function () {
                    $dropzoneElement.remove();
                }
            });

            // todo scope all dnd selector
        }

        // todo remove the "escalator" effect
        function _addDropzoneToPosition($draggedElement) {
            /*
            var $results = $resultArea.find('li');
            if ($results.length > 0) {
                var draggedIndex = $results.index($draggedElement);
                $results.eq(draggedIndex).after($dropzoneElement);
            } else {
                $resultArea.append($dropzoneElement);
            }
            */
            var $dropzone;

            $resultArea.append($dropzoneElement);

            $dropzone = $('.dropzone');
            $dropzone.height($draggedElement.height());
            $dropzone.find('div').text($draggedElement.text());
        }

        function _isDropzoneVisible() {
            return $.contains($container.get(0), $dropzoneElement.get(0));
        }

        function _adjustDropzonePosition(e) { // todo pass target instead of event ?
            var $choice = $(e.target),
                choiceTop = $choice.offset().top,
                choiceBottom = choiceTop + $choice.height(),
                $prevResult = $dropzoneElement.prev('.qti-choice'),
                $nextResult = $dropzoneElement.next('.qti-choice'),
                prevMiddleY,
                nextMiddleY;

            if ($prevResult.length > 0) {
                prevMiddleY = $prevResult.offset().top + $prevResult.height() / 2;
                if (choiceTop < prevMiddleY) {
                    $prevResult.before($dropzoneElement);
                }
            }
            if ($nextResult.length > 0) {
                nextMiddleY = $nextResult.offset().top + $nextResult.height() / 2;
                if (choiceBottom > nextMiddleY) {
                    $nextResult.after($dropzoneElement);
                }
            }
        }

        function _moveItem(e, $target) {
            var x = (parseFloat($target.attr('data-x')) || 0) + e.dx,
                y = (parseFloat($target.attr('data-y')) || 0) + e.dy,
                transform = 'translate(' + x + 'px, ' + y + 'px)';

            $target.css("webkitTransform", transform);
            $target.css("transform", transform);

            $target.attr('data-x', x);
            $target.attr('data-y', y);
        }

        function _restoreOriginalPosition($target) {
            var transform = 'translate(0px, 0px)';

            $target.css('webkitTransform', transform);
            $target.css('transform', transform);
            $target.css('top', '0');
            $target.attr('data-x', 0);
            $target.attr('data-y', 0);
        }

        // rendering init

        _setInstructions(interaction);

        //bind event listener in case the attributes change dynamically on runtime
        $(document).on('attributeChange.qti-widget.commonRenderer', function(e, data){
            if(data.element.getSerial() === interaction.getSerial()){
                if(data.key === 'maxChoices' || data.key === 'minChoices'){
                    instructionMgr.removeInstructions(interaction);
                    _setInstructions(interaction);
                    instructionMgr.validateInstructions(interaction);
                }
            }
        });

        _freezeSize($container);
    };

    var _freezeSize = function($container){
        var $orderArea = $container.find('.order-interaction-area');
        $orderArea.height($orderArea.height());
    };

    var _setInstructions = function(interaction){

        var $container = containerHelper.get(interaction);
        var $choiceArea = $('.choice-area', $container),
            $resultArea = $('.result-area', $container),
            min = parseInt(interaction.attr('minChoices'), 10),
            max = parseInt(interaction.attr('maxChoices'), 10);

        if(min){
            instructionMgr.appendInstruction(interaction, __('You must use at least %d choices', min), function(){
                if($resultArea.find('>li').length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }

        if(max && max < _.size(interaction.getChoices())){
            var instructionMax = instructionMgr.appendInstruction(interaction, __('You can use maximum %d choices', max), function(){
                if($resultArea.find('>li').length >= max){
                    $choiceArea.find('>li').addClass('deactivated');
                    this.setMessage(__('Maximum choices reached'));
                }else{
                    $choiceArea.find('>li').removeClass('deactivated');
                    this.reset();
                }
            });

            interact($choiceArea.selector + ' >li.deactivated').on('tap', function(e) {
                var $target = $(e.currentTarget);
                $target.addClass('brd-error');
                instructionMax.setLevel('warning', 2000);
                setTimeout(function(){
                    $target.removeClass('brd-error');
                }, 150);
            });

            // we don't check for isDragAndDropEnabled on purpose, as this binding is not to allow dragging,
            // but only to provide feedback in case of a drag action for an inactive choice
            interact($choiceArea.selector + ' >li.deactivated').draggable({
                onstart: function (e) {
                    var $target = $(e.target);
                    $target.addClass('brd-error');
                    instructionMax.setLevel('warning');
                },
                onend: function (e) {
                    var $target = $(e.target);
                    $target.removeClass('brd-error');
                    instructionMax.setLevel('info');
                }
            }).styleCursor(false);
        }
    };

    var resetResponse = function(interaction){

        var $container = containerHelper.get(interaction);
        var initialOrder = _.keys(interaction.getChoices());
        var $choiceArea = $('.choice-area', $container).append($('.result-area>li', $container));
        var $choices = $choiceArea.children('.qti-choice');

        // todo use interact helper to trigger tap
        $container.find('.qti-choice.active').each(function deactivateChoice() {
            var eventOptions = {
                bubbles: true,
                cancelable: true,
                view: window
            };
            triggerMouseEvent(this, 'mousedown', eventOptions);
            triggerMouseEvent(this, 'mouseup', eventOptions);
        });

        $choices.detach().sort(function(choice1, choice2){
            return (_.indexOf(initialOrder, $(choice1).data('serial')) > _.indexOf(initialOrder, $(choice2).data('serial')));
        });
        $choiceArea.prepend($choices);
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10283
     *
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        var $container = containerHelper.get(interaction);
        var $choiceArea = $('.choice-area', $container);
        var $resultArea = $('.result-area', $container);

        if(response === null || _.isEmpty(response)){
            resetResponse(interaction);
        }else{
            try{
                _.each(pciResponse.unserialize(response, interaction), function(identifier){
                    $resultArea.append($choiceArea.find('[data-identifier=' + identifier + ']'));
                });
            }catch(e){
                throw new Error('wrong response format in argument : ' + e);
            }
        }

        instructionMgr.validateInstructions(interaction);
    };

    var _getRawResponse = function(interaction){
        var $container = containerHelper.get(interaction);
        var response = [];
        $('.result-area>li', $container).each(function(){
            response.push($(this).data('identifier'));
        });
        return response;
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10283
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    /**
     * Set additionnal data to the template (data that are not really part of the model).
     * @param {Object} interaction - the interaction
     * @param {Object} [data] - interaction custom data
     * @returns {Object} custom data
     */
    var getCustomData = function(interaction, data){

        return _.merge(data || {}, {
            horizontal : (interaction.attr('orientation') === 'horizontal')
        });

    };

    /**
     * Destroy the interaction by leaving the DOM exactly in the same state it was before loading the interaction.
     * @param {Object} interaction - the interaction
     */
    var destroy = function(interaction){

        var $container = containerHelper.get(interaction);

        //first, remove all events
        var selectors = [
            '.choice-area >li:not(.deactivated)',
            '.result-area >li',
            '.icon-add-to-selection',
            '.icon-remove-from-selection',
            '.icon-move-before',
            '.icon-move-after'
        ];
        selectors.forEach(function unbindInteractEvents(selector) {
            interact($container.find(selector).selector).unset();
        });

        // todo restore unbinding for .commonRenderer events (see attributes changes)

        $container.find('.order-interaction-area').removeAttr('style');

        instructionMgr.removeInstructions(interaction);

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    var setState  = function setState(interaction, state){
        var $container;

        if(_.isObject(state)){
            if(state.response){
                interaction.resetResponse();
                interaction.setResponse(state.response);
            }

            //restore order of previously shuffled choices
            if(_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())){

                $container = containerHelper.get(interaction);

                $('.choice-area .qti-choice', $container)
                    .sort(function(a, b){
                        var aIndex = _.indexOf(state.order, $(a).data('identifier'));
                        var bIndex = _.indexOf(state.order, $(b).data('identifier'));
                        if(aIndex > bIndex) {
                            return 1;
                        }
                        if(aIndex < bIndex) {
                            return -1;
                        }
                        return 0;
                    })
                    .detach()
                    .appendTo($('.choice-area', $container));
            }
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    var getState = function getState(interaction){
        var $container;
        var state =  {};
        var response =  interaction.getResponse();

        if(response){
            state.response = response;
        }

        //we store also the choice order if shuffled
        if(interaction.attr('shuffle') === true){
            $container = containerHelper.get(interaction);

            state.order = [];
            $('.choice-area .qti-choice', $container).each(function(){
               state.order.push($(this).data('identifier'));
            });
        }
        return state;
    };

     /**
     * Expose the common renderer for the order interaction
     * @exports qtiCommonRenderer/renderers/interactions/OrderInteraction
     */
    return {
        qtiClass : 'orderInteraction',
        getData : getCustomData,
        template : tpl,
        render : render,
        getContainer : containerHelper.get,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse: resetResponse,
        destroy : destroy,
        setState : setState,
        getState : getState
    };
});
