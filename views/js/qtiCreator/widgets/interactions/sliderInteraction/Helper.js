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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 */

define([
    'i18n',
    'ui/feedback',
    'ui/dialog/confirm',
], function (__, feedback, dialogConfirm) {

    return {
        /**
         * Validate all parameters and check that slider has correct values
         * @param interaction
         * @param currentResponse
         */
        responseManager: function responseManager(interaction, currentResponse) {

            const lowerBound = interaction.attributes.lowerBound;
            const upperBound = interaction.attributes.upperBound;

            return {
                isValid: function () {
                    console.log('lb', lowerBound)
                    console.log('ub', upperBound)
                    console.log('current', currentResponse)
                    return lowerBound <= upperBound
                        && currentResponse >= lowerBound
                        && currentResponse <= upperBound;
                },
                getErrorMessage: function () {
                    let msg = '';
                    if (lowerBound > upperBound) {
                        msg = __('Lower bound is bigger than upper bound.');
                    } else if (lowerBound === upperBound && currentResponse !== lowerBound) {
                        msg = __('Response ["%s"] should be the only possible value "%s".', currentResponse, lowerBound);
                    } else if (currentResponse > upperBound) {
                        msg = __('Response ["%s"] is bigger than the upper bound value "%s".', currentResponse, upperBound);
                    } else if (currentResponse < lowerBound) {
                        msg = __('Response ["%s"] is lower than the lower bound value "%s".', currentResponse, lowerBound);
                    }
                    return msg;
                }
            };
        }
    }
});
