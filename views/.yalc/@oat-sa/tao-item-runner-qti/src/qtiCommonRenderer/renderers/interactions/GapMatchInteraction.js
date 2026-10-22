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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import _ from 'lodash';
import $ from 'jquery';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/gapMatchInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import interact from 'interact';
import interactUtils from 'ui/interactUtils';

/**
 * Global variable to count number of choice usages:
 * @type {object}
 */
var _choiceUsages = {};

var setChoice = function (interaction, $choice, $target) {
    const choiceSerial = $choice.data('serial');
    const choice = interaction.getChoice(choiceSerial);

    if (!_choiceUsages[choiceSerial]) {
        _choiceUsages[choiceSerial] = 0;
    }
    _choiceUsages[choiceSerial]++;

    $target.data('serial', choiceSerial).html($choice.html()).addClass('filled');

    if (
        !interaction.responseMappingMode &&
        choice.attr('matchMax') &&
        _choiceUsages[choiceSerial] >= choice.attr('matchMax')
    ) {
        $choice.attr('class', 'deactivated');
    }

    containerHelper.triggerResponseChangeEvent(interaction);
};

var unsetChoice = function (interaction, $choice) {
    var serial = $choice.data('serial');
    var $container = containerHelper.get(interaction);

    $container
        .find('.choice-area [data-serial=' + serial + ']')
        .removeClass()
        .addClass('qti-choice');

    _choiceUsages[serial]--;

    $choice.removeClass('filled').removeData('serial').html('&nbsp;');

    if (!interaction.swapping) {
        //set correct response
        containerHelper.triggerResponseChangeEvent(interaction);
    }
};

const getChoice = function (interaction, identifier) {
    const $container = containerHelper.get(interaction);
    return $(`.choice-area [data-identifier="${identifier}"]`, $container);
};

const getChoiceBySerial = function (interaction, serial) {
    const $container = containerHelper.get(interaction);
    return $(`.choice-area [data-serial="${serial}"]`, $container);
};

const getGap = function (interaction, identifier) {
    const $container = containerHelper.get(interaction);
    return $(`.qti-flow-container [data-identifier="${identifier}"]`, $container);
};

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
 *
 * @param {object} interaction
 */
const render = function (interaction) {
    const $container = containerHelper.get(interaction);
    const $choiceArea = $container.find('.choice-area');
    const $flowContainer = $container.find('.qti-flow-container');

    let $activeChoice = null;
    let $activeDrop = null;

    let isDragAndDropEnabled;
    let dragOptions;
    let scaleX, scaleY;

    const choiceSelector = `${$choiceArea.selector} .qti-choice`;
    const gapSelector = `${$flowContainer.selector} .gapmatch-content`;
    const filledGapSelector = `${gapSelector}.filled`;

    var _setChoice = function ($choice, $target) {
        return setChoice(interaction, $choice, $target);
    };

    var _resetSelection = function () {
        if ($activeChoice) {
            $activeChoice.removeClass('active');
            $container.find('.empty').removeClass('empty');
            $choiceArea.removeClass('droppable dropzone');
            $(document.body).off('click.gap-match');
            $activeChoice = null;
        }
    };

    var _unsetChoice = function ($choice) {
        return unsetChoice(interaction, $choice);
    };

    // Drag & drop handlers

    if (this.getOption && this.getOption('enableDragAndDrop') && this.getOption('enableDragAndDrop').gapMatch) {
        isDragAndDropEnabled = this.getOption('enableDragAndDrop').gapMatch;
    }

    function _iFrameDragFix(draggableSelector, target) {
        interactUtils.iFrameDragFixOn(function () {
            if ($activeDrop) {
                interact(gapSelector).fire({
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
        const touchPatch = interactUtils.touchPatchFactory();
        interaction.data('touchPatch', touchPatch);

        dragOptions = {
            inertia: false,
            autoScroll: true,
            restrict: {
                restriction: '.qti-interaction',
                endOnly: false,
                elementRect: { top: 0, left: 1, bottom: 1, right: 1 }
            }
        };

        // makes choices draggables
        interact(choiceSelector)
            .draggable(
                _.assign({}, dragOptions, {
                    onstart: function (e) {
                        var $target = $(e.target);
                        var scale;
                        $target.addClass('dragged');
                        _handleChoiceSelect($target);

                        _iFrameDragFix(choiceSelector, e.target);
                        scale = interactUtils.calculateScale(e.target);
                        scaleX = scale[0];
                        scaleY = scale[1];

                        touchPatch.onstart();
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                    },
                    onend: function (e) {
                        var $target = $(e.target);
                        $target.removeClass('dragged');

                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();
                        touchPatch.onend();

                        _.defer(() => {
                            _resetSelection();
                        });
                    }
                })
            )
            .styleCursor(false)
            .actionChecker(touchPatch.actionChecker);

        // makes filled gaps draggables
        interact(filledGapSelector)
            .draggable(
                _.assign({}, dragOptions, {
                    onstart: function (e) {
                        var $target = $(e.target);
                        var scale;
                        $target.addClass('dragged');
                        _handleChoiceSelect($target);

                        _iFrameDragFix(filledGapSelector, e.target);
                        scale = interactUtils.calculateScale(e.target);
                        scaleX = scale[0];
                        scaleY = scale[1];

                        touchPatch.onstart();
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                    },
                    onend: function (e) {
                        var $target = $(e.target);
                        $target.removeClass('dragged');

                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();
                        touchPatch.onend();

                        _.defer(() => {
                            _resetSelection();
                        });
                    }
                })
            )
            .styleCursor(false)
            .actionChecker(touchPatch.actionChecker);

        // makes gaps droppables
        interact(gapSelector).dropzone({
            overlap: 0.05,
            ondragenter: function (e) {
                var $target = $(e.target),
                    $dragged = $(e.relatedTarget);

                $activeDrop = $target;
                $target.addClass('dropzone');
                $dragged.addClass('droppable');
            },
            ondrop: function (e) {
                _handleGapSelect($(e.target));

                this.ondragleave(e);
            },
            ondragleave: function (e) {
                var $target = $(e.target),
                    $dragged = $(e.relatedTarget);

                $target.removeClass('dropzone');
                $dragged.removeClass('droppable');

                $activeDrop = null;
            }
        });

        //makes choices container droppable
        interact($choiceArea.selector).dropzone({
            overlap: 0.15,
            ondragenter: function (e) {
                const $target = $(e.target);
                if ($target.hasClass('droppable')) {
                    $target.addClass('dropzone');
                }
            },
            ondrop: function (e) {
                const $target = $(e.target);
                if ($target.hasClass('droppable')) {
                    $target.removeClass('dropzone');

                    if ($activeChoice) {
                        _unsetChoice($activeChoice);
                        _resetSelection();
                    }
                }
            },
            ondragleave: function (e) {
                $(e.target).removeClass('dropzone');
            }
        });
    }

    // Point & click handlers

    interact($container.selector).on('tap', function (e) {
        e.stopPropagation();
        _resetSelection();
    });

    interact(choiceSelector).on('tap', function (e) {
        e.stopPropagation();
        _handleChoiceSelect($(e.currentTarget));
        e.preventDefault();
    });

    interact(gapSelector).on('tap', function (e) {
        e.stopPropagation();
        _handleGapSelect($(e.currentTarget));
        e.preventDefault();
    });

    // Common handlers

    function _handleChoiceSelect($target) {
        if (($activeChoice && $target.hasClass('active')) || $target.hasClass('deactivated')) {
            return;
        }
        _resetSelection();

        $activeChoice = $target.addClass('active');
        $(gapSelector).addClass('empty');

        if ($target.hasClass('filled')) {
            $choiceArea.addClass('droppable');
        }

        $(document.body).on('click.gap-match', function (e) {
            if (!$container.get(0).contains(e.target)) {
                _resetSelection();
            }
        });
    }

    function _animateChoiceMovement($fromElement, $toElement) {
        const $animatedClone = interactUtils.animateMoveElement({
            $appendTo: $choiceArea,
            $fromElement,
            $toElement
        });
        $animatedClone.addClass('animated');
    }

    function _handleGapSelect($target) {
        const choiceSerial = $activeChoice && $activeChoice.data('serial');
        const targetSerial = $target.data('serial');

        const isInserting = $activeChoice && !$activeChoice.hasClass('filled') && targetSerial !== choiceSerial;
        const isMoving = $activeChoice && $activeChoice.hasClass('filled') && targetSerial !== choiceSerial;
        const isRemoving = $target.hasClass('filled') && !$activeChoice;

        if (isInserting) {
            // place choice from the choice area to the gap.
            if (targetSerial) {
                // remove existing placed choice if gap is filled.
                _unsetChoice($target);
            }
            _setChoice($activeChoice, $target);
        } else if (isMoving) {
            // move placed choice to another gap.
            _unsetChoice($activeChoice);
            if (targetSerial) {
                // remove existing placed choice if gap is filled.
                _unsetChoice($target);
            }
            _setChoice(getChoiceBySerial(interaction, choiceSerial), $target);
        } else if (isRemoving) {
            //remove existing placed choice
            _animateChoiceMovement($target, getChoiceBySerial(interaction, targetSerial));
            _unsetChoice($target);
        }

        _resetSelection();
    }
};

var resetResponse = function (interaction) {
    var $container = containerHelper.get(interaction);

    $('.gapmatch-content.active', $container).removeClass('active');
    $('.gapmatch-content', $container).each(function () {
        unsetChoice(interaction, $(this));
    });
};

var _setPairs = function (interaction, pair) {
    if (pair && pair.length) {
        setChoice(interaction, getChoice(interaction, pair[0]), getGap(interaction, pair[1]).find('.gapmatch-content'));
    }
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
var setResponse = function (interaction, response) {
    resetResponse(interaction);
    let pairs = pciResponse.unserialize(response, interaction);
    if (_.isArray(pairs) && _.isArray(pairs[0])) {
        _.forEach(pairs, pair => _setPairs(interaction, pair));
    } else {
        _setPairs(interaction, pairs);
    }
};

var _getRawResponse = function (interaction) {
    var response = [];
    var $container = containerHelper.get(interaction);
    $('.gapmatch-content', $container).each(function () {
        var choiceSerial = $(this).data('serial'),
            pair = [];

        if (choiceSerial) {
            pair.push(interaction.getChoice(choiceSerial).attr('identifier'));
        }
        pair.push($(this).data('identifier'));

        if (pair.length === 2) {
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
var getResponse = function (interaction) {
    return pciResponse.serialize(_getRawResponse(interaction), interaction);
};

var destroy = function (interaction) {
    var $container = containerHelper.get(interaction);

    //remove event
    if (interaction.data('touchPatch')) {
        interaction.data('touchPatch').destroy();
        interaction.removeData('touchPatch');
    }
    interact($container.selector).unset();
    interact($container.find('.choice-area').selector + ' .qti-choice').unset();
    interact($container.find('.qti-flow-container').selector + ' .gapmatch-content').unset();
    $(document.body).off('click.gap-match');

    //restore selection
    $container.find('.gapmatch-content').empty();
    $container.find('.active').removeClass('active');
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
var setState = function setState(interaction, state) {
    var $container;

    if (_.isObject(state)) {
        if (state.response) {
            interaction.resetResponse();
            interaction.setResponse(state.response);
        }

        //restore order of previously shuffled choices
        if (_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())) {
            $container = containerHelper.get(interaction);

            $('.choice-area .qti-choice', $container)
                .sort(function (a, b) {
                    var aIndex = _.indexOf(state.order, $(a).data('identifier'));
                    var bIndex = _.indexOf(state.order, $(b).data('identifier'));
                    if (aIndex > bIndex) {
                        return 1;
                    }
                    if (aIndex < bIndex) {
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
var getState = function getState(interaction) {
    var $container;
    var state = {};
    var response = interaction.getResponse();

    if (response) {
        state.response = response;
    }

    //we store also the choice order if shuffled
    if (interaction.attr('shuffle') === true) {
        $container = containerHelper.get(interaction);

        state.order = [];
        $('.choice-area .qti-choice', $container).each(function () {
            state.order.push($(this).data('identifier'));
        });
    }
    return state;
};

/**
 * Expose the common renderer for the gapmatch interaction
 * @exports qtiCommonRenderer/renderers/interactions/GapMatchInteraction
 */
export default {
    qtiClass: 'gapMatchInteraction',
    template: tpl,
    render: render,
    getContainer: containerHelper.get,
    setResponse: setResponse,
    getResponse: getResponse,
    resetResponse: resetResponse,
    destroy: destroy,
    setState: setState,
    getState: getState
};
