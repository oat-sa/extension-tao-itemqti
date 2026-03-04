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

define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowMode',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowRendering'
], function (_, __, arrowModeHelper, arrowRenderingHelper) {
    'use strict';

    const ARROW_HINT_MESSAGE = __('Arrow direction: start hotspot to end hotspot.');
    const INVALID_DIRECTION_MESSAGE = __('Invalid arrow direction. Create associations from a start hotspot to an end hotspot.');
    const START_ATTR = 'data-start';
    const END_ATTR = 'data-end';

    function getInstructionMessage(interaction, baseMessage) {
        let message = baseMessage || '';
        if (arrowModeHelper.isArrowMode(interaction)) {
            if (message) {
                message += ' ' + ARROW_HINT_MESSAGE;
            } else {
                message = ARROW_HINT_MESSAGE;
            }
        }
        return message;
    }

    function showInvalidDirectionWarning(instruction) {
        if (!instruction || !_.isFunction(instruction.update)) {
            return;
        }
        instruction.update({
            level: 'warning',
            message: INVALID_DIRECTION_MESSAGE,
            timeout: 2500,
            stop: function () {
                this.reset();
            }
        });
    }

    function extractResponsePairs(responsePayload, type) {
        if (!responsePayload || !type || !_.isObject(responsePayload[type])) {
            return null;
        }

        if (typeof responsePayload[type].pair !== 'undefined') {
            return responsePayload[type].pair;
        }

        if (typeof responsePayload[type].directedPair !== 'undefined') {
            return responsePayload[type].directedPair;
        }

        return null;
    }

    function sanitizePairs(interaction, rawPairs) {
        const pairs = _.isArray(rawPairs) ? rawPairs : [];
        return arrowRenderingHelper.filterValidPairs(interaction, pairs);
    }

    function normalizePairs(rawPairs) {
        let normalized = _.isArray(rawPairs) ? rawPairs : [];
        if (normalized.length === 2 && !_.isArray(normalized[0]) && !_.isArray(normalized[1])) {
            normalized = [normalized];
        }
        return _.filter(normalized, function (pair) {
            return _.isArray(pair) && pair.length === 2;
        });
    }

    function sanitizePairChange(interaction, rawPairs) {
        const normalized = normalizePairs(rawPairs);
        const sanitized = sanitizePairs(interaction, normalized);

        return {
            pairs: sanitized,
            changed: sanitized.length !== normalized.length
        };
    }

    function getChoicesById(interaction) {
        return _.reduce(
            interaction.getChoices(),
            function (result, choice) {
                result[choice.id()] = choice;
                return result;
            },
            {}
        );
    }

    function setRawDirectionFlag(choice, attrName, value) {
        if (!choice) {
            return;
        }

        if (typeof value === 'undefined') {
            if (_.isFunction(choice.removeAttr)) {
                choice.removeAttr(attrName);
            }
            return;
        }

        if (_.isFunction(choice.attr)) {
            choice.attr(attrName, value);
        }
    }

    function captureDirectionRolesForPair(interaction, pair) {
        let sourceChoice;
        let targetChoice;
        const choicesById = getChoicesById(interaction);

        if (!arrowModeHelper.isArrowMode(interaction) || !_.isArray(pair) || pair.length !== 2) {
            return null;
        }

        sourceChoice = choicesById[pair[0]];
        targetChoice = choicesById[pair[1]];

        if (!sourceChoice || !targetChoice) {
            return null;
        }

        return {
            source: {
                choice: sourceChoice,
                start: sourceChoice.attr(START_ATTR),
                end: sourceChoice.attr(END_ATTR)
            },
            target: {
                choice: targetChoice,
                start: targetChoice.attr(START_ATTR),
                end: targetChoice.attr(END_ATTR)
            }
        };
    }

    function restoreDirectionRoles(snapshot) {
        if (!snapshot) {
            return;
        }

        setRawDirectionFlag(snapshot.source.choice, START_ATTR, snapshot.source.start);
        setRawDirectionFlag(snapshot.source.choice, END_ATTR, snapshot.source.end);
        setRawDirectionFlag(snapshot.target.choice, START_ATTR, snapshot.target.start);
        setRawDirectionFlag(snapshot.target.choice, END_ATTR, snapshot.target.end);
    }

    function reversePair(pairs, leftId, rightId, strictDirection) {
        const nextPairs = _.map(pairs || [], function (pair) {
            return _.isArray(pair) ? pair.slice(0, 2) : pair;
        });
        const isStrictDirection = strictDirection === true;

        const pairIndex = _.findIndex(nextPairs, function (pair) {
            if (!_.isArray(pair) || pair.length !== 2) {
                return false;
            }
            if (isStrictDirection) {
                return pair[0] === leftId && pair[1] === rightId;
            }
            return (pair[0] === leftId && pair[1] === rightId) || (pair[0] === rightId && pair[1] === leftId);
        });

        if (pairIndex === -1) {
            return {
                changed: false,
                pairs: nextPairs
            };
        }

        const previousPair = nextPairs[pairIndex].slice(0, 2);
        const reversedPair = [previousPair[1], previousPair[0]];
        nextPairs[pairIndex] = reversedPair;

        return {
            changed: true,
            pairs: nextPairs,
            previousPair: previousPair,
            reversedPair: reversedPair
        };
    }

    function updateDirectionRolesForPair(interaction, pair) {
        if (!arrowModeHelper.isArrowMode(interaction) || !_.isArray(pair) || pair.length !== 2) {
            return false;
        }

        const choicesById = getChoicesById(interaction);

        const sourceChoice = choicesById[pair[0]];
        const targetChoice = choicesById[pair[1]];

        if (!sourceChoice || !targetChoice) {
            return false;
        }

        // Keep response direction and hotspot role settings coherent after line reversal.
        arrowModeHelper.setChoiceDirection(sourceChoice, true, false);
        arrowModeHelper.setChoiceDirection(targetChoice, false, true);

        return true;
    }

    function reverseSelectedPair(interaction, currentPairs, leftId, rightId, instruction) {
        const normalizedPairs = normalizePairs(currentPairs);
        const reversed = reversePair(normalizedPairs, leftId, rightId, true);
        let previousRoles;
        let rolesUpdated;
        let sanitizedResult;

        if (!reversed.changed) {
            return {
                changed: false,
                pairs: normalizedPairs
            };
        }

        sanitizedResult = sanitizePairChange(interaction, reversed.pairs);
        if (sanitizedResult.changed) {
            previousRoles = captureDirectionRolesForPair(interaction, reversed.reversedPair);
            rolesUpdated = updateDirectionRolesForPair(interaction, reversed.reversedPair);
            if (rolesUpdated) {
                sanitizedResult = sanitizePairChange(interaction, reversed.pairs);
            }
            if (!rolesUpdated || sanitizedResult.changed) {
                restoreDirectionRoles(previousRoles);
                showInvalidDirectionWarning(instruction);
                return {
                    changed: false,
                    pairs: normalizePairs(currentPairs),
                    blocked: true
                };
            }
        }

        return {
            changed: true,
            pairs: sanitizedResult.pairs,
            previousPair: reversed.previousPair,
            reversedPair: reversed.reversedPair
        };
    }

    return {
        getInstructionMessage: getInstructionMessage,
        showInvalidDirectionWarning: showInvalidDirectionWarning,
        extractResponsePairs: extractResponsePairs,
        normalizePairs: normalizePairs,
        sanitizePairs: sanitizePairs,
        sanitizePairChange: sanitizePairChange,
        reversePair: reversePair,
        updateDirectionRolesForPair: updateDirectionRolesForPair,
        reverseSelectedPair: reverseSelectedPair
    };
});
