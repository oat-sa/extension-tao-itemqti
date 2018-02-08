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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'core/promise',
    'core/mouseEvent',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/graphicGapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'interact',
    'ui/interactUtils'
], function($, _, __, module, Promise, triggerMouseEvent, tpl, graphic,  pciResponse, containerHelper, instructionMgr, interact, interactUtils){
    'use strict';

    var isDragAndDropEnabled;

    // this represents the state for the active droppable zone
    // we need it only to access the active dropzone in the iFrameFix
    // should be removed when the old test runner is discarded
    var activeDrop = null;

    /**
     * Global variable to count number of choice usages:
     * @type {object}
     */
    var _choiceUsages = {};

    /**
     * This options enables to support old items created with the wrong
     * direction in the directedpairs.
     *
     * @deprecated
     */
    var isDirectedPairFlipped = module.config().flipDirectedPair;

    /**
     * Check if a shape can accept matches
     * @private
     * @param {Raphael.Element} element - the shape
     * @returns {Boolean} true if the element is matchable
     */
    var _isMatchable = function(element){
        var matchable = false;
        var matching, matchMax;
        if(element){
            matchMax = element.data('max') || 0;
            matching = element.data('matching') || [];
            matchable = (matchMax === 0 || matchMax > matching.length);
        }
        return matchable;
    };

    /**
     * Makes the shapes selectable (at least those who can still accept matches)
     * @private
     * @param {Object} interaction
     */
    var _shapesSelectable = function _shapesSelectable(interaction){

        var tooltip = __('Select the area to add an image');

        //update the shape state
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(_isMatchable(element)){
                element.selectable = true;
                graphic.setStyle(element, 'selectable');
                graphic.updateTitle(element, tooltip);
            }
        });

        //update the gap images tooltip
        _.forEach(interaction.gapFillers, function(gapFiller){
            gapFiller.forEach(function(element){
                graphic.updateTitle(element, tooltip);
            });
        });
    };

    /**
     * Makes all the shapes UNselectable
     * @private
     * @param {Object} interaction
     */
    var _shapesUnSelectable = function _shapesUnSelectable(interaction){
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(element){
                element.selectable = false;
                graphic.setStyle(element, 'basic');
                graphic.updateTitle(element, __('Select an image first'));
            }
        });

        //update the gap images tooltip
        _.forEach(interaction.gapFillers, function(gapFiller){
            gapFiller.forEach(function(element){
                graphic.updateTitle(element, __('Remove'));
            });
        });
    };

    /**
     * By clicking the paper image the shapes are restored to their default state
     * @private
     * @param {Object} interaction
     */
    var _paperUnSelect = function _paperUnSelect(interaction){
        var $container = containerHelper.get(interaction);
        var $gapImages = $('ul > li', $container);
        var bgImage = interaction.paper.getById('bg-image-' + interaction.serial);
        if(bgImage){
            interact(bgImage.node).on('tap', function() {
                _shapesUnSelectable(interaction);
                $gapImages.removeClass('active');
            });
        }
    };

    /**
     * Sets a choice and marks as disabled if at max
     * @private
     * @param {Object} interaction
     * @param {JQuery Element} $choice
     */
    var _setChoice = function _setChoice(interaction, $choice) {
        var choiceSerial = $choice.data('serial');
        var choice = interaction.getGapImg(choiceSerial);
        var matchMax;
        var usages;

        if (!_choiceUsages[choiceSerial]) {
            _choiceUsages[choiceSerial] = 0;
        }

        _choiceUsages[choiceSerial]++;

        // disable choice if maxium usage reached
        if (!interaction.responseMappingMode && choice.attr('matchMax')) {
            matchMax = +choice.attr('matchMax');
            usages = +_choiceUsages[choiceSerial];

            // note: if matchMax is 0, then test taker is allowed unlimited usage of that choice
            if (matchMax !== 0 && matchMax <= usages) {
                interact($choice.get(0)).draggable(false);
                $choice.addClass('disabled');
                $choice.removeClass('selectable');
            }
        }
    };

    /**
     * Unset a choice and unmark as disabled
     * @private
     * @param {Object} interaction
     * @param {JQuery Element} $choice
     */
    var _unsetChoice = function _unsetChoice(interaction, $choice) {
        var choiceSerial = $choice.data('serial');

        _choiceUsages[choiceSerial]--;

        $choice.removeClass('disabled');
        $choice.addClass('selectable');
        interact($choice.get(0)).draggable(true);
    };

    /**
     * Select a shape (= hotspot) (a gap image must be active)
     * @private
     * @param {Object} interaction
     * @param {Raphael.Element} element - the selected shape
     * @param {Boolean} [trackResponse = true] - if the selection trigger a response chane
     */
    var _selectShape = function _selectShape(interaction, element, trackResponse){
        var $img,
            $clone,
            gapFiller,
            id,
            bbox,
            shapeOffset,
            activeOffset,
            matching,
            currentCount;

        //lookup for the active element
        var $container = containerHelper.get(interaction);
        var $gapList = $('ul', $container);
        var $active = $gapList.find('.active:first');
        var $imageBox = $('.main-image-box', $container);
        var boxOffset   = $imageBox.offset();

        if(typeof trackResponse === 'undefined'){
            trackResponse = true;
        }

        if($active.length){

            //the macthing elements are linked to the shape
            id = $active.data('identifier');
            matching = element.data('matching') || [];
            matching.push(id);
            element.data('matching', matching);
            currentCount = matching.length;

            //the image to clone
            $img = $active.find('img');

            //then reset the state of the shapes and the gap images
            _shapesUnSelectable(interaction);
            $gapList.children().removeClass('active');

            _setChoice(interaction, $active);

            $clone = $img.clone();
            shapeOffset  = $(element.node).offset();
            activeOffset   = $active.offset();

            $clone.css({
                'position' : 'absolute',
                'display'  : 'block',
                'z-index'  : 10000,
                'opacity'  : 0.8,
                'top'      : activeOffset.top - boxOffset.top,
                'left'     : activeOffset.left - boxOffset.left
            });

            $clone.appendTo($imageBox);
            $clone.animate({
                'top'       : shapeOffset.top - boxOffset.top,
                'left'      : shapeOffset.left - boxOffset.left
            }, 200, function animationEnd(){
                var gapFillerImage;

                $clone.remove();

                //extract some coords for positioning
                bbox = element.getBBox();

                //create an image into the paper and move it to the selected shape
                gapFiller = graphic.createBorderedImage(interaction.paper, {
                    url     :  $img.attr('src'),
                    left    : bbox.x + (8 * (currentCount - 1)),
                    top     : bbox.y + (8 * (currentCount - 1)),
                    width   : parseInt($img.attr('width'), 10),
                    height  : parseInt($img.attr('height'), 10),
                    padding : 0,
                    border  : false,
                    shadow  : true
                })
                .data('identifier', id)
                .toFront();

                gapFillerImage = gapFiller[2].node;
                interact(gapFillerImage).on('tap', function (e) {
                    var target = e.currentTarget;
                    var rElement = interaction.paper.getById(target.raphaelid);

                    e.preventDefault();
                    e.stopPropagation();

                    // adding a new gapfiller on the hotspot by simulating a click on the underlying shape...
                    if($gapList.find('.active').length > 0){
                        interactUtils.tapOn(element.node);

                    // ... or removing the existing gapfiller
                    } else {
                        //update the element matching array
                        element.data('matching', _.without(element.data('matching') || [], rElement.data('identifier')));

                        //delete interaction.gapFillers[interaction.gapFillers.indexOf(gapFiller)];
                        interaction.gapFillers = _.without(interaction.gapFillers, gapFiller);

                        gapFiller.remove();

                        _unsetChoice(interaction, $active);

                        containerHelper.triggerResponseChangeEvent(interaction);
                    }
                });

                interaction.gapFillers.push(gapFiller);

                containerHelper.triggerResponseChangeEvent(interaction);
            });
        }
    };

    /**
     * Render a choice (= hotspot) inside the paper.
     * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
     *
     * @private
     * @param {Object} interaction
     * @param {Object} choice - the hotspot choice to add to the interaction
     */
    var _renderChoice  =  function _renderChoice(interaction, choice){

        //create the shape
        var rElement = graphic.createElement(interaction.paper, choice.attr('shape'), choice.attr('coords'), {
            id : choice.serial,
            title : __('Select an image first'),
            hover : false
        })
        .data('max', choice.attr('matchMax') )
        .data('matching', []);

        interact(rElement.node).on('tap', function onClickShape(){
            handleShapeSelect();
        });

        if (isDragAndDropEnabled) {
            interact(rElement.node).dropzone({
                overlap: 0.15,
                ondragenter: function() {
                    if (_isMatchable(rElement)) {
                        graphic.setStyle(rElement, 'hover');
                        activeDrop = rElement.node;
                    }
                },
                ondrop: function () {
                    if (_isMatchable(rElement)) {
                        graphic.setStyle(rElement, 'selectable');
                        handleShapeSelect();
                        activeDrop = null;
                    }
                },
                ondragleave: function() {
                    if (_isMatchable(rElement)) {
                        graphic.setStyle(rElement, 'selectable');
                        activeDrop = null;
                    }
                }
            });
        }

        function handleShapeSelect() {
            // check if can make the shape selectable on click
            if(_isMatchable(rElement) && rElement.selectable === true){
                _selectShape(interaction, rElement);
            }
        }
    };

    var _iFrameDragFix = function _iFrameDragFix(draggableSelector, target) {
        interactUtils.iFrameDragFixOn(function () {
            if (activeDrop) {
                interact(activeDrop).fire({
                    type: 'drop',
                    target: activeDrop,
                    relatedTarget: target
                });
            }
            interact(draggableSelector).fire({
                type: 'dragend',
                target: target
            });
        });
    };

    /**
     * Render the list of gap fillers
     * @private
     * @param {Object} interaction
     * @param {jQueryElement} $gapList - the list than contains the orderers
     */
    var _renderGapList = function _renderGapList(interaction, $gapList){

        var gapFillersSelector = $gapList.selector + ' li';
        var dragOptions;

        interact(gapFillersSelector).on('tap', function onClickGapImg(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleActiveGapState($(e.currentTarget));
        });

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

            $(gapFillersSelector).each(function(index, gap) {
                interact(gap)
                .draggable(_.assign({}, dragOptions, {
                    onstart: function (e) {
                        var $target = $(e.target);
                        _setActiveGapState($target);
                        $target.addClass('dragged');

                        _iFrameDragFix(gapFillersSelector, e.target);
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx, e.dy);
                    },
                    onend: function (e) {
                        var $target = $(e.target);
                        _setInactiveGapState($target);
                        $target.removeClass('dragged');
                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();
                    }
                }))
                .styleCursor(false);
            });
        }

        function toggleActiveGapState($target) {
            if(!$target.hasClass('disabled')){
                if($target.hasClass('active')){
                    _setInactiveGapState($target);
                } else {
                    _setActiveGapState($target);
                }
            }
        }

        function _setActiveGapState($target) {
            $gapList.children('li').removeClass('active');
            $target.addClass('active');
            _shapesSelectable(interaction);
        }

        function _setInactiveGapState($target) {
            $target.removeClass('active');
            _shapesUnSelectable(interaction);
        }
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @return {Promise}
     */
    var render = function render(interaction){
        var self = this;

        return new Promise(function(resolve){

            var $container = containerHelper.get(interaction);
            var $gapList = $('ul.source', $container);
            var background = interaction.object.attributes;

            interaction.gapFillers = [];

            if (self.getOption && self.getOption("enableDragAndDrop") && self.getOption("enableDragAndDrop").graphicGapMatch) {
                isDragAndDropEnabled = self.getOption("enableDragAndDrop").graphicGapMatch;
            }

            $container
                .off('resized.qti-widget.resolve')
                .one('resized.qti-widget.resolve', resolve);

            //create the paper
            interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, interaction.serial, {
                width       : background.width,
                height      : background.height,
                img         : self.resolveUrl(background.data),
                imgId       : 'bg-image-' + interaction.serial,
                container   : $container,
                resize      : function(newSize, factor){
                    $gapList.css('max-width', newSize + 'px');
                    if(factor !== 1){
                        $gapList.find('img').each(function(){
                            var $img = $(this);
                            $img.width( $img.attr('width') * factor );
                            $img.height( $img.attr('height') * factor );
                        });
                    }
                }
            });

            //call render choice for each interaction's choices
            _.forEach(interaction.getChoices(), _.partial(_renderChoice, interaction));

            //create the list of gap images
            _renderGapList(interaction, $gapList);

            //clicking the paper to reset selection
            _paperUnSelect(interaction);

        });
    };


    /**
     * Get the responses from the interaction
     * @private
     * @param {Object} interaction
     * @returns {Array} of matches
     */
    var _getRawResponse = function _getRawResponse(interaction){
        var pairs = [];
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(element && _.isArray(element.data('matching'))){
                _.forEach(element.data('matching'), function(gapImg){

                    //backward support of previous order
                    if(isDirectedPairFlipped){
                        pairs.push([choice.id(), gapImg]);
                    } else {
                        pairs.push([gapImg, choice.id()]);
                    }
                });
            }
        });
        return _.sortBy(pairs, [0, 1]);
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){
        var $container = containerHelper.get(interaction);
        var responseValues;
        if(response && interaction.paper){
            try{
                responseValues = pciResponse.unserialize(response, interaction);
            } catch(e){
                responseValues = null;
            }

            if(_.isArray(responseValues)){
                _.forEach(interaction.getChoices(), function(choice){
                    var element = interaction.paper.getById(choice.serial);
                    if(element){
                        _.forEach(responseValues, function(pair){
                            var responseChoice;
                            var responseGap;
                            if(pair.length === 2){

                                //backward support of previous order
                                responseChoice = isDirectedPairFlipped ? pair[0] : pair[1];
                                responseGap    = isDirectedPairFlipped ? pair[1] : pair[0];
                                if(responseChoice === choice.id()){
                                    $("[data-identifier=" + responseGap + "]", $container).addClass('active');
                                    _selectShape(interaction, element, false);
                                }
                            }
                        });
                    }
                });
            }
        }
    };

    /**
     * Reset the current responses of the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {object} interaction
     */
    var resetResponse = function resetResponse(interaction){
        _shapesUnSelectable(interaction);

        _.forEach(interaction.gapFillers, function(gapFiller){
            interactUtils.tapOn(gapFiller.items[2][0]); // this refers to the gapFiller image
        });
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        var raw = _getRawResponse(interaction);
        return pciResponse.serialize(raw, interaction);
    };

    /**
     * Clean interaction destroy
     * @param {Object} interaction
     */
    var destroy = function destroy(interaction){
        var $container;
        if(interaction.paper){
            $container = containerHelper.get(interaction);

            $(window).off('resize.qti-widget.' + interaction.serial);
            $container.off('resize.qti-widget.' + interaction.serial);

            interaction.paper.clear();
            instructionMgr.removeInstructions(interaction);

            $('.main-image-box', $container).empty().removeAttr('style');
            $('.image-editor', $container).removeAttr('style');
            $('ul', $container).empty();

            interact($container.find('ul.source li').selector).unset(); // gapfillers
            interact($container.find('.main-image-box rect').selector).unset(); // choices/hotspot
        }
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
        if(_.isObject(state)){
            if(state.response){
                interaction.resetResponse();
                interaction.setResponse(state.response);
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
        var state =  {};
        var response =  interaction.getResponse();

        if(response){
            state.response = response;
        }
        return state;
    };

    /**
     * Expose the common renderer for the hotspot interaction
     * @exports qtiCommonRenderer/renderers/interactions/HotspotInteraction
     */
    return {
        qtiClass:              'graphicGapMatchInteraction',
        template:              tpl,
        render:                render,
        getContainer:          containerHelper.get,
        setResponse:           setResponse,
        getResponse:           getResponse,
        resetResponse:         resetResponse,
        destroy:               destroy,
        setState:              setState,
        getState:              getState,
        isDirectedPairFlipped: isDirectedPairFlipped
    };
});
