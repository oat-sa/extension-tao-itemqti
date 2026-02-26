/**
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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

define(['jquery', 'lodash'], function ($, _) {
    'use strict';

    const CONTROL_CLASS = 'swap-btn';
    const CONTROL_NS = '.qti-arrow-reverse';

    function getSelectedChoiceIds(interaction) {
        const choiceIds = [];
        if (!interaction || !interaction.paper || !_.isFunction(interaction.paper.forEach)) {
            return choiceIds;
        }

        interaction.paper.forEach(function (element) {
            if (
                element &&
                element.node &&
                _.isFunction(element.data) &&
                element.node.hasAttribute('data-for-selected-line')
            ) {
                const choiceId = element.data('choiceId');
                if (choiceId) {
                    choiceIds.push(choiceId);
                }
            }
        });

        return _.uniq(choiceIds);
    }

    function parsePathPoints(pathNode) {
        if (!pathNode || !_.isFunction(pathNode.getAttribute)) {
            return null;
        }
        const d = pathNode.getAttribute('d') || '';
        const match = d.match(/M\s*([\-0-9.]+),([\-0-9.]+)\s*L\s*([\-0-9.]+),([\-0-9.]+)/i);
        if (!match) {
            return null;
        }
        return {
            start: { x: parseFloat(match[1]), y: parseFloat(match[2]) },
            end: { x: parseFloat(match[3]), y: parseFloat(match[4]) }
        };
    }

    function distanceSq(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    }

    function getSelectedDirectedPair(interaction, $container) {
        const selectedLine = $container.find('.assoc-line.selected').get(0);
        const selectedLinePath = selectedLine ? selectedLine.querySelector('.assoc-line-hitbox') : null;
        const points = parsePathPoints(selectedLinePath);
        const selectedChoiceIds = getSelectedChoiceIds(interaction);

        if (!points || selectedChoiceIds.length !== 2 || !interaction.paper || !_.isFunction(interaction.getChoices)) {
            return selectedChoiceIds;
        }

        const choicesById = _.reduce(
            interaction.getChoices(),
            function (result, choice) {
                result[choice.id()] = choice;
                return result;
            },
            {}
        );

        const choiceA = choicesById[selectedChoiceIds[0]];
        const choiceB = choicesById[selectedChoiceIds[1]];
        const elementA = choiceA ? interaction.paper.getById(choiceA.serial) : null;
        const elementB = choiceB ? interaction.paper.getById(choiceB.serial) : null;
        if (!elementA || !elementB || !_.isFunction(elementA.getBBox) || !_.isFunction(elementB.getBBox)) {
            return selectedChoiceIds;
        }

        const bboxA = elementA.getBBox();
        const bboxB = elementB.getBBox();
        const centerA = { x: bboxA.x + bboxA.width / 2, y: bboxA.y + bboxA.height / 2 };
        const centerB = { x: bboxB.x + bboxB.width / 2, y: bboxB.y + bboxB.height / 2 };

        const startToA = distanceSq(points.start, centerA);
        const startToB = distanceSq(points.start, centerB);

        if (startToA <= startToB) {
            return [selectedChoiceIds[0], selectedChoiceIds[1]];
        }
        return [selectedChoiceIds[1], selectedChoiceIds[0]];
    }

    function getSelectedLineMidpoint($container) {
        const selectedLine = $container.find('.assoc-line.selected').get(0);
        if (!selectedLine) {
            return null;
        }

        const closeBtn = selectedLine.nextElementSibling;
        if (!closeBtn || !closeBtn.classList.contains('close-btn') || !_.isFunction(closeBtn.getBBox)) {
            const hitPath = selectedLine.querySelector('.assoc-line-hitbox');
            if (!hitPath || !_.isFunction(hitPath.getTotalLength) || !_.isFunction(hitPath.getPointAtLength)) {
                return null;
            }
            const totalLength = hitPath.getTotalLength();
            if (!_.isFinite(totalLength)) {
                return null;
            }
            return hitPath.getPointAtLength(totalLength / 2);
        }

        const bbox = closeBtn.getBBox();
        if (!bbox || !_.isFinite(bbox.x) || !_.isFinite(bbox.y)) {
            return null;
        }

        return {
            x: bbox.x + bbox.width / 2 + 34,
            y: bbox.y + bbox.height / 2
        };
    }

    function attach($container, interaction, options) {
        const opts = options || {};
        const onReverse = _.isFunction(opts.onReverse) ? opts.onReverse : _.noop;
        const paper = interaction.paper;
        let selectedLeftId = null;
        let selectedRightId = null;
        let controlGroup;
        let controlHitbox;
        let controlBg;
        let controlPath;
        let observer;

        if (!paper || !_.isFunction(paper.group) || !_.isFunction(paper.circle) || !_.isFunction(paper.text)) {
            return _.noop;
        }

        controlGroup = paper.group({ class: CONTROL_CLASS }).attr('title', 'Reverse direction');
        controlHitbox = paper.circle(0, 0, 20).attr({
            class: 'swap-btn-hitbox',
            fill: '#266d9c',
            opacity: 0,
            stroke: 'none',
            'stroke-width': 0
        });
        controlBg = paper.circle(0, 0, 14).attr({
            class: 'swap-btn-bg',
            fill: '#266d9c',
            stroke: '#fff',
            'stroke-width': 2
        });
        controlPath = paper
            .path('M0,0L0,0')
            .attr({
                class: 'swap-btn-path',
                fill: 'none',
                stroke: '#fff',
                'stroke-width': 1.25,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            });
        controlGroup.appendChild(controlHitbox);
        controlGroup.appendChild(controlBg);
        controlGroup.appendChild(controlPath);
        controlGroup.node.style.visibility = 'hidden';

        const updateControl = _.debounce(function () {
            const choiceIds = getSelectedDirectedPair(interaction, $container);
            const midpoint = getSelectedLineMidpoint($container);

            if (!midpoint) {
                selectedLeftId = null;
                selectedRightId = null;
                controlGroup.node.style.visibility = 'hidden';
                return;
            }

            selectedLeftId = choiceIds[0] || null;
            selectedRightId = choiceIds[1] || null;
            controlHitbox.attr({
                cx: midpoint.x,
                cy: midpoint.y
            });
            controlBg.attr({
                cx: midpoint.x,
                cy: midpoint.y
            });
            controlPath.attr(
                'path',
                'M' +
                    (midpoint.x - 6) +
                    ',' +
                    midpoint.y +
                    'L' +
                    (midpoint.x + 4) +
                    ',' +
                    midpoint.y +
                    'M' +
                    (midpoint.x + 1) +
                    ',' +
                    (midpoint.y - 3) +
                    'L' +
                    (midpoint.x + 4) +
                    ',' +
                    midpoint.y +
                    'L' +
                    (midpoint.x + 1) +
                    ',' +
                    (midpoint.y + 3) +
                    'M' +
                    (midpoint.x + 6) +
                    ',' +
                    midpoint.y +
                    'L' +
                    (midpoint.x - 4) +
                    ',' +
                    midpoint.y +
                    'M' +
                    (midpoint.x - 1) +
                    ',' +
                    (midpoint.y - 3) +
                    'L' +
                    (midpoint.x - 4) +
                    ',' +
                    midpoint.y +
                    'L' +
                    (midpoint.x - 1) +
                    ',' +
                    (midpoint.y + 3)
            );
            controlGroup.node.style.visibility = 'visible';

            const selectedLine = $container.find('.assoc-line.selected').get(0);
            if (selectedLine && selectedLine.parentElement) {
                if (selectedLine.nextElementSibling) {
                    selectedLine.nextElementSibling.after(controlGroup.node);
                } else {
                    selectedLine.parentElement.insertBefore(controlGroup.node, null);
                }
            }
        }, 20);

        const scheduleUpdate = function () {
            _.defer(updateControl);
        };

        $container.on(
            'click' + CONTROL_NS,
            '.assoc-line, .assoc-line-hitbox, .assoc-line-inner, .assoc-line-outer, .assoc-line-shadow, .close-btn, .glass-layer, .hotspot2, image',
            scheduleUpdate
        );
        $container.on('responseChange' + CONTROL_NS, scheduleUpdate);
        $container.on('resetresponse' + CONTROL_NS, function () {
            selectedLeftId = null;
            selectedRightId = null;
            controlGroup.node.style.visibility = 'hidden';
        });

        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(scheduleUpdate);
            observer.observe($container.get(0), {
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-for-selected-line']
            });
        }

        controlGroup.click(function (event) {
            if (event && _.isFunction(event.stopPropagation)) {
                event.stopPropagation();
            }

            if (selectedLeftId && selectedRightId) {
                onReverse(selectedLeftId, selectedRightId);
            }
            scheduleUpdate();
        });

        scheduleUpdate();

        return function detach() {
            $container.off(CONTROL_NS);
            if (observer) {
                observer.disconnect();
            }
            if (controlGroup) {
                controlGroup.remove();
            }
        };
    }

    return {
        attach: attach
    };
});
