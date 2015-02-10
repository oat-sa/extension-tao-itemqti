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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/engine'
], function(_, expressionEngine){
    'use strict';


    var responseRuleParserFactory = function(){

        var trail = [];

        var evalRuleCondition = function evalRuleCondition(rule, response){
            var expressionResult;
            if(!rule.expression){
                return false;
            }

            //TODO catch errors
            expressionResult = expressionEngine.parse(rule.expression, response);

            return expressionResult && expressionResult.value === true;
        };


        var processCondition = function processCondition(rule, response){
            var index = 0;
            if(evalRuleCondition(rule.responseIf, response)){
                //in the if condition
                return rule.responseIf.responseRules;

            }

            if(rule.responseElseIf){
                for(index in rule.responseElseIf){
                    if(evalRuleCondition(rule.responseElseIf[index], response)){
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

            //TODO rename
            parse : function(rule, response){


                var currentRule,
                    expressionResult,
                    followElseIf;
                var i = 0;

                trail.push(rule);

                //TODO remove the limit and add a timeout
                while(trail.length > 0 && i < 128){


                    expressionResult = null;
                    followElseIf = false;
                    currentRule = trail.pop();

                    console.log(i);
                    console.log('rule', currentRule);
                    console.log('trail before', _.cloneDeep(trail));

                    if(currentRule.qtiClass === 'responseCondition'){

                        trail.concat(processCondition(currentRule, response));

                    } else {
                        //process response rule
                    }
                    console.log('trail after', _.cloneDeep(trail));
                    //console.log('marker after', _.cloneDeep(marker));
                    //console.log('operands', _.cloneDeep(operands));
                    //console.log('result', _.cloneDeep(result));
                    console.log("-------");
                    i++;
                }
            }
        };
    };

    return responseRuleParserFactory;
});
