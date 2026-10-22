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
 * The setOutcomeValue processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10421
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import expressionEngineFactory from 'taoQtiItem/scoring/processor/expressions/engine';
import errorHandler from 'taoQtiItem/scoring/processor/errorHandler';

/**
 * The rule processor.
 *
 * @type {responseRuleProcessor}
 * @exports taoQtiItem/scoring/processor/responseRules/setOutcomeValue
 */
var setOutcomeValueProcessor = {

    /**
     * Process the rule
     */
    process: function() {
        var identifier = this.rule.attributes.identifier;
        var variable = this.state[identifier];
        var expressionEngine = expressionEngineFactory(this.state);
        var result = expressionEngine.execute(this.rule.expression);

        if (!variable || !variable.baseType) {
            return errorHandler.throw('scoring', new TypeError('No variable found with identifier ' + identifier));
        }

        if (result && typeof result.value !== 'undefined') {
            variable.value = result.value;
        }
    }
};

export default setOutcomeValueProcessor;
