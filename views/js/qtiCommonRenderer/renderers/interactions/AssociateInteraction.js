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
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/associateInteraction',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/associateInteraction.pair',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'interact',
    'ui/interactUtils'
], function ($, _, __, Promise, tpl, pairTpl, containerHelper, instructionMgr, pciResponse, sizeAdapter, interact, interactUtils) {

    'use strict';

    var setChoice = function(interaction, $choice, $target){

        var $container      = containerHelper.get(interaction);
        var choiceSerial    = $choice.data('serial');
        var usage           = $choice.data('usage') || 0;
        var choice          = interaction.getChoice(choiceSerial);

        if(!choiceSerial){
            throw 'empty choice serial';
        }

        //to track number of times a choice is used in a pair
        usage++;
        $choice.data('usage', usage);

        var _setChoice = function(){

            $target
                .data('serial', choiceSerial)
                .html($choice.html())
                .addClass('filled');

            if(!interaction.responseMappingMode &&
                choice.attr('matchMax') &&
                usage >= choice.attr('matchMax')){

                $choice.addClass('deactivated');
            }
        };

        if($target.siblings('div').hasClass('filled')){

            var $resultArea = $('.result-area', $container),
                $pair = $target.parent(),
                thisPairSerial = [$target.siblings('div').data('serial'), choiceSerial],
                $otherRepeatedPair = $();

            //check if it is not a repeating association!
            $resultArea.children().not($pair).each(function(){
                var $otherPair = $(this).children('.filled');
                if($otherPair.length === 2){
                    var otherPairSerial = [$($otherPair[0]).data('serial'), $($otherPair[1]).data('serial')];
                    if(_.intersection(thisPairSerial, otherPairSerial).length === 2){
                        $otherRepeatedPair = $otherPair;
                        return false;
                    }
                }
            });

            if($otherRepeatedPair.length === 0){
                //no repeated pair, so allow the choice to be set:
                _setChoice();

                //trigger pair made event
                containerHelper.triggerResponseChangeEvent(interaction, {
                    type : 'added',
                    $pair : $pair,
                    choices : thisPairSerial
                });

                instructionMgr.validateInstructions(interaction, {choice : $choice, target : $target});

                if(interaction.responseMappingMode || parseInt(interaction.attr('maxAssociations')) === 0){

                    $pair.removeClass('incomplete-pair');

                    //append new pair option?
                    if(!$resultArea.children('.incomplete-pair').length){
                        $resultArea.append(pairTpl({empty : true}));
                        $resultArea.children('.incomplete-pair').fadeIn(600, function(){
                            $(this).show();
                        });
                    }
                }
            }else{
                //repeating pair: show it:

                //@todo add a notification message here in warning
                $otherRepeatedPair.css('border', '1px solid orange');
                $target.html(__('identical pair already exists')).css({
                    color : 'orange',
                    border : '1px solid orange'
                });
                setTimeout(function(){
                    $otherRepeatedPair.removeAttr('style');
                    $target.empty().css({color:"",border:""});
                }, 2000);
            }

        }else{
            _setChoice();
        }
    };

    var unsetChoice = function(interaction, $filledChoice, animate, triggerChange){

        var $container      = containerHelper.get(interaction);
        var choiceSerial    = $filledChoice.data('serial');
        var $choice         = $container.find('.choice-area [data-serial=' + choiceSerial + ']');
        var usage           = $choice.data('usage') || 0;
        var $parent         = $filledChoice.parent();
        var $sibling        = $container.find('.choice-area [data-serial=' + $filledChoice.siblings('.target').data('serial') + ']');

        //decrease the  use for this choice
        usage--;

        $choice
            .data('usage', usage)
            .removeClass('deactivated');


        $filledChoice
            .removeClass('filled')
            .removeData('serial')
            .empty();

        if(!interaction.swapping){

            if(triggerChange !== false){
                //a pair with one single element is not valid, so consider the response to be modified:
                containerHelper.triggerResponseChangeEvent(interaction, {
                    type : 'removed',
                    $pair : $filledChoice.parent()
                });
                instructionMgr.validateInstructions(interaction, {choice : $choice});
            }

            //if we are to remove the sibling too, update its usage:
            $sibling.data('usage', $sibling.data('usage') - 1).removeClass('deactivated');

            //completely empty pair:
            if(!$choice.siblings('div').hasClass('filled') && (parseInt(interaction.attr('maxAssociations')) === 0 || interaction.responseMappingMode)){
                //shall we remove it?
                if(!$parent.hasClass('incomplete-pair')){
                    if(animate){
                        $parent.addClass('removing').fadeOut(500, function(){
                            $(this).remove();
                        });
                    }else{
                        $parent.remove();
                    }
                }
            }
        }
    };

    var getChoice = function(interaction, identifier){
        var $container = containerHelper.get(interaction);

        //warning: do not use selector data-identifier=identifier because data-identifier may change dynamically
        var choice = interaction.getChoiceByIdentifier(identifier);
        if(!choice){
            throw new Error('cannot find a choice with the identifier : ' + identifier);
        }
        return $('.choice-area [data-serial=' + choice.getSerial() + ']', $container);
    };

    var renderEmptyPairs = function(interaction){

        var $container = containerHelper.get(interaction);
        var max = parseInt(interaction.attr('maxAssociations'));
        var $resultArea = $('.result-area', $container);

        if(interaction.responseMappingMode || max === 0){
            $resultArea.append(pairTpl({empty : true}));
            $resultArea.children('.incomplete-pair').show();
        }else{
            for(var i = 0; i < max; i++){
                $resultArea.append(pairTpl());
            }
        }
    };


    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     */
    var render = function(interaction){

        var self = this;

        return new Promise(function(resolve, reject){

            var $container = containerHelper.get(interaction);
            var $choiceArea = $container.find('.choice-area');
            var $resultArea = $container.find('.result-area');

            var $activeChoice = null;

            var isDragAndDropEnabled;
            var dragOptions;
            var dropOptions;

            var $bin = $('<span>', {'class' : 'icon-undo remove-choice', 'title' : __('remove')});

            var choiceSelector = $choiceArea.selector + ' >li';
            var resultSelector = $resultArea.selector + ' >li>div';
            var binSelector = $container.selector + " .remove-choice";

            var _getChoice = function(serial){
                return $choiceArea.find('[data-serial=' + serial + ']');
            };

            /**
             * @todo Tried to store $resultArea.find[...] in a variable but this fails
             * @param $choice
             * @param $target
             * @private
             */
            var _setChoice = function($choice, $target){
                setChoice(interaction, $choice, $target);
                sizeAdapter.adaptSize($('.result-area .target, .choice-area .qti-choice', containerHelper.get(interaction)));
            };

            var _resetSelection = function(){
                if($activeChoice){
                    $resultArea.find('.remove-choice').remove();
                    $activeChoice.removeClass('active');
                    $container.find('.empty').removeClass('empty');
                    $activeChoice = null;
                }
            };

            var _unsetChoice = function($choice){
                unsetChoice(interaction, $choice, true);
                sizeAdapter.adaptSize($('.result-area .target, .choice-area .qti-choice', containerHelper.get(interaction)));
            };

            var _isInsertionMode = function(){
                return ($activeChoice && $activeChoice.data('identifier'));
            };

            var _isModeEditing = function(){
                return ($activeChoice && !$activeChoice.data('identifier'));
            };

            var _handleChoiceActivate = function($target) {
                if($target.hasClass('deactivated')){
                    return;
                }

                if(_isModeEditing()){
                    //swapping:
                    interaction.swapping = true;
                    _unsetChoice($activeChoice);
                    _setChoice($target, $activeChoice);
                    _resetSelection();
                    interaction.swapping = false;
                }else{
                    if($target.hasClass('active')){
                        _resetSelection();

                    }else{
                        _activateChoice($target);
                    }
                }
            };

            var _activateChoice = function($choice) {
                _resetSelection();
                $activeChoice = $choice;
                $choice.addClass('active');
                $resultArea.find('>li>.target').addClass('empty');
            };

            var _handleResultActivate = function($target) {
                var choiceSerial,
                    targetSerial = $target.data('serial');

                if(_isInsertionMode()){

                    choiceSerial = $activeChoice.data('serial');

                    if(targetSerial !== choiceSerial){

                        if($target.hasClass('filled')){
                            interaction.swapping = true;//hack to prevent deleting empty pair in infinite association mode
                        }
                        //set choices:
                        if(targetSerial){
                            _unsetChoice($target);
                        }
                        _setChoice($activeChoice, $target);

                        //always reset swapping mode after the choice is set
                        interaction.swapping = false;
                    }

                    _resetSelection();

                }else if(_isModeEditing()){

                    choiceSerial = $activeChoice.data('serial');

                    if(targetSerial !== choiceSerial){

                        if($target.hasClass('filled') || $activeChoice.siblings('div')[0] === $target[0]){
                            interaction.swapping = true;//hack to prevent deleting empty pair in infinite association mode
                        }

                        _unsetChoice($activeChoice);
                        if(targetSerial){
                            //swapping:
                            _unsetChoice($target);
                            _setChoice(_getChoice(targetSerial), $activeChoice);
                        }
                        _setChoice(_getChoice(choiceSerial), $target);

                        //always reset swapping mode after the choice is set
                        interaction.swapping = false;
                    }

                    _resetSelection();

                }else if(targetSerial){
                    _activateResult($target);
                    $target.append($bin);
                }
            };

            var _activateResult = function ($target) {
                var targetSerial = $target.data('serial');

                $activeChoice = $target;
                $activeChoice.addClass('active');

                $resultArea.find('>li>.target').filter(function(){
                    return $(this).data('serial') !== targetSerial;
                }).addClass('empty');

                $choiceArea.find('>li:not(.deactivated)').filter(function(){
                    return $(this).data('serial') !== targetSerial;
                }).addClass('empty');
            };


            // Point & click handlers

            interact($container.selector).on('tap', function() {
                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                _resetSelection();
            });

            interact($choiceArea.selector + ' >li').on('tap', function(e) {
                var $target = $(e.currentTarget);

                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _handleChoiceActivate($target);
                e.preventDefault();
            });

            interact($resultArea.selector + ' >li>div').on('tap', function(e) {
                var $target = $(e.currentTarget);

                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _handleResultActivate($target);
                e.preventDefault();
            });

            interact(binSelector).on('tap', function (e) {
                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _unsetChoice($activeChoice);
                _resetSelection();
                e.preventDefault();
            });

            if(!interaction.responseMappingMode){
                _setInstructions(interaction);
            }


            // Drag & drop handlers

            if (self.getOption && self.getOption("enableDragAndDrop") && self.getOption("enableDragAndDrop").associate) {
                isDragAndDropEnabled = self.getOption("enableDragAndDrop").associate;
            }

            function _iFrameDragFix(draggableSelector, target) {
                interactUtils.iFrameDragFixOn(function () {
                    var $activeDrop = $(resultSelector + '.dropzone');
                    if ($activeDrop.length) {
                        interact(resultSelector).fire({
                            type: 'drop',
                            target: $activeDrop.eq(0),
                            relatedTarget: target
                        });
                    }
                    $activeDrop = $(choiceSelector + '.dropzone');
                    if ($activeDrop.length) {
                        interact(choiceSelector + '.empty').fire({
                            type: 'drop',
                            target: $activeDrop.eq(0),
                            relatedTarget: target
                        });
                    }
                    interact(draggableSelector).fire({
                        type: 'dragend',
                        target: target
                    });
                });
            }

            if (isDragAndDropEnabled) {
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
                interact(choiceSelector + ':not(.deactivated)').draggable(_.defaults({
                    onstart: function (e) {
                        var $target = $(e.target);
                        $target.addClass("dragged");
                        _activateChoice($target);
                        _iFrameDragFix(choiceSelector + ':not(.deactivated)', e.target);
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx, e.dy);
                    },
                    onend: function (e) {
                        var $target = $(e.target);
                        $target.removeClass("dragged");
                        _resetSelection();

                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();
                    }
                }, dragOptions)).styleCursor(false);

                // makes results draggables
                interact(resultSelector + '.filled').draggable(_.defaults({
                    onstart: function (e) {
                        var $target = $(e.target);
                        $target.addClass("dragged");
                        _resetSelection();
                        _activateResult($target);
                        _iFrameDragFix(resultSelector + '.filled', e.target);
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx, e.dy);
                    },
                    onend: function (e) {
                        var $target = $(e.target);
                        $target.removeClass("dragged");

                        interactUtils.restoreOriginalPosition($target);

                        if ($activeChoice) {
                            _unsetChoice($activeChoice);
                        }
                        _resetSelection();

                        interactUtils.iFrameDragFixOff();
                    }
                }, dragOptions)).styleCursor(false);


                dropOptions = {
                    overlap: 0.15,
                    ondragenter: function(e) {
                        $(e.target).addClass('dropzone');
                        $(e.relatedTarget).addClass('droppable');
                    },
                    ondragleave: function(e) {
                        $(e.target).removeClass('dropzone');
                        $(e.relatedTarget).removeClass('droppable');
                    }
                };

                // makes hotspots droppables
                interact(resultSelector).dropzone(_.defaults({
                    ondrop: function (e) {
                        this.ondragleave(e);
                        _handleResultActivate($(e.target));
                    }
                }, dropOptions));

                // makes available choices droppables
                interact(choiceSelector + '.empty').dropzone(_.defaults({
                    ondrop: function (e) {
                        this.ondragleave(e);
                        _handleChoiceActivate($(e.target));
                    }
                }, dropOptions));
            }


            // interaction init

            renderEmptyPairs(interaction);

            sizeAdapter.adaptSize($('.result-area .target, .choice-area .qti-choice', $container));

            resolve();

        });
    };

    var _setInstructions = function(interaction){

        var min = parseInt(interaction.attr('minAssociations'), 10),
            max = parseInt(interaction.attr('maxAssociations'), 10);

        //infinite association:
        if(min === 0){
            if(max === 0){
                instructionMgr.appendInstruction(interaction, __('You may make as many association pairs as you want.'));
            }
        }else{
            if(max === 0){
                instructionMgr.appendInstruction(interaction, __('The maximum number of association is unlimited.'));
            }
            //the max value is implicit since the appropriate number of empty pairs have already been created
            var msg = __('You need to make') + ' ';
            msg += (min > 1) ? __('at least') + ' ' + min + ' ' + __('association pairs') : __('one association pair');
            instructionMgr.appendInstruction(interaction, msg, function(){
                if(_getRawResponse(interaction).length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }
    };

    var resetResponse = function(interaction){
        var $container = containerHelper.get(interaction);

        //destroy selected choice:
        $container.find('.result-area .active').each(function () {
           interactUtils.tapOn(this);
        });

        $('.result-area>li>div', $container).each(function(){
            unsetChoice(interaction, $(this), false, false);
        });

        containerHelper.triggerResponseChangeEvent(interaction);
        instructionMgr.validateInstructions(interaction);
    };

    var _setPairs = function(interaction, pairs){

        var $container = containerHelper.get(interaction);
        var addedPairs = 0;
        var $emptyPair = $('.result-area>li:first', $container);
        if(pairs && interaction.getResponseDeclaration().attr('cardinality') === 'single' && pairs.length){
            pairs = [pairs];
        }
        _.each(pairs, function(pair){
            if($emptyPair.length){
                var $divs = $emptyPair.children('div');
                setChoice(interaction, getChoice(interaction, pair[0]), $($divs[0]));
                setChoice(interaction, getChoice(interaction, pair[1]), $($divs[1]));
                addedPairs++;
                $emptyPair = $emptyPair.next('li');
            }else{
                //the number of pairs exceeds the maximum allowed pairs: break;
                return false;
            }
        });

        return addedPairs;
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        _setPairs(interaction, pciResponse.unserialize(response, interaction));
    };

    var _getRawResponse = function(interaction){
        var response = [];
        var $container = containerHelper.get(interaction);
        $('.result-area>li', $container).each(function(){
            var pair = [];
            $(this).find('div').each(function(){
                var serial = $(this).data('serial');
                if(serial){
                    pair.push(interaction.getChoice(serial).id());
                }
            });
            if(pair.length === 2){
                response.push(pair);
            }
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
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    /**
     * Destroy the interaction by leaving the DOM exactly in the same state it was before loading the interaction.
     * @param {Object} interaction - the interaction
     */
    var destroy = function(interaction){
        var $container = containerHelper.get(interaction);

        //remove event
        interact($container.selector).unset();
        interact($container.find('.choice-area').selector + ' >li').unset();
        interact($container.find('.result-area').selector + ' >li>div').unset();
        interact($container.find('.remove-choice').selector).unset();

        //remove instructions
        instructionMgr.removeInstructions(interaction);

        $('.result-area', $container).empty();

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
     * Expose the common renderer for the associate interaction
     * @exports qtiCommonRenderer/renderers/interactions/AssociateInteraction
     */
    return {
        qtiClass : 'associateInteraction',
        template : tpl,
        render : render,
        getContainer : containerHelper.get,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : destroy,
        setState: setState,
        getState : getState,

        renderEmptyPairs : renderEmptyPairs
    };
});
