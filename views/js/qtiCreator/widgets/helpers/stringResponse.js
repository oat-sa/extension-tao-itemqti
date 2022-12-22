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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */
define(['util/converter'], function (converter) {
    'use strict';

    return {
        /**
         * Gets the value of the correct response for a TextEntry interaction from a response declaration.
         * The value is sanitized using the text converter.
         * @param {ResponseDeclaration} response - The response declaration for getting the correct response.
         * @param {object} [config] - A set of options that will be passed to the converter.
         * @returns {string} - The value of the correct response.
         */
        getCorrectResponse(response, config = {}) {
            const correct = response.getCorrect();

            if (!correct) {
                return '';
            }

            const correctResponses = Array.isArray(correct) ? correct : Object.values(correct);
            return converter.convert(correctResponses[0] || '', config);
        },

        /**
         * Sets the value of the correct response for a TextEntry interaction through a response declaration.
         * The value is sanitized using the text converter.
         * @param {ResponseDeclaration} response - The response declaration for setting the correct response.
         * @param {string} value - The value of the correct response.
         * @param {object} [config] - A set of options that will be passed to the converter.
         * @param {string} [config.trim] - When set to true, trim the leading and trailing whitespace from the value.
         */
        setCorrectResponse(response, value, config = {}) {
            if (config && config.trim) {
                value = value.trim();
            }

            if (value) {
                const { trim, ...convertConfig } = config || {};
                response.setCorrect(converter.convert(value, convertConfig));
            } else {
                response.resetCorrect();
            }
        }
    };
});
