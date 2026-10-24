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
 * Copyright (c) 2014-2023 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import __ from 'i18n';
import module from 'module';
import 'core/mouseEvent';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/graphicGapMatchInteraction';
import placedFillerTpl from 'taoQtiItem/qtiCommonRenderer/tpl/choices/placedGapImg.graphicGapMatch';
import graphic from 'taoQtiItem/qtiCommonRenderer/helpers/Graphic';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instructionMgr from 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager';
import interact from 'interact';
import interactUtils from 'ui/interactUtils';

let isDragAndDropEnabled;

// this represents the state for the active droppable zone
// we need it only to access the active dropzone in the iFrameFix
// should be removed when the old test runner is discarded
let activeDrop = null;

/**
 * Global variable to count number of gapfiller (image) usages:
 * @type {object}
 */
const _gapFillerUsages = {};

const PLACED_GAP_TEXT_MIN_WIDTH = 75;
const PLACED_GAP_TEXT_MAX_WIDTH = 150;
const PLACED_GAP_TEXT_MIN_HEIGHT = 60;

/**
 * Match the source-bay gap text tile size (authoring + delivery).
 *
 * Source tiles are sized in CSS pixels; placed fillers use paper coords with
 * `scale * paperSize` for on-screen pixels. Divide by scale so the placed tile
 * matches the source bay visually.
 *
 * @param {JQuery} $sourceTile - gap text choice in the source bay
 * @param {number} scale - interaction.paper.scale
 * @returns {{width: number, height: number}}
 */
const _getPlacedGapTextTileSize = function _getPlacedGapTextTileSize($sourceTile, scale) {
    const safeScale = scale > 0 ? scale : 1;
    const sourceWidthPx = Math.ceil($sourceTile.outerWidth()) || PLACED_GAP_TEXT_MIN_WIDTH;
    const sourceHeightPx = Math.ceil($sourceTile.outerHeight()) || PLACED_GAP_TEXT_MIN_HEIGHT;
    const clampedWidthPx = Math.max(
        PLACED_GAP_TEXT_MIN_WIDTH,
        Math.min(PLACED_GAP_TEXT_MAX_WIDTH, sourceWidthPx)
    );
    const clampedHeightPx = Math.max(PLACED_GAP_TEXT_MIN_HEIGHT, sourceHeightPx);

    return {
        width: clampedWidthPx / safeScale,
        height: clampedHeightPx / safeScale
    };
};

/**
 * @param {JQuery} $sourceTile
 * @returns {string}
 */
const _getGapTextLabelFromSourceTile = function _getGapTextLabelFromSourceTile($sourceTile) {
    const $textarea = $sourceTile.find('.gap-text-label');

    if ($textarea.length) {
        return ($textarea.val() || '').trim();
    }

    return $sourceTile.text().trim();
};

/**
 * Center the placed text tile on the visible hotspot (paper bbox alone is wrong when
 * the SVG is centered in .main-image-box or shapes use clip-path / stroke).
 *
 * @param {Raphael.Element} element
 * @param {JQuery} $container
 * @param {number} width - tile width in paper coords
 * @param {number} height - tile height in paper coords
 * @param {number} currentCount
 * @param {number} scale - interaction.paper.scale
 * @returns {{left: number, top: number}}
 */
const _getPlacedGapTextTilePosition = function _getPlacedGapTextTilePosition(
    element,
    $container,
    width,
    height,
    currentCount,
    scale
) {
    const $placedHost = $('.placed-fillers', $container);
    const stackOffsetPx = 8 * (currentCount - 1) * scale;
    const tileWidthPx = width * scale;
    const tileHeightPx = height * scale;

    if (element && element.node && $placedHost.length) {
        const hostRect = $placedHost[0].getBoundingClientRect();
        const shapeRect = element.node.getBoundingClientRect();

        if (shapeRect.width > 0 && shapeRect.height > 0) {
            const centerXpx = shapeRect.left + shapeRect.width / 2 - hostRect.left + stackOffsetPx;
            const centerYpx = shapeRect.top + shapeRect.height / 2 - hostRect.top + stackOffsetPx;

            return {
                left: (centerXpx - tileWidthPx / 2) / scale,
                top: (centerYpx - tileHeightPx / 2) / scale
            };
        }
    }

    const bbox = element.getBBox();
    const stackOffset = 8 * (currentCount - 1);
    const centerX = bbox.x + bbox.width / 2 + stackOffset;
    const centerY = bbox.y + bbox.height / 2 + stackOffset;

    return {
        left: centerX - width / 2,
        top: centerY - height / 2
    };
};

const _applyPlacedGapTextTilePosition = function _applyPlacedGapTextTilePosition(
    $placedFiller,
    element,
    $container,
    width,
    height,
    currentCount,
    scale
) {
    const tilePosition = _getPlacedGapTextTilePosition(element, $container, width, height, currentCount, scale);

    const css = {
        top: `${scale * tilePosition.top}px`,
        left: `${scale * tilePosition.left}px`,
        width: `${scale * width}px`,
        height: `${scale * height}px`
    };

    if (!$placedFiller.hasClass('qti-gapText')) {
        css.lineHeight = 'normal';
        css.display = 'flex';
        css.alignItems = 'center';
        css.justifyContent = 'center';
    }

    $placedFiller
        .attr({
            'data-top': tilePosition.top,
            'data-left': tilePosition.left,
            'data-width': width,
            'data-height': height
        })
        .css(css);

    if (!$placedFiller.hasClass('qti-gapText')) {
        $placedFiller.find('img').css({
            width: `${scale * width}px`,
            height: `${scale * height}px`,
            display: 'block',
            margin: 0
        });
    }
};

const dragOptions = {
    inertia: false,
    autoScroll: true,
    restrict: {
        restriction: '.qti-interaction',
        endOnly: false,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    }
};

const _applySourceListLayout = function _applySourceListLayout($gapList) {
    const listCss = {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        marginLeft: 0,
        marginRight: 0,
        textAlign: 'left',
        justifyContent: 'flex-start'
    };

    $gapList.css(listCss);
    $gapList.children('li').css({
        flex: '0 0 auto'
    });
};

/**
 * This options enables to support old items created with the wrong
 * direction in the directedpairs.
 *
 * @deprecated
 */
const isDirectedPairFlipped = module.config().flipDirectedPair;

/**
 * Check if a shape can accept matches
 * @private
 * @param {Raphael.Element} element - the shape
 * @returns {Boolean} true if the element is matchable
 */
const _isMatchable = function (element) {
    let matchable = false;
    if (element) {
        const matchMax = element.data('max') || 0;
        const matching = element.data('matching') || [];
        matchable = matchMax === 0 || matchMax > matching.length;
    }
    return matchable;
};

/**
 * Makes the shapes selectable (at least those who can still accept matches)
 * @private
 * @param {Object} interaction
 */
const _shapesSelectable = function _shapesSelectable(interaction) {
    const $container = containerHelper.get(interaction);
    const tooltip = __('Select the area to add an image');

    _.forEach(interaction.getChoices(), function (choice) {
        const element = interaction.paper.getById(choice.serial);
        if (_isMatchable(element)) {
            element.selectable = true;
            graphic.updateElementState(element, 'selectable');
            graphic.updateTitle(element, tooltip);
        } else {
            graphic.updateTitle(element, '');
        }
    });

    const $placedFillersContainer = $('.placed-fillers', $container);
    $placedFillersContainer.addClass('selectable');

    _.forEach(interaction.placedFillers, function ($placedFiller) {
        const element = interaction.paper.getById($placedFiller.attr('data-shape-id'));
        $placedFiller.attr('title', _isMatchable(element) ? tooltip : '');
    });
};

/**
 * Makes all the shapes UNselectable
 * @private
 * @param {Object} interaction
 */
const _shapesUnSelectable = function _shapesUnSelectable(interaction) {
    const $container = containerHelper.get(interaction);

    _.forEach(interaction.getChoices(), function (choice) {
        const element = interaction.paper.getById(choice.serial);
        if (element) {
            element.selectable = false;
            graphic.updateElementState(element, 'basic');
            graphic.updateTitle(element, __('Select an image first'));
        }
    });

    const $placedFillersContainer = $('.placed-fillers', $container);
    $placedFillersContainer.removeClass('selectable');

    _.forEach(interaction.placedFillers, function ($placedFiller) {
        $placedFiller.attr('title', __('Remove'));
    });
};

/**
 * By clicking the paper image the shapes are restored to their default state
 * @private
 * @param {Object} interaction
 */
const _paperUnSelect = function _paperUnSelect(interaction) {
    const $container = containerHelper.get(interaction);
    const $gapList = $('ul.source', $container);
    const $gapFillers = $gapList.find('li', $container);
    const bgImage = interaction.paper.getById('bg-image-' + interaction.serial);
    if (bgImage) {
        interact(bgImage.node).on('tap', function () {
            _shapesUnSelectable(interaction);
            $gapFillers.removeClass('active');
        });
    }
};

/**
 * Sets a gapfiller (= image) and marks as disabled if at max
 * @private
 * @param {Object} interaction
 * @param {JQuery Element} $gapFiller
 */
const _setGapFiller = function _setGapFiller(interaction, $gapFiller) {
    const gapFillerSerial = $gapFiller.data('serial');
    const gapFiller =
        interaction.getGapImg(gapFillerSerial) ||
        (typeof interaction.getGapText === 'function' ? interaction.getGapText(gapFillerSerial) : null);
    let matchMax;
    let usages;

    if (!_gapFillerUsages[gapFillerSerial]) {
        _gapFillerUsages[gapFillerSerial] = 0;
    }

    _gapFillerUsages[gapFillerSerial]++;

    // disable gapfiller if maxium usage reached
    if (!interaction.responseMappingMode && gapFiller && gapFiller.attr('matchMax')) {
        matchMax = +gapFiller.attr('matchMax');
        usages = +_gapFillerUsages[gapFillerSerial];

        // note: if matchMax is 0, then test taker is allowed unlimited usage of that gapfiller
        if (matchMax !== 0 && matchMax <= usages) {
            $gapFiller.addClass('disabled');
            $gapFiller.removeClass('selectable');
            $gapFiller.find('img').attr('draggable', 'false'); //prevent native drag of image (Chrome, mouse)
        }
    }
};

/**
 *
 * @param {Object} interaction
 * @param {JQuery} $fromGapFiller
 * @param {Raphael.Element|JQuery} toElement
 * @param {Function?} endCallback
 */
const _animateMoveGapFiller = function _animateMoveGapFiller(interaction, $fromGapFiller, toElement, endCallback) {
    const $container = containerHelper.get(interaction);
    const $imageBox = $('.main-image-box', $container);
    const $fromElement = $fromGapFiller.find('img').length ? $fromGapFiller.find('img') : $fromGapFiller;
    const $toElement = toElement.paper ? $(toElement.node) : toElement;

    // animateMoveElement() requires measurable elements: offset() is undefined
    // for empty/detached jQuery sets, which crashes on tiles without an <img>.
    if (!$fromElement.length || !$fromElement.offset() || !$toElement.length || !$toElement.offset()) {
        if (endCallback) {
            endCallback();
        }
        return;
    }

    const $clone = interactUtils.animateMoveElement({
        $appendTo: $imageBox,
        $fromElement,
        $toElement,
        endCallback
    });
    $clone.css({ opacity: 0.8 });
};

/**
 * Remove a placed gapfiller (= image),
 *  unmark it as disabled in the source area,
 *  update response
 * @private
 * @param {Object} interaction
 * @param {JQuery Element} $placedFiller
 * @param {boolean} animate
 */
const _removePlacedGapFiller = function _removePlacedGapFiller(interaction, $placedFiller, animate = true) {
    const $container = containerHelper.get(interaction);

    const placedFillerId = $placedFiller.attr('data-identifier');
    const $sourceFiller = $('ul.source', $container).find(`li[data-identifier="${placedFillerId}"]`);
    const gapFillerSerial = $sourceFiller.data('serial');
    const element = interaction.paper.getById($placedFiller.attr('data-shape-id'));

    if (animate) {
        _animateMoveGapFiller(interaction, $placedFiller, $sourceFiller);
    }

    element.data('matching', _.without(element.data('matching') || [], placedFillerId));
    interaction.placedFillers = _.without(interaction.placedFillers, $placedFiller);
    _gapFillerUsages[gapFillerSerial]--;

    $placedFiller.remove();

    $sourceFiller.removeClass('disabled');
    $sourceFiller.addClass('selectable');
    $sourceFiller.find('img').removeAttr('draggable');

    containerHelper.triggerResponseChangeEvent(interaction);
};

const _iFrameDragFix = function _iFrameDragFix(draggableSelectorOrElement, target) {
    interactUtils.iFrameDragFixOn(function () {
        if (activeDrop) {
            interact(activeDrop).fire({
                type: 'drop',
                target: activeDrop,
                relatedTarget: target
            });
        }
        interact(draggableSelectorOrElement).fire({
            type: 'dragend',
            target: target
        });
    });
};

/**
 * Select a shape (= hotspot) (a gap image must be active)
 * @private
 * @param {Object} interaction
 * @param {Raphael.Element} element - the selected shape
 * @param {JQuery} [gapFillerId = void 0] - gap filler id to add, or find '.active' one
 * @param {Boolean} [trackResponse = true] - if the selection trigger a response chane
 */
const _selectShape = function _selectShape(interaction, element, gapFillerId, trackResponse) {
    let $img, id, bbox, matching, currentCount;

    //lookup for the active element
    const $container = containerHelper.get(interaction);
    const $gapList = $('ul.source', $container);
    const $placedFillersContainer = $('.placed-fillers', $container);

    if (typeof trackResponse === 'undefined') {
        trackResponse = true;
    }
    const $active = gapFillerId ? $gapList.find(`[data-identifier="${gapFillerId}"]`) : $gapList.find('.active:first');

    if ($active.length) {
        //the matching elements are linked to the shape
        id = $active.attr('data-identifier');
        matching = element.data('matching') || [];
        matching.push(id);
        element.data('matching', matching);
        currentCount = matching.length;

        //the image to clone
        $img = $active.find('img');

        //then reset the state of the shapes and the gap images
        _shapesUnSelectable(interaction);
        $gapList.children().removeClass('active');

        _setGapFiller(interaction, $active);

        const _createPlacedFiller = () => {
            bbox = element.getBBox();
            const scale = interaction.paper.scale;
            let originalLeft = bbox.x + 8 * (currentCount - 1);
            let originalTop = bbox.y + 8 * (currentCount - 1);
            const isTextFiller = !$img.length;
            let originalWidth;
            let originalHeight;
            let fullGapTextLabel;
            let tilePosition;

            if (isTextFiller) {
                const tileSize = _getPlacedGapTextTileSize($active, scale);
                originalWidth = tileSize.width;
                originalHeight = tileSize.height;
                fullGapTextLabel = _getGapTextLabelFromSourceTile($active);
            } else {
                originalWidth = parseInt($img.attr('width'), 10) || 0;
                originalHeight = parseInt($img.attr('height'), 10) || 0;
            }

            tilePosition = _getPlacedGapTextTilePosition(
                element,
                $container,
                originalWidth,
                originalHeight,
                currentCount,
                scale
            );
            originalLeft = tilePosition.left;
            originalTop = tilePosition.top;

            const $placedFiller = isTextFiller
                ? $('<div/>')
                      .addClass('qti-gapImg qti-gapText placed')
                      .attr({
                          'data-identifier': id,
                          'data-shape-id': element.id,
                          'data-top': originalTop,
                          'data-left': originalLeft,
                          'data-width': originalWidth,
                          'data-height': originalHeight,
                          'data-full-label': fullGapTextLabel
                      })
                      .css({
                          top: `${scale * originalTop}px`,
                          left: `${scale * originalLeft}px`,
                          width: `${scale * originalWidth}px`,
                          height: `${scale * originalHeight}px`
                      })
                      .append(
                          $('<span class="placed-gap-text-label"/>')
                              .text(fullGapTextLabel)
                              .attr('title', fullGapTextLabel),
                          $('<span class="placed-gap-text-tooltip" role="tooltip"/>').text(fullGapTextLabel)
                      )
                : $(
                      placedFillerTpl({
                          shapeId: element.id,
                          id,
                          src: $img.attr('src'),
                          originalLeft,
                          originalTop,
                          originalWidth,
                          originalHeight,
                          left: scale * originalLeft,
                          top: scale * originalTop,
                          width: scale * originalWidth,
                          height: scale * originalHeight
                      })
                  );
            $placedFillersContainer.append($placedFiller);
            interaction.placedFillers.push($placedFiller);

            _applyPlacedGapTextTilePosition(
                $placedFiller,
                element,
                $container,
                originalWidth,
                originalHeight,
                currentCount,
                scale
            );
            window.requestAnimationFrame(function () {
                _applyPlacedGapTextTilePosition(
                    $placedFiller,
                    element,
                    $container,
                    originalWidth,
                    originalHeight,
                    currentCount,
                    scale
                );
            });

            containerHelper.triggerResponseChangeEvent(interaction);

            interact($placedFiller.get(0)).on('tap', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (!$placedFiller.hasClass('dragged')) {
                    if ($gapList.find('.active').length > 0) {
                        // adding a new gapfiller on the hotspot by simulating a click on the underlying shape...
                        interactUtils.tapOn(element.node);
                    } else {
                        // ... or removing the existing gapfiller
                        _removePlacedGapFiller(interaction, $placedFiller, true);
                    }
                }
            });
            if (isDragAndDropEnabled) {
                const touchPatch = interaction.data('touchPatch');
                let dragScaleX;
                let dragScaleY;

                interact($placedFiller.get(0))
                    .draggable(
                        _.assign({}, dragOptions, {
                            onstart: function (e) {
                                const $target = $(e.target);
                                $target.addClass('dragged');
                                $gapList.addClass('selectable');
                                _setActiveGapState(interaction, $target);

                                _iFrameDragFix($placedFiller.get(0), e.target);
                                const dragScale = interactUtils.calculateScale(e.target);
                                dragScaleX = dragScale[0];
                                dragScaleY = dragScale[1];

                                touchPatch.onstart();
                            },
                            onmove: function (e) {
                                interactUtils.moveElement(e.target, e.dx / dragScaleX, e.dy / dragScaleY);
                            },
                            onend: function (e) {
                                _.defer(() => {
                                    const $target = $(e.target);
                                    $target.removeClass('dragged');
                                    $gapList.removeClass('selectable');
                                    _setInactiveGapState(interaction, $target);
                                    interactUtils.restoreOriginalPosition($target);
                                    interactUtils.iFrameDragFixOff();

                                    touchPatch.onend();
                                });
                            }
                        })
                    )
                    .styleCursor(false)
                    .actionChecker(touchPatch.actionChecker);
            }

            setTimeout(() => {
                if ($placedFiller.get(0).matches(':hover')) {
                    $placedFiller.addClass('no-hover').on('mouseleave.graphic-gap-match-placed', function () {
                        $placedFiller
                            .off('mouseleave.graphic-gap-match-placed')
                            .removeClass('no-hover')
                            .attr('title', __('Remove'));
                    });
                }
            }, 0);
        };

        // animate unless moving placed filler to another shape, or unless restoring initial response
        if (gapFillerId || !trackResponse) {
            _createPlacedFiller();
        } else {
            _animateMoveGapFiller(interaction, $active, element, _createPlacedFiller);
        }
    }
};

function _resolveSourceGapFillerTarget($target) {
    const $gapFiller = $target.closest('li.qti-gapImg, li.qti-gapText');

    return $gapFiller.length ? $gapFiller : $target;
}

function _setActiveGapState(interaction, $target) {
    const $container = containerHelper.get(interaction);
    const $gapList = $('ul.source', $container);

    $target = _resolveSourceGapFillerTarget($target);

    $gapList.children('li').removeClass('active');
    if (!$target.hasClass('placed')) {
        $target.addClass('active');
    }
    _shapesSelectable(interaction);

    $(document.body).off('click.graphic-gap-match');
    $(document.body).on('click.graphic-gap-match', function (e) {
        if (
            !$container.get(0).contains(e.target) ||
            (!e.target.closest('.qti-gapImg') &&
                !e.target.closest('.qti-gapText') &&
                !e.target.closest('.main-image-box'))
        ) {
            _setInactiveGapState(interaction, $target);
        }
    });
}

function _setInactiveGapState(interaction, $target) {
    $target.removeClass('active');
    _shapesUnSelectable(interaction);
    $(document.body).off('click.graphic-gap-match');
}

/**
 * Render a choice (= hotspot) inside the paper.
 * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
 *
 * @private
 * @param {Object} interaction
 * @param {Object} choice - the hotspot choice to add to the interaction
 */
const _renderChoice = function _renderChoice(interaction, choice) {
    const $container = containerHelper.get(interaction);

    //create the shape
    const rElement = graphic
        .createElement(interaction.paper, choice.attr('shape'), choice.attr('coords'), {
            id: choice.serial,
            title: __('Select an image first'),
            hover: false,
            touchEffect: false,
            useCssClass: true,
            useClipPath: true
        })
        .data('max', choice.attr('matchMax'))
        .data('matching', []);

    interact(rElement.node).on('tap', function onClickShape() {
        handleShapeSelect();
    });

    if (isDragAndDropEnabled) {
        interact(rElement.node).dropzone({
            overlap: 0.15,
            ondragenter: function () {
                if (_canDrop()) {
                    graphic.updateElementState(rElement, 'hover');
                    activeDrop = rElement.node;
                }
            },
            ondrop: function () {
                if (_canDrop()) {
                    let gapFillerId;
                    const $placedFiller = $('.placed-fillers', $container).find('.dragged');
                    if ($placedFiller.length) {
                        gapFillerId = $placedFiller.attr('data-identifier');
                        _removePlacedGapFiller(interaction, $placedFiller, false);
                    }

                    graphic.updateElementState(rElement, 'selectable');
                    handleShapeSelect(gapFillerId);
                    activeDrop = null;
                }
            },
            ondragleave: function () {
                if (_canDrop()) {
                    graphic.updateElementState(rElement, 'selectable');
                    activeDrop = null;
                }
            }
        });
    }

    function handleShapeSelect(gapFillerId) {
        // check if can make the shape selectable on click
        if (_isMatchable(rElement) && rElement.selectable === true) {
            _selectShape(interaction, rElement, gapFillerId);
        }
    }

    function _canDrop() {
        return _isMatchable(rElement);
    }
};

/**
 * Render the list of gap fillers
 * @private
 * @param {Object} interaction
 * @param {jQueryElement} $gapList - the list than contains the orderers
 */
const _renderGapFillersList = function _renderGapFillersList(interaction, $gapList) {
    const $container = containerHelper.get(interaction);
    const gapFillersSelector = $gapList.selector + ' li';
    let scaleX, scaleY;

    interact(gapFillersSelector).on('tap', function onClickGapImg(e) {
        e.stopPropagation();
        e.preventDefault();
        toggleActiveGapState($(e.currentTarget));
    });

    if (isDragAndDropEnabled) {
        const _canDrop = e => e.target.classList.contains('selectable');

        interact($gapList.selector).dropzone({
            overlap: 0.15,
            ondragenter: function (e) {
                if (_canDrop(e)) {
                    $(e.target).addClass('hover');
                }
            },
            ondrop: function (e) {
                if (_canDrop(e)) {
                    $(e.target).removeClass('hover');
                    const $placedFiller = $('.placed-fillers', $container).find('.dragged');
                    _removePlacedGapFiller(interaction, $placedFiller, true);
                }
            },
            ondragleave: function (e) {
                if (_canDrop(e)) {
                    $(e.target).removeClass('hover');
                }
            }
        });

        const touchPatch = interactUtils.touchPatchFactory();
        interaction.data('touchPatch', touchPatch);

        interact(gapFillersSelector + '.selectable')
            .draggable(
                _.assign({}, dragOptions, {
                    onstart: function (e) {
                        const $target = _resolveSourceGapFillerTarget($(e.target));
                        _setActiveGapState(interaction, $target);
                        $target.addClass('dragged');

                        _iFrameDragFix(gapFillersSelector, e.target);
                        const scale = interactUtils.calculateScale(e.target);
                        scaleX = scale[0];
                        scaleY = scale[1];

                        touchPatch.onstart();
                    },
                    onmove: function (e) {
                        interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                    },
                    onend: function (e) {
                        _.defer(() => {
                            const $target = $(e.target);
                            _setInactiveGapState(interaction, $target);
                            $target.removeClass('dragged');
                            interactUtils.restoreOriginalPosition($target);
                            interactUtils.iFrameDragFixOff();

                            touchPatch.onend();
                        });
                    }
                })
            )
            .styleCursor(false)
            .actionChecker(touchPatch.actionChecker);
    }

    function toggleActiveGapState($target) {
        $target = _resolveSourceGapFillerTarget($target);

        if (!$target.hasClass('disabled')) {
            if ($target.hasClass('active')) {
                _setInactiveGapState(interaction, $target);
            } else {
                _setActiveGapState(interaction, $target);
            }
        }
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
const render = function render(interaction) {
    const self = this;

    return new Promise(function (resolve) {
        const $container = containerHelper.get(interaction);
        const $gapList = $('ul.source', $container);
        const $placedFillersContainer = $('.placed-fillers', $container);
        const background = interaction.object.attributes;

        interaction.placedFillers = [];

        if (
            self.getOption &&
            self.getOption('enableDragAndDrop') &&
            self.getOption('enableDragAndDrop').graphicGapMatch
        ) {
            isDragAndDropEnabled = self.getOption('enableDragAndDrop').graphicGapMatch;
        }

        const sourcePosition = interaction.attr('data-position') || '';
        const usesSideSourceList =
            sourcePosition === 'left' ||
            sourcePosition === 'right' ||
            $container.hasClass('qti-choices-left') ||
            $container.hasClass('qti-choices-right');
        const usesHorizontalSourceList = !usesSideSourceList;

        if (usesHorizontalSourceList) {
            $container.find('.image-editor').css({
                float: 'none',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            });
            _applySourceListLayout($gapList);
        }

        $container.off('resized.qti-widget.resolve').one('resized.qti-widget.resolve', resolve);

        //create the paper
        interaction.paper = graphic.responsivePaper('graphic-paper-' + interaction.serial, interaction.serial, {
            width: background.width,
            height: background.height,
            img: self.resolveUrl(background.data),
            imgId: 'bg-image-' + interaction.serial,
            container: $container,
            resize: function (newWidth, factor, newHeight) {
                if (usesHorizontalSourceList) {
                    _applySourceListLayout($gapList);
                } else {
                    $gapList.css({
                        width: `${newWidth}px`,
                        maxWidth: `${newWidth}px`
                    });
                }
                if (factor !== 1) {
                    $gapList.find('img').each(function () {
                        const $img = $(this);
                        $img.width($img.attr('width') * factor);
                        $img.height($img.attr('height') * factor);
                    });
                }

                $placedFillersContainer.css({ width: `${newWidth}px`, height: `${newHeight}px` });
                $placedFillersContainer.find('.placed').each(function () {
                    const $div = $(this);
                    const $img = $div.find('img');
                    $div.css({
                        top: `${$div.attr('data-top') * factor}px`,
                        left: `${$div.attr('data-left') * factor}px`
                    });
                    if ($img.length) {
                        const imgWidth = ($div.attr('data-width') || $img.attr('width')) * factor;
                        const imgHeight = ($div.attr('data-height') || $img.attr('height')) * factor;

                        $div.css({
                            width: `${imgWidth}px`,
                            height: `${imgHeight}px`,
                            lineHeight: 'normal'
                        });
                        $img.css({
                            width: `${imgWidth}px`,
                            height: `${imgHeight}px`
                        });
                    } else if ($div.hasClass('qti-gapText')) {
                        $div.css({
                            width: `${$div.attr('data-width') * factor}px`,
                            height: `${$div.attr('data-height') * factor}px`
                        });
                    }
                });
            },
            responsive: $container.hasClass('responsive')
        });

        //call render choice for each interaction's choices
        _.forEach(interaction.getChoices(), _.partial(_renderChoice, interaction));

        //create the list of gap images
        _renderGapFillersList(interaction, $gapList);

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
const _getRawResponse = function _getRawResponse(interaction) {
    const pairs = [];
    _.forEach(interaction.getChoices(), function (choice) {
        const element = interaction.paper.getById(choice.serial);
        if (element && _.isArray(element.data('matching'))) {
            _.forEach(element.data('matching'), function (gapImg) {
                //backward support of previous order
                if (isDirectedPairFlipped) {
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
const setResponse = function (interaction, response) {
    const $container = containerHelper.get(interaction);
    let responseValues;
    if (response && interaction.paper) {
        try {
            responseValues = pciResponse.unserialize(response, interaction);
        } catch (e) {
            responseValues = null;
        }

        if (_.isArray(responseValues)) {
            _.forEach(interaction.getChoices(), function (choice) {
                const element = interaction.paper.getById(choice.serial);
                if (element) {
                    _.forEach(responseValues, function (pair) {
                        if (pair.length === 2) {
                            //backward support of previous order
                            const responseChoice = isDirectedPairFlipped ? pair[0] : pair[1];
                            const responseGap = isDirectedPairFlipped ? pair[1] : pair[0];
                            if (responseChoice === choice.id()) {
                                $('[data-identifier="' + responseGap + '"]', $container).addClass('active');
                                _selectShape(interaction, element, void 0, false);
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
const resetResponse = function resetResponse(interaction) {
    _shapesUnSelectable(interaction);

    _.forEach(interaction.placedFillers, function ($placedFiller) {
        interactUtils.tapOn($placedFiller);
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
const getResponse = function (interaction) {
    const raw = _getRawResponse(interaction);
    return pciResponse.serialize(raw, interaction);
};

/**
 * Clean interaction destroy
 * @param {Object} interaction
 */
const destroy = function destroy(interaction) {
    if (interaction.paper) {
        const $container = containerHelper.get(interaction);

        $(document.body).off('click.graphic-gap-match');
        $(window).off('resize.qti-widget.' + interaction.serial);
        $container.off('resize.qti-widget.' + interaction.serial);

        interaction.paper.clear();
        instructionMgr.removeInstructions(interaction);

        $('.main-image-box', $container).empty().removeAttr('style');
        $('.image-editor', $container).removeAttr('style');
        $('ul', $container).empty();

        if (interaction.data('touchPatch')) {
            interaction.data('touchPatch').destroy();
            interaction.removeData('touchPatch');
        }
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
const setState = function setState(interaction, state) {
    if (_.isObject(state)) {
        if (state.response) {
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
const getState = function getState(interaction) {
    const state = {};
    const response = interaction.getResponse();

    if (response) {
        state.response = response;
    }
    return state;
};

/**
 * Expose the common renderer for the hotspot interaction
 * @exports qtiCommonRenderer/renderers/interactions/HotspotInteraction
 */
export default {
    qtiClass: 'graphicGapMatchInteraction',
    template: tpl,
    render: render,
    getContainer: containerHelper.get,
    setResponse: setResponse,
    getResponse: getResponse,
    resetResponse: resetResponse,
    destroy: destroy,
    setState: setState,
    getState: getState,
    isDirectedPairFlipped: isDirectedPairFlipped
};
