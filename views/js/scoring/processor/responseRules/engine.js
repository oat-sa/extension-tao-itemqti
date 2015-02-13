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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * The engine that process QTI responses rules.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/responseRules/processor',
    'taoQtiItem/scoring/processor/responseRules/rules',
    'taoQtiItem/scoring/processor/expressions/engine',
], function(_, processorFactory, rules, expressionEngineFactory){
    'use strict';

    //regsiter rules processors
    _.forEach(rules, function(rule, name){
        processorFactory.register(name, rule);
    });

    /**
     * Creates an engine that can look over the rule and execute them accordingy.
     *
     * @exports taoQtiItem/scoring/processor/expressions/engine
     * @param {Object} state - the item session state (response and outcome variables)
     * @returns {Object} the rule engine
     */
    var ruleEngineFactory = function ruleEngineFactory (state){

        var trail = [];

        var expressionEngine = expressionEngineFactory(state);

        var evalRuleCondition = function evalRuleCondition(rule){
            var expressionResult;
            if(!rule.expression){
                return false;
            }

            //TODO catch errors
            expressionResult = expressionEngine.execute(rule.expression);

            return expressionResult && expressionResult.value === true;
        };


        var processCondition = function processCondition(rule){
            var index = 0;
            if(evalRuleCondition(rule.responseIf)){
                //in the if condition
                return rule.responseIf.responseRules;

            }

            if(rule.responseElseIf){
                for(index in rule.responseElseIf){
                    if(evalRuleCondition(rule.responseElseIf[index])){
                        return rule.responseElseIf[index].responseRules;
                    }
                }
            }
            if(rule.responseElse){
                return rule.responseElse.responseRules;
            }
            return [];
        };

        return {

            /**
             * Execute the engine on the given rule tree
             * @param {Array<Object>} rules - the rules to process
             * @return {Object} the modified state (it may not be necessary as the ref is modified)
             */
            execute : function(rules){

                var currentRule,
                    currentProcessor;

                trail = _.clone(rules);

                //TODO remove the limit and add a timeout
                while(trail.length > 0){

                    currentRule = trail.pop();

                    if(currentRule.qtiClass === 'responseCondition'){

                        trail = trail.concat(processCondition(currentRule));

                    } else {

                        //process response rule
                        currentProcessor = processorFactory(currentRule, state);
                        currentProcessor.process();
                    }
                }

                return state;
            }
        };
    };

    return ruleEngineFactory;
});
