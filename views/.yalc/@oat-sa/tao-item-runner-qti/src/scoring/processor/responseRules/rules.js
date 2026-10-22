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
 * Copyright (c) 2015-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Expose all rule processors.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import exitResponse from 'taoQtiItem/scoring/processor/responseRules/exitResponse';
import responseCondition from 'taoQtiItem/scoring/processor/responseRules/responseCondition';
import setOutcomeValue from 'taoQtiItem/scoring/processor/responseRules/setOutcomeValue';

/**
 * An ResponseRuleProcessor
 * @typedef ResponseRuleProcessor
 * @property {Object} rule - the response rule definition
 * @property {Object} state - the item state (response, outcomes and friends)
 * @property {Funtion} process - the processing
 */

/**
 * Mock a processor only to make some responseRules supported but do nothing
 * (when the behavior is implemented somewhere else)
 * @private
 */
var _noopProcessor = {
    process: function() {}
};

/**
 * Lists all available response rule processors
 * @exports taoQtiItem/scoring/processor/responseRules/rules
 */
export default {
    'exitResponse': exitResponse,
    'responseCondition': responseCondition,
    'responseIf': _noopProcessor,
    'responseElse': _noopProcessor,
    'responseElseIf': _noopProcessor,
    'setOutcomeValue': setOutcomeValue,
};
