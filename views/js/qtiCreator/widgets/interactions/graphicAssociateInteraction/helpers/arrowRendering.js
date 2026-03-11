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

define(['lodash'], function (_) {
    'use strict';

    const SUBTYPE_ATTR = 'data-interaction-subtype';
    const ARROW_SUBTYPE = 'arrow';
    const ARROW_STYLE = 'classic-wide-long';
    const ARROW_COLOR = '#266d9c';
    const START_ATTR = 'data-start';
    const END_ATTR = 'data-end';

    function isArrowMode(interaction) {
        return interaction && _.isFunction(interaction.attr) && interaction.attr(SUBTYPE_ATTR) === ARROW_SUBTYPE;
    }

    function applyToRenderedLines(interaction) {
        if (!isArrowMode(interaction) || !interaction.paper || !_.isFunction(interaction.paper.forEach)) {
            return;
        }

        interaction.paper.forEach(function (element) {
            if (
                element &&
                element.node &&
                element.node.classList &&
                element.node.classList.contains('assoc-line-inner') &&
                _.isFunction(element.attr)
            ) {
                element.attr({
                    'arrow-end': ARROW_STYLE,
                    stroke: ARROW_COLOR
                });
            }
        });
    }

    function isChoiceStartEnabled(choice) {
        return !choice || choice.attr(START_ATTR) !== 'false';
    }

    function isChoiceEndEnabled(choice) {
        return !choice || choice.attr(END_ATTR) !== 'false';
    }

    function filterValidPairs(interaction, pairs) {
        if (!isArrowMode(interaction) || !_.isArray(pairs)) {
            return pairs || [];
        }

        const choicesById = _.reduce(
            interaction.getChoices(),
            function (result, choice) {
                result[choice.id()] = choice;
                return result;
            },
            {}
        );

        return _.filter(pairs, function (pair) {
            if (!_.isArray(pair) || pair.length !== 2) {
                return false;
            }
            const sourceChoice = choicesById[pair[0]];
            const targetChoice = choicesById[pair[1]];
            return isChoiceStartEnabled(sourceChoice) && isChoiceEndEnabled(targetChoice);
        });
    }

    function scheduleApply(interaction, delay) {
        _.delay(function () {
            applyToRenderedLines(interaction);
        }, _.isFinite(delay) ? delay : 250);
    }

    return {
        isArrowMode: isArrowMode,
        applyToRenderedLines: applyToRenderedLines,
        scheduleApply: scheduleApply,
        filterValidPairs: filterValidPairs
    };
});
