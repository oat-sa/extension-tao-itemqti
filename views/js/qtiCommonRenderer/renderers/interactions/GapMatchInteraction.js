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
    'i18n',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/gapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'OAT/interact'
], function(_, __, $, tpl, containerHelper, instructionMgr, pciResponse, interact){
    'use strict';

    /**
     * Global variable to count number of choice usages:
     * @type {object}
     */
    var _choiceUsages = {};

    var setChoice = function(interaction, $choice, $target){

        var choiceSerial = $choice.data('serial'),
            choice = interaction.getChoice(choiceSerial);

        if(!_choiceUsages[choiceSerial]){
            _choiceUsages[choiceSerial] = 0;
        }
        _choiceUsages[choiceSerial]++;

        $target
            .data('serial', choiceSerial)
            .html($choice.html())
            .addClass('filled');

        if(!interaction.responseMappingMode &&
            choice.attr('matchMax') &&
            _choiceUsages[choiceSerial] >= choice.attr('matchMax')){

            $choice.attr("class", "deactivated");
        }

        containerHelper.triggerResponseChangeEvent(interaction);
    };

    var unsetChoice = function(interaction, $choice, animate){

        var serial = $choice.data('serial');
        var $container = containerHelper.get(interaction);

        $container.find('.choice-area [data-serial=' + serial + ']').removeClass().addClass('qti-choice');

        _choiceUsages[serial]--;

        $choice
            .removeClass('filled')
            .removeData('serial')
            .empty();

        if(!interaction.swapping){
            //set correct response
            containerHelper.triggerResponseChangeEvent(interaction);
        }
    };

    var getChoice = function(interaction, identifier){
        var $container = containerHelper.get(interaction);
        return $('.choice-area [data-identifier=' + identifier + ']', $container);
    };

    var getGap = function(interaction, identifier){
        var $container = containerHelper.get(interaction);
        return $('.qti-flow-container [data-identifier=' + identifier + ']', $container);
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     */
    var render = function(interaction){

        var $container = containerHelper.get(interaction);
        var $choiceArea = $container.find('.choice-area'),
            $flowContainer = $container.find('.qti-flow-container'),
            $activeChoice = null;
        var $choiceRemover = $('<span>', {'class' : 'icon-undo remove-choice', 'title' : __('remove')});

        var _getChoice = function(serial){
            return $choiceArea.find('[data-serial=' + serial + ']');
        };

        var _setChoice = function($choice, $target){
            return setChoice(interaction, $choice, $target);
        };

        var _resetSelection = function(){
            if($activeChoice){
                $flowContainer.find('.remove-choice').remove();
                $activeChoice.removeClass('deactivated active');
                $container.find('.empty').removeClass('empty');
                $activeChoice = null;
            }
        };

        var _unsetChoice = function($choice){
            return unsetChoice(interaction, $choice);
        };

        var _isInsertionMode = function(){
            return ($activeChoice && !$activeChoice.hasClass('filled'));
        };

        var _isModeEditing = function(){
            return ($activeChoice && $activeChoice.hasClass('filled'));
        };

        // $container.on('click.commonRenderer', function(e){
        interact($container.selector).on("tap", function(e) {
            e.stopPropagation();
            _resetSelection();
        });










        /// ==================================
        /// START INTERACT
        /// ==================================


        // drag choice
        //todo Change selector to scope on the interaction
        interact('.choice-area .qti-choice')
          .draggable({
              inertia: false,
              autoScroll: true,
              restrict: {
                  restriction: ".qti-interaction",
                  endOnly: false,
                  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
              },
              onstart: function(e) {
                  console.log("CHOICE : start drag");
                  var $target = $(e.target);
                  handleChoiceSelectEvent($target);
              },
              // call this function on every dragmove event
              onmove: dragMoveListener,
              onend: function (event) {
                  // move back the element
                  var target = event.target;
                  target.style.webkitTransform =
                    target.style.transform =
                      'translate(0px, 0px)';

                  target.setAttribute('data-x', 0);
                  target.setAttribute('data-y', 0);
              }
          });

        // drag choice on target
        //todo Change selector to scope on the interaction
        interact('.qti-flow-container .gapmatch-content.filled')
          .draggable({
              inertia: false,
              autoScroll: true,
              restrict: {
                  restriction: ".qti-interaction",
                  endOnly: false,
                  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
              },
              onstart: function(e) {
                  console.log("TARGET : start drag");
                  var $target = $(e.target);
                  handleTargetSelectEvent($target);
                  
                  // $target.css("background", "none");
              },
              // call this function on every dragmove event
              onmove: dragMoveListener,
              onend: function (event) {
                  // move back the element
                  var $target = $(event.target);
                  // move back the element
                  var target = event.target;
                  target.style.webkitTransform =
                    target.style.transform =
                      'translate(0px, 0px)';

                  target.setAttribute('data-x', 0);
                  target.setAttribute('data-y', 0);
                  console.log("TARGET DRAG END ");
                  if ($activeChoice) {
                      _unsetChoice($activeChoice);
                      _resetSelection();
                  }
              }
          }).preventDefault(true);

        function dragMoveListener (event) {
            var target = event.target,
              
            // keep the dragged position in the data-x/data-y attributes
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            console.log("dragging!");

            // translate the element
            target.style.webkitTransform =
              target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }

        // drop
        interact('.qti-flow-container .gapmatch-content').dropzone({
            // only accept elements matching this CSS selector
            //accept: '#yes-drop',
            // Require a 75% element overlap for a drop to be possible
            overlap: 0.15,

            // listen for drop related events:
            /* */
            ondropactivate: function (event) {
                // add active dropzone feedback
                console.log("ondropactivate : "+ JSON.stringify(event.relatedTarget));
                // event.target.classList.add('drop-active');

            },
            ondragenter: function (event) {
                console.log("ondragenter !");
                var draggableElement = event.relatedTarget,
                  dropzoneElement = event.target;

                // feedback the possibility of a drop
                $(event.target).css("border-color", "red");
            },
            ondragleave: function (event) {
                console.log("ondragleave !");
                $(event.target).css("border-color", "inherit");
                // $(event.target).css("background", "orange");
            },
            /* */
            ondrop: function (e) {
                console.log("dropped !");
                console.log("TARGET DROP START");
                var $target = $(e.target);
                // e.stopPropagation();
                handleTargetEvent($target);
                // e.preventDefault();
            /* */
            },
            ondropdeactivate: function (event) {
                console.log("ondropdeactivate !");
                // $(event.target).css("background", "green");
            /* */
            }
        });

        /// ==================================
        /// END INTERACT
        /// ==================================








        var choiceSelector = $choiceArea.selector + " .qti-choice";

        interact(choiceSelector).on("tap", function (e) {
        // $(choiceSelector).on('click.commonRenderer', function(e){
        // $choiceArea.on('click.commonRenderer', '>li', function(e){
            console.log("CHOICE : start clic");
            var $target = $(e.currentTarget);
            e.stopPropagation();
            handleChoiceSelectEvent($target);
            e.preventDefault();
        });

        // $flowContainer.on('click.commonRenderer', '.gapmatch-content', function(e){
        interact($flowContainer.selector + " .gapmatch-content").on("tap", function(e) {
            console.log("TARGET : start clic, preparing handleTArgetEvent");
            var $target = $(e.currentTarget);
            e.stopPropagation();
            handleTargetEvent($target);
            e.preventDefault();

        });

        interact('.remove-choice').on('tap', function (e) {
            e.stopPropagation();
            _unsetChoice($activeChoice);
            _resetSelection();
            e.preventDefault();
        });
        
        function handleChoiceSelectEvent($target) {
            if (($activeChoice && $target.hasClass('active')) || $target.hasClass('deactivated')) {
                return;
            }
            _resetSelection();

            $activeChoice = $target.addClass('active');
            $flowContainer.find('.gapmatch-content').addClass('empty');
        }

        function handleTargetSelectEvent($target) {
            // if (($activeChoice && $target.hasClass('active')) || $target.hasClass('deactivated')) {
            //     return;
            // }
            // _resetSelection();

            $activeChoice = $target.addClass('active');
            $flowContainer.find('.gapmatch-content').addClass('empty');
        }
        function handleTargetEvent($target) {
            if(_isInsertionMode()){

                // debugger;
                console.log('TARGET : HANDLE EVENT (DROP OR CLIC) = _isInsertionMode // inserting a choice in an empty target');

                var choiceSerial = $activeChoice.data('serial'),
                  targetSerial = $target.data('serial');

                if(targetSerial !== choiceSerial){

                    //set choices:
                    if(targetSerial){
                        _unsetChoice($target);
                    }

                    _setChoice($activeChoice, $target);
                }

                $activeChoice.removeClass('active');
                $container.find('.empty').removeClass('empty');
                $activeChoice = null;

            }else if(_isModeEditing()){

                console.log('TARGET : HANDLE EVENT (DROP OR CLIC) = _isModeEditing // clicking on a filled target');

                //editing mode:
                var targetSerial = $target.data('serial'),
                  choiceSerial = $activeChoice.data('serial');

                if(targetSerial !== choiceSerial){
                    _unsetChoice($activeChoice);
                    if(targetSerial){
                        //swapping:
                        _unsetChoice($target);
                        _setChoice(_getChoice(targetSerial), $activeChoice);
                    }
                    _setChoice(_getChoice(choiceSerial), $target);
                }

                _resetSelection();

            }else if($target.data('serial') && $target.hasClass('filled')){

                console.log('TARGET : HANDLE EVENT (DROP OR CLIC) = showing remove feature');

                var serial = $target.data('serial');

                $activeChoice = $target;
                $activeChoice.addClass('active');
                
                // debugger;

                $flowContainer.find('>li>div').filter(function(){
                    return $target.data('serial') !== serial;
                }).addClass('empty');

                $choiceArea.find('>li:not(.deactivated)').filter(function(){
                    return $target.data('serial') !== serial;
                }).addClass('empty');

                //append trash bin:
                $target.append($choiceRemover);
            }
        }
        
    };

    var resetResponse = function(interaction){
        var $container = containerHelper.get(interaction);

        //restore selected choices:
        $('.gapmatch-content .active', $container).trigger('click.commonRenderer');
        $('.gapmatch-content', $container).each(function(){
            unsetChoice(interaction, $(this));
        });
    };

    var _setPairs = function(interaction, pairs){

        _.each(pairs, function(pair){
            if(pair){
                setChoice(interaction, getChoice(interaction, pair[0]), getGap(interaction, pair[1]).find('.gapmatch-content'));
            }
        });
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
        resetResponse(interaction);
        _setPairs(interaction, pciResponse.unserialize(response, interaction));
    };

    var _getRawResponse = function(interaction){

        var response = [];
        var $container = containerHelper.get(interaction);
        $('.gapmatch-content', $container).each(function(){
            var choiceSerial = $(this).data('serial'),
                pair = [];

            if(choiceSerial){
                pair.push(interaction.getChoice(choiceSerial).attr('identifier'));
            }
            pair.push($(this).data('identifier'));

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
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10307
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){

        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    var destroy = function(interaction){

        var $container = containerHelper.get(interaction);

        //remove event
        $(document).off('.commonRenderer');
        $container.off('.commonRenderer');
        $container.find('.choice-area').off('.commonRenderer');
        $container.find('.qti-flow-container').off('.commonRenderer');

        //restore selection
        $container.find('.gapmatch-content').empty();
        $container.find('.active').removeClass('active');
        $container.find('.remove-choice').remove();
        $container.find('.empty').removeClass('empty');

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
     * Expose the common renderer for the gapmatch interaction
     * @exports qtiCommonRenderer/renderers/interactions/GapMatchInteraction
     */
    return {
        qtiClass : 'gapMatchInteraction',
        template : tpl,
        render : render,
        getContainer : containerHelper.get,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : destroy,
        setState : setState,
        getState : getState
    };
});
