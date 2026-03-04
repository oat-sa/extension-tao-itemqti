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

    const ARROW_SUBTYPE = 'arrow';
    const SUBTYPE_ATTR = 'data-interaction-subtype';
    const START_ATTR = 'data-start';
    const END_ATTR = 'data-end';
    const PAIR_BASE_TYPE = 'pair';
    const DIRECTED_PAIR_BASE_TYPE = 'directedPair';

    function getDirectionFlag(value, defaultValue) {
        if (value === 'true' || value === true) {
            return true;
        }
        if (value === 'false' || value === false) {
            return false;
        }
        return defaultValue;
    }

    function getChoices(interaction) {
        if (!interaction || !_.isFunction(interaction.getChoices)) {
            return [];
        }
        return interaction.getChoices();
    }

    function getChoiceDirection(choice) {
        return {
            start: getDirectionFlag(choice && choice.attr(START_ATTR), true),
            end: getDirectionFlag(choice && choice.attr(END_ATTR), true)
        };
    }

    function setChoiceDirection(choice, start, end) {
        if (!choice) {
            return;
        }
        choice.attr(START_ATTR, start ? 'true' : 'false');
        choice.attr(END_ATTR, end ? 'true' : 'false');
    }

    function setExclusiveChoiceDirection(choice, type, enabled) {
        const direction = getChoiceDirection(choice);
        const isEnabled = enabled === true;

        if (type === 'start') {
            setChoiceDirection(choice, isEnabled, isEnabled ? false : direction.end);
            return getChoiceDirection(choice);
        }

        if (type === 'end') {
            setChoiceDirection(choice, isEnabled ? false : direction.start, isEnabled);
            return getChoiceDirection(choice);
        }

        return direction;
    }

    function ensureChoiceDirectionDefaults(choice) {
        if (!choice) {
            return;
        }

        if (typeof choice.attr(START_ATTR) === 'undefined') {
            choice.attr(START_ATTR, 'true');
        }
        if (typeof choice.attr(END_ATTR) === 'undefined') {
            choice.attr(END_ATTR, 'true');
        }
    }

    function clearChoiceDirection(choice) {
        if (!choice) {
            return;
        }
        choice.removeAttr(START_ATTR);
        choice.removeAttr(END_ATTR);
    }

    function setResponseBaseType(interaction, baseType) {
        if (!interaction || !_.isFunction(interaction.getResponseDeclaration)) {
            return;
        }

        const responseDeclaration = interaction.getResponseDeclaration();
        if (responseDeclaration && _.isFunction(responseDeclaration.attr)) {
            responseDeclaration.attr('baseType', baseType);
        }
    }

    function isArrowMode(interaction) {
        return interaction && _.isFunction(interaction.attr) && interaction.attr(SUBTYPE_ATTR) === ARROW_SUBTYPE;
    }

    function setArrowMode(interaction, enabled) {
        if (!interaction) {
            return false;
        }

        if (enabled) {
            interaction.attr(SUBTYPE_ATTR, ARROW_SUBTYPE);
            setResponseBaseType(interaction, DIRECTED_PAIR_BASE_TYPE);
            _.forEach(getChoices(interaction), function (choice) {
                ensureChoiceDirectionDefaults(choice);
            });
            return true;
        }

        interaction.removeAttr(SUBTYPE_ATTR);
        setResponseBaseType(interaction, PAIR_BASE_TYPE);
        _.forEach(getChoices(interaction), function (choice) {
            clearChoiceDirection(choice);
        });
        return false;
    }

    return {
        isArrowMode: isArrowMode,
        setArrowMode: setArrowMode,
        getChoiceDirection: getChoiceDirection,
        setChoiceDirection: setChoiceDirection,
        setExclusiveChoiceDirection: setExclusiveChoiceDirection,
        ensureChoiceDirectionDefaults: ensureChoiceDirectionDefaults
    };
});
