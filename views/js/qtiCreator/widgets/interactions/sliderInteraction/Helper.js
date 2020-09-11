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
         * @param response
         * @param currentResponse
         */
        responseManager: function responseManager(interaction, response, currentResponse) {
            const lowerBound = interaction.attributes.lowerBound;
            const upperBound = interaction.attributes.upperBound;

            let validResponse = 0;
            let errMessage = '';
            let warnQuestion = '';

            // if response is bigger than allowed
            if (lowerBound > upperBound) {
                errMessage = __('Lower bound can not be bigger than upper bound.');
            } else if (lowerBound === upperBound && currentResponse !== lowerBound) {
                // if upper and lower are equal
                warnQuestion = __('Change response ["%s"] to the only possible value "%s".', currentResponse, lowerBound);
                validResponse = lowerBound;
            } else if (currentResponse > upperBound) {
                warnQuestion = __('Change response ["%s"] to the upper bound value "%s".', currentResponse, upperBound);
                validResponse = upperBound;
            } else if (currentResponse < lowerBound) {
                warnQuestion = __('Change response ["%s"] to the lower bound value "%s".', currentResponse, lowerBound);
                validResponse = lowerBound;
            } else {
                validResponse = currentResponse;
            }

            if (warnQuestion.length) {
                dialogConfirm(warnQuestion, function () {
                    response.setCorrect([validResponse]);
                });
            } else if (errMessage.length) {
                feedback().error(errMessage);
            } else {
                response.setCorrect([validResponse]);
            }
        }
    }
});
