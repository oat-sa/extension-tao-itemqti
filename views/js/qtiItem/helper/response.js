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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
define(['lodash'], function(_) {
    'use strict';

    var _templateNames = {
        'MATCH_CORRECT': 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct',
        'MAP_RESPONSE': 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
        'MAP_RESPONSE_POINT': 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point'
    };

    return {
        isUsingTemplate: function isUsingTemplate(response, tpl) {
            if (_.isString(tpl)) {
                if (tpl === response.template || _templateNames[tpl] === response.template) {
                    return true;
                }
            }
            return false;
        },
        isValidTemplateName: function isValidTemplateName(tplName) {
            return !!this.getTemplateUriFromName(tplName);
        },
        getTemplateUriFromName: function getTemplateUriFromName(tplName) {
            if (_templateNames[tplName]) {
                return _templateNames[tplName];
            }
            return '';
        },
        getTemplateNameFromUri: function getTemplateNameFromUri(tplUri) {
            var tplName = '';
            _.forIn(_templateNames, function (uri, name) {
                if (uri === tplUri) {
                    tplName = name;
                    return false;
                }
            });
            return tplName;
        },
        setNormalMaximum: function setNormalMaximum(item) {
            var normalMaximum,
                scoreOutcome = item.getOutcomeDeclaration('SCORE');

            if(!scoreOutcome){
                //invalid QTI item with missing mandatory SCORE outcome
                throw Error('no score outcome found');
            }

            if (item.responseProcessing && item.responseProcessing.processingType === 'templateDriven') {
                normalMaximum = _.reduce(item.getInteractions(), function (acc, interaction) {
                    var interactionMaxScore = interaction.getNormalMaximum();
                    if(_.isNumber(interactionMaxScore)){
                        return acc + interactionMaxScore;
                    }else{
                        return false;
                    }
                }, 0);
            }

            if(_.isNumber(normalMaximum)){
                scoreOutcome.attr('normalMaximum', normalMaximum);
            }else{
                scoreOutcome.removeAttr('normalMaximum');
            }

        },
        choiceInteractionBased : function choiceInteractionBased(interaction){
            var responseHelper = this;
            var maxChoice = parseInt(interaction.attr('maxChoices'));
            var minChoice = parseInt(interaction.attr('minChoices'));
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, scoreMaps, skippableWrongResponse, totalAnswerableResponse;

            if (template === 'MATCH_CORRECT') {
                if(maxChoice && _.isArray(responseDeclaration.correctResponse) && responseDeclaration.correctResponse.length > maxChoice){
                    //max choice does not enable selecting the correct responses
                    max = 0;
                }else if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;
                }
            }else if(template === 'MAP_RESPONSE') {

                //calculate the maximum reachable score by choice map
                scoreMaps = _.values(responseDeclaration.mapEntries);
                skippableWrongResponse = (minChoice === 0) ? Infinity : minChoice;
                totalAnswerableResponse = (maxChoice === 0) ? Infinity : maxChoice;

                max = _(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).sortBy().reverse().take(totalAnswerableResponse).reduce(function (acc, v) {
                    if (v >= 0) {
                        return acc + v;
                    } else if (skippableWrongResponse > 0) {
                        skippableWrongResponse--;
                        return acc;
                    } else {
                        return acc + v;
                    }
                }, 0);
                max = parseFloat(max);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = false;
            }
            return max;
        },
        orderInteractionBased : function orderInteractionBased(interaction){
            var responseHelper = this;
            var maxChoice = parseInt(interaction.attr('maxChoices'));
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max;

            if (template === 'MATCH_CORRECT') {
                if(maxChoice && _.isArray(responseDeclaration.correctResponse) && responseDeclaration.correctResponse.length > maxChoice){
                    //max choice does not enable selecting the correct responses
                    max = 0;
                }else if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;
                }
            }else if(template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT') {
                max = false;
            }
            return max;
        },
        associateInteractionBased : function associateInteractionBased(interaction){
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = this.getTemplateNameFromUri(responseDeclaration.template);
            var max;
            var maxAssoc = parseInt(interaction.attr('maxAssociations'));
            var minAssoc = parseInt(interaction.attr('minAssociations'));
            var skippableWrongResponse, totalAnswerableResponse, usedChoices, group1;

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;//is possible until proven otherwise
                    group1 = [];
                    _.each(responseDeclaration.correctResponse, function(pair){
                        var choices;
                        if(!_.isString(pair)){
                            return;
                        }
                        choices = pair.trim().split(' ');
                        if(_.isArray(choices) && choices.length === 2){
                            group1.push(choices[0].trim());
                            group1.push(choices[1].trim());
                        }
                    });

                    _.each(_.countBy(group1), function(count, identifier){
                        var choice = interaction.getChoiceByIdentifier(identifier);
                        var matchMax = parseInt(choice.attr('matchMax'));
                        if(matchMax && matchMax < count){
                            max = 0;
                            return false;
                        }
                    });
                }
            }else if(template === 'MAP_RESPONSE') {

                skippableWrongResponse = (minAssoc === 0) ? Infinity : minAssoc;//TODO fix this interpretation of min association, should take into account
                totalAnswerableResponse = (maxAssoc === 0) ? Infinity : maxAssoc;
                usedChoices = {};
                max = _(responseDeclaration.mapEntries).map(function(score, pair){
                    return {
                        score : parseFloat(score),
                        pair : pair
                    };
                }).sortBy('score').reverse().filter(function(mapEntry){
                    var pair = mapEntry.pair;
                    var choices, choiceId, choice, i;

                    if(!_.isString(pair)){
                        return false;
                    }

                    choices = pair.trim().split(' ');
                    if(_.isArray(choices) && choices.length === 2){
                        for(i = 0; i < 2; i++){
                            choiceId = choices[i];
                            if(!usedChoices[choiceId]){
                                choice = interaction.getChoiceByIdentifier(choiceId);
                                if(!choice){
                                    //inexisting choice, skip
                                    return false;
                                }
                                usedChoices[choiceId] = {
                                    used : 0,
                                    max: parseInt(choice.attr('matchMax'))
                                };
                            }
                            if(usedChoices[choiceId].max && usedChoices[choiceId].used === usedChoices[choiceId].max){
                                //skip
                                return false;
                            }else{
                                usedChoices[choiceId].used ++;
                            }
                        }

                        return true;
                    }else{
                        //is not a correct response pair
                        return false;
                    }
                }).take(totalAnswerableResponse).reduce(function (acc, v) {
                    var score = v.score;
                    if (score >= 0) {
                        return acc + score;
                    } else if (skippableWrongResponse > 0) {
                        skippableWrongResponse--;
                        return acc;
                    } else {
                        return acc + score;
                    }
                }, 0);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = false;
            }
            return max;
        }
    };
});