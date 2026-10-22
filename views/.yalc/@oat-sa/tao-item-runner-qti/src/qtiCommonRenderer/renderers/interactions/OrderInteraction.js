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
 * Copyright (c) 2014-2026 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import _ from 'lodash';
import $ from 'jquery';
import __ from 'i18n';
import 'core/mouseEvent';
import features from 'services/features';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/orderInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instructionMgr from 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import interact from 'interact';
import interactUtils from 'ui/interactUtils';

const orientationSelectionEnabled = features.isVisible('taoQtiItem/creator/interaction/order/property/orientation');

const _freezeSize = function ($container) {
    const $orderArea = $container.find('.order-interaction-area');
    $orderArea.height($orderArea.height());
};

const _setInstructions = function (interaction) {
    const $container = containerHelper.get(interaction);
    const $choiceArea = $('.choice-area', $container),
        $resultArea = $('.result-area', $container),
        min = parseInt(interaction.attr('minChoices'), 10),
        max = parseInt(interaction.attr('maxChoices'), 10);

    if (min) {
        instructionMgr.appendInstruction(interaction, __('You must use at least %d choices', min), function () {
            if ($resultArea.find('>li').length >= min) {
                this.setLevel('success');
            } else {
                this.reset();
            }
        });
    }

    if (max && max < _.size(interaction.getChoices())) {
        const instructionMax = instructionMgr.appendInstruction(
            interaction,
            __('You can use maximum %d choices', max),
            function () {
                if ($resultArea.find('>li').length >= max) {
                    $choiceArea.find('>li').addClass('deactivated');
                    this.setMessage(__('Maximum choices reached'));
                } else {
                    $choiceArea.find('>li').removeClass('deactivated');
                    this.reset();
                }
            }
        );

        interact(`${$choiceArea.selector} >li.deactivated`).on('tap', function (e) {
            const $target = $(e.currentTarget);
            $target.addClass('brd-error');
            instructionMax.setLevel('warning', 2000);
            setTimeout(function () {
                $target.removeClass('brd-error');
            }, 150);
        });

        // we don't check for isDragAndDropEnabled on purpose, as this binding is not to allow dragging,
        // but only to provide feedback in case of a drag action on an inactive choice
        interact(`${$choiceArea.selector} >li.deactivated`)
            .draggable({
                onstart: function (e) {
                    const $target = $(e.target);
                    $target.addClass('brd-error');
                    instructionMax.setLevel('warning');
                },
                onend: function (e) {
                    const $target = $(e.target);
                    $target.removeClass('brd-error');
                    instructionMax.setLevel('info');
                }
            })
            .styleCursor(false);
    }
};

const resetResponse = function (interaction) {
    const orderState = interaction.attr('data-order') || interaction.attr('order');
    const isSingleOrder = orderState === 'single';
    const $container = containerHelper.get(interaction);
    const initialOrder = _.keys(interaction.getChoices());
    const $resultArea = $('.result-area', $container);
    const $resultItems = $('.result-area>li', $container);

    $container.find('.qti-choice.active').each(function deactivateChoice() {
        interactUtils.tapOn(this);
    });

    if (isSingleOrder) {
        // if it's a single order interaction, sort the items in result-area in initial order
        $resultItems.detach().sort(function (item1, item2) {
            return _.indexOf(initialOrder, $(item1).data('serial')) - _.indexOf(initialOrder, $(item2).data('serial'));
        });
        $resultArea.empty();
        $resultArea.append($resultItems);
    } else {
        const $choiceArea = $('.choice-area', $container).append($('.result-area>li', $container));
        const $choices = $choiceArea.children('.qti-choice');
        $choices.detach().sort(function (choice1, choice2) {
            return (
                _.indexOf(initialOrder, $(choice1).data('serial')) - _.indexOf(initialOrder, $(choice2).data('serial'))
            );
        });
        $choiceArea.prepend($choices);
    }
};

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10283
 *
 * @param {Object} interaction - the interaction instance
 */
const render = function (interaction) {
    const $container = containerHelper.get(interaction),
        $choiceArea = $container.find('.choice-area'),
        $resultArea = $container.find('.result-area'),
        $iconAdd = $container.find('.icon-add-to-selection'),
        $iconRemove = $container.find('.icon-remove-from-selection'),
        $iconBefore = $container.find('.icon-move-before'),
        $iconAfter = $container.find('.icon-move-after'),
        choiceSelector = `${$choiceArea.selector} >li:not(.deactivated)`,
        resultSelector = `${$resultArea.selector} >li`,
        $dragContainer = $container.find('.drag-container'),
        orderState = interaction.attr('data-order') || interaction.attr('order'),
        isSingleOrder = orderState === 'single',
        orientation =
            interaction.attr('orientation') && orientationSelectionEnabled
                ? interaction.attr('orientation')
                : 'vertical';

    if (isSingleOrder) {
        const $choices = $choiceArea.children('.qti-choice');
        $container.addClass('test-preview');
        $resultArea.append($choices);
    }

    let $activeChoice = null,
        scaleX,
        scaleY,
        isDragAndDropEnabled,
        dragOptions,
        $dropzoneElement;

    const _activeControls = function _activeControls() {
        $iconAdd.addClass('inactive');
        $iconRemove.removeClass('inactive').addClass('active');
        $iconBefore.removeClass('inactive').addClass('active');
        $iconAfter.removeClass('inactive').addClass('active');
    };

    const _resetControls = function _resetControls() {
        $iconAdd.removeClass('inactive');
        $iconRemove.removeClass('active').addClass('inactive');
        $iconBefore.removeClass('active').addClass('inactive');
        $iconAfter.removeClass('active').addClass('inactive');
    };

    const _setSelection = function _setSelection($choice) {
        if ($activeChoice) {
            $activeChoice.removeClass('active');
        }
        $activeChoice = $choice;
        $activeChoice.addClass('active');
    };

    const _resetSelection = function _resetSelection() {
        if ($activeChoice) {
            $activeChoice.removeClass('active');
            $activeChoice = null;
        }
        _resetControls();
    };

    const _addChoiceToSelection = function _addChoiceToSelection($target, position) {
        const $results = $(resultSelector);
        _resetSelection();

        //move choice to the result list:
        if (typeof position !== 'undefined' && position < $results.length) {
            $results.eq(position).before($target);
        } else {
            $resultArea.append($target);
        }

        containerHelper.triggerResponseChangeEvent(interaction);

        //update constraints :
        instructionMgr.validateInstructions(interaction);
    };

    const _toggleResultSelection = function _toggleResultSelection($target) {
        if ($target.hasClass('active')) {
            _resetSelection();
        } else {
            _setSelection($target);
            _activeControls();
        }
    };

    const _removeChoice = function _removeChoice() {
        if ($activeChoice) {
            //restore choice back to choice list
            $choiceArea.append($activeChoice);
            containerHelper.triggerResponseChangeEvent(interaction);

            //update constraints :
            instructionMgr.validateInstructions(interaction);
        }

        _resetSelection();
    };

    const _moveResultBefore = function _moveResultBefore() {
        const $prev = $activeChoice && $activeChoice.prev();

        if ($prev && $prev.length) {
            $prev.before($activeChoice);
            containerHelper.triggerResponseChangeEvent(interaction);
        }
    };

    const _moveResultAfter = function _moveResultAfter() {
        const $next = $activeChoice && $activeChoice.next();

        if ($next && $next.length) {
            $next.after($activeChoice);
            containerHelper.triggerResponseChangeEvent(interaction);
        }
    };

    // Point & click handlers

    interact($container.selector).on('tap', function () {
        _resetSelection();
    });

    interact(choiceSelector).on('tap', function (e) {
        const $target = $(e.currentTarget);

        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.stopPropagation();

        $iconAdd.addClass('triggered');
        setTimeout(function () {
            $iconAdd.removeClass('triggered');
        }, 150);

        _addChoiceToSelection($target);
    });

    interact(resultSelector).on('tap', function (e) {
        const $target = $(e.currentTarget);

        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.stopPropagation();
        _toggleResultSelection($target);
    });

    interact($iconRemove.selector).on('tap', function (e) {
        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.stopPropagation();
        _removeChoice();
    });

    interact($iconBefore.selector).on('tap', function (e) {
        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.stopPropagation();
        _moveResultBefore();
    });

    interact($iconAfter.selector).on('tap', function (e) {
        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.stopPropagation();
        _moveResultAfter();
    });

    // Drag & drop handlers

    if (this.getOption && this.getOption('enableDragAndDrop') && this.getOption('enableDragAndDrop').order) {
        isDragAndDropEnabled = this.getOption('enableDragAndDrop').order;
    }

    function _iFrameDragFix(draggableSelector, target) {
        interactUtils.iFrameDragFixOn(function () {
            if (_isDropzoneVisible()) {
                interact($resultArea.selector).fire({
                    type: 'drop',
                    target: $dropzoneElement.eq(0),
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
        $dropzoneElement = $('<li>', { class: 'dropzone qti-choice' });
        $('<div>', { class: 'qti-block' }).appendTo($dropzoneElement);

        const touchPatch = interactUtils.touchPatchFactory();
        interaction.data('touchPatch', touchPatch);

        dragOptions = {
            inertia: false,
            autoScroll: true,
            restrict: {
                restriction: '.qti-interaction',
                endOnly: false,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }
        };

        // makes choices draggables
        interact(choiceSelector)
            .draggable(
                _.assign({}, dragOptions, {
                    onstart: function (e) {
                        const $target = $(e.target);
                        let scale;
                        $target.addClass('dragged');
                        const rect = e.target.getBoundingClientRect();
                        const styles = window.getComputedStyle(e.target);
                        $target.css({
                            width: rect.width + 'px',
                            height: rect.height + 'px',
                            lineHeight: styles.lineHeight,
                            boxSizing: 'border-box',
                            paddingTop: styles.paddingTop,
                            paddingBottom: styles.paddingBottom,
                            paddingLeft: styles.paddingLeft,
                            paddingRight: styles.paddingRight
                        });

                        _iFrameDragFix(choiceSelector, e.target);
                        scale = interactUtils.calculateScale(e.target);
                        scaleX = scale[0];
                        scaleY = scale[1];

                        touchPatch.onstart();
                    },
                    onmove: function (e) {
                        const $target = $(e.target);
                        interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                        if (_isDropzoneVisible()) {
                            _adjustDropzonePosition($target);
                        }
                    },
                    onend: function (e) {
                        const $target = $(e.target);
                        $target.removeClass('dragged');
                        $target.css({
                            width: '',
                            height: '',
                            lineHeight: '',
                            boxSizing: '',
                            paddingTop: '',
                            paddingBottom: '',
                            paddingLeft: '',
                            paddingRight: ''
                        });
                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();

                        touchPatch.onend();
                    }
                })
            )
            .styleCursor(false)
            .actionChecker(touchPatch.actionChecker);

        // makes result draggables
        interact(resultSelector)
            .draggable(
                _.assign({}, dragOptions, {
                    onstart: function (e) {
                        const $target = $(e.target);
                        let scale;
                        $target.addClass('dragged');
                        const rect = e.target.getBoundingClientRect();
                        const styles = window.getComputedStyle(e.target);
                        $target.css({
                            width: rect.width + 'px',
                            height: rect.height + 'px',
                            lineHeight: styles.lineHeight,
                            boxSizing: 'border-box',
                            paddingTop: styles.paddingTop,
                            paddingBottom: styles.paddingBottom,
                            paddingLeft: styles.paddingLeft,
                            paddingRight: styles.paddingRight
                        });

                        _setSelection($target);

                        // move dragged result to drag container
                        $dragContainer.show();
                        $dragContainer.offset($target.offset());
                        if (orientation === 'horizontal') {
                            $dragContainer.width($(e.currentTarget).width());
                        } else {
                            $dragContainer.width($target.parent().width());
                        }
                        $dragContainer.append($target);

                        _iFrameDragFix(resultSelector, e.target);
                        scale = interactUtils.calculateScale(e.target);
                        scaleX = scale[0];
                        scaleY = scale[1];

                        touchPatch.onstart();
                    },
                    onmove: function (e) {
                        const $target = $(e.target);
                        interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                        if (_isDropzoneVisible()) {
                            _adjustDropzonePosition($target);
                        }
                    },
                    onend: function (e) {
                        const $target = $(e.target),
                            hasBeenDroppedInResultArea = $target.parent === $resultArea;

                        $target.removeClass('dragged');
                        $target.css({
                            width: '',
                            height: '',
                            lineHeight: '',
                            boxSizing: '',
                            paddingTop: '',
                            paddingBottom: '',
                            paddingLeft: '',
                            paddingRight: ''
                        });
                        $dragContainer.hide();

                        if (!_isValidDrop()) {
                            $resultArea.append($target);
                        }

                        interactUtils.restoreOriginalPosition($target);
                        interactUtils.iFrameDragFixOff();

                        touchPatch.onend();
                    }
                })
            )
            .styleCursor(false)
            .actionChecker(touchPatch.actionChecker);

        // makes result area droppable
        interact($resultArea.selector).dropzone({
            overlap: 0.5,
            ondragenter: function (e) {
                const $dragged = $(e.relatedTarget);
                _insertDropzone($dragged);
                $dragged.addClass('droppable');
            },
            ondrop: function (e) {
                const $dragged = $(e.relatedTarget),
                    dropzoneIndex = $(resultSelector).index($dropzoneElement);

                this.ondragleave(e);

                _addChoiceToSelection($dragged, dropzoneIndex);
                interactUtils.restoreOriginalPosition($dragged);
            },
            ondragleave: function (e) {
                const $dragged = $(e.relatedTarget);
                $dropzoneElement.remove();
                $dragged.removeClass('droppable');
            }
        });
    }
    function _isValidDrop() {
        return $.contains($resultArea.get(0), $dropzoneElement.get(0));
    }

    function _isDropzoneVisible() {
        return $.contains($container.get(0), $dropzoneElement.get(0));
    }

    function _insertDropzone($dragged) {
        const draggedMiddle = _getMiddleOf($dragged);
        const $items = $(resultSelector);

        if (!$items.length) {
            $resultArea.append($dropzoneElement);
            return;
        }

        const $lastItem = $items.last();
        const lastBox = $lastItem.get(0).getBoundingClientRect();

        if (orientation === 'horizontal') {
            const isAfterLastRow =
                draggedMiddle.y >= lastBox.top &&
                draggedMiddle.y <= lastBox.bottom &&
                draggedMiddle.x > lastBox.right;

            if (isAfterLastRow) {
                $lastItem.after($dropzoneElement);
                return;
            }
        } else {
            if (draggedMiddle.y > lastBox.bottom) {
                $lastItem.after($dropzoneElement);
                return;
            }
        }

        // Otherwise: find closest item
        let closestIndex = null;
        let closestDistance = Infinity;

        $items.each(function (index) {
            const middle = _getMiddleOf($(this));
            const dx = draggedMiddle.x - middle.x;
            const dy = draggedMiddle.y - middle.y;
            const distance = dx * dx + dy * dy;

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== null) {
            $items.eq(closestIndex).before($dropzoneElement);
        } else {
            $resultArea.append($dropzoneElement);
        }

        $dropzoneElement.outerHeight($dragged.outerHeight(true));
        $dropzoneElement.find('div').text($dragged.text());
    }

    function _adjustDropzonePosition($dragged) {
        _insertDropzone($dragged);
    }

    function _getMiddleOf($element) {
        const elementBox = $element.get(0).getBoundingClientRect();
        return {
            x: elementBox.left + elementBox.width / 2,
            y: elementBox.top + elementBox.height / 2
        };
    }

    // rendering init

    _setInstructions(interaction);

    //bind event listener in case the attributes change dynamically on runtime
    $(document).on('attributeChange.qti-widget.commonRenderer', function (e, data) {
        if (data.element.getSerial() === interaction.getSerial()) {
            if (data.key === 'maxChoices' || data.key === 'minChoices') {
                instructionMgr.removeInstructions(interaction);
                _setInstructions(interaction);
                instructionMgr.validateInstructions(interaction);
            }
        }
    });

    _freezeSize($container);
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
const setResponse = function (interaction, response) {
    const $container = containerHelper.get(interaction);
    const $choiceArea = $('.choice-area', $container);
    const $resultArea = $('.result-area', $container);
    // legacy order attr support
    const orderState = interaction.attr('data-order') || interaction.attr('order');
    const isSingleOrder = orderState === 'single';

    if (response === null || _.isEmpty(response)) {
        resetResponse(interaction);
    } else {
        try {
            _.forEach(pciResponse.unserialize(response, interaction), function (identifier) {
                $resultArea.append(
                    (isSingleOrder ? $resultArea : $choiceArea).find(`[data-identifier="${identifier}"]`)
                );
            });
        } catch (e) {
            throw new Error(`wrong response format in argument : ${e}`);
        }
    }

    instructionMgr.validateInstructions(interaction);
};

const _getRawResponse = function (interaction) {
    const $container = containerHelper.get(interaction);
    const response = [];
    $('.result-area>li', $container).each(function () {
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
const getResponse = function (interaction) {
    return pciResponse.serialize(_getRawResponse(interaction), interaction);
};

/**
 * Set additionnal data to the template (data that are not really part of the model).
 * @param {Object} interaction - the interaction
 * @param {Object} [data] - interaction custom data
 * @returns {Object} custom data
 */
const getCustomData = function (interaction, data) {
    const iconAddDirection = {
        top: 'icon-down',
        bottom: 'icon-up',
        left: 'icon-right',
        right: 'icon-left'
    };
    const iconRemoveDirection = {
        top: 'icon-up',
        bottom: 'icon-down', 
        left: 'icon-left',
        right: 'icon-right'
    };
    const position =
        interaction.attr('data-position') ||
        (interaction.attr('orientation') === 'horizontal' ? 'top' : 'left');
    const horizontal = interaction.attr('orientation') === 'horizontal' && orientationSelectionEnabled;

    return _.merge(data || {}, {
        horizontal,
        position,
        iconAdd: iconAddDirection[position],
        iconRemove: iconRemoveDirection[position],
        moveBeforeIcon: horizontal ? 'icon-left' : 'icon-up',
        moveAfterIcon: horizontal ? 'icon-right' : 'icon-down'
    });
};

/**
 * Destroy the interaction by leaving the DOM exactly in the same state it was before loading the interaction.
 * @param {Object} interaction - the interaction
 */
const destroy = function (interaction) {
    const $container = containerHelper.get(interaction);

    //first, remove all events
    const selectors = [
        '.choice-area >li:not(.deactivated)',
        '.result-area >li',
        '.icon-add-to-selection',
        '.icon-remove-from-selection',
        '.icon-move-before',
        '.icon-move-after',
    ];
    if (interaction.data('touchPatch')) {
        interaction.data('touchPatch').destroy();
        interaction.removeData('touchPatch');
    }
    selectors.forEach(function unbindInteractEvents(selector) {
        interact($container.find(selector).selector).unset();
    });

    $(document).off('.commonRenderer');

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
const setState = function setState(interaction, state) {
    if (_.isObject(state)) {
        if (state.response) {
            interaction.resetResponse();
            interaction.setResponse(state.response);
        }

        //restore order of previously shuffled choices
        if (_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())) {
            const $container = containerHelper.get(interaction);

            $('.choice-area .qti-choice', $container)
                .sort(function (a, b) {
                    const aIndex = _.indexOf(state.order, $(a).data('identifier'));
                    const bIndex = _.indexOf(state.order, $(b).data('identifier'));
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
const getState = function getState(interaction) {
    const state = {};
    const response = interaction.getResponse();

    if (response) {
        state.response = response;
    }

    //we store also the choice order if shuffled
    if (interaction.attr('shuffle') === true) {
        const $container = containerHelper.get(interaction);

        state.order = [];
        $('.choice-area .qti-choice', $container).each(function () {
            state.order.push($(this).data('identifier'));
        });
    }
    return state;
};

/**
 * Expose the common renderer for the order interaction
 * @exports qtiCommonRenderer/renderers/interactions/OrderInteraction
 */
export default {
    qtiClass: 'orderInteraction',
    getData: getCustomData,
    template: tpl,
    render,
    getContainer: containerHelper.get,
    setResponse,
    getResponse,
    resetResponse,
    destroy,
    setState,
    getState
};
