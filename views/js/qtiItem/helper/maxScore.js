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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'lib/gamp/gamp',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration'
], function(_, gamp, responseHelper, OutcomeDeclaration) {
    'use strict';

    /**
     * This variable allow to globally define if the minCHoice needs to be taken into consideration.
     * Standard-wise, it must definitely be considered.
     * However, the item delivery lifecycle currently does not consider the minChoice constraint during delivery.
     * It is thus currently set to true. After the correct behaviour is implemented, we should remove this variables.
     * @type {boolean}
     * @private
     */
    var _ignoreMinChoice = true;

    var pairExists = function pairExists(collection, pair){
        if(pair.length !== 2){
            return false;
        }
        return (collection[pair[0]+' '+pair[1]] || collection[pair[1]+' '+pair[0]]);
    };

    return {
        /**
         * Set the normal maximum to the item
         * @param {Object} item - the standard qti item model object
         */
        setNormalMaximum : function setNormalMaximum(item) {
            var normalMaximum,
                scoreOutcome = item.getOutcomeDeclaration('SCORE');

            //try setting the computed normal maximum only if the processing type is known, i.e. 'templateDriven'
            if (scoreOutcome && item.responseProcessing && item.responseProcessing.processingType === 'templateDriven') {
                normalMaximum = _.reduce(item.getInteractions(), function (acc, interaction) {
                    var interactionMaxScore = interaction.getNormalMaximum();
                    if(_.isNumber(interactionMaxScore)){
                        return gamp.add(acc, interactionMaxScore);
                    }else{
                        return false;
                    }
                }, 0);

                if(_.isNumber(normalMaximum)){
                    scoreOutcome.attr('normalMaximum', normalMaximum);
                }else{
                    scoreOutcome.removeAttr('normalMaximum');
                }
            }
        },

        /**
         * Set the maximum score of the item
         * @param {Object} item - the standard qti item model object
         */
        setMaxScore : function setMaxScore(item) {
            var hasInvalidInteraction = false,
                scoreOutcome = item.getOutcomeDeclaration('SCORE'),
                customOutcomes,
                maxScore,
                maxScoreOutcome;

            //try setting the computed normal maximum only if the processing type is known, i.e. 'templateDriven'
            if (scoreOutcome && item.responseProcessing && item.responseProcessing.processingType === 'templateDriven') {

                maxScore = _.reduce(item.getInteractions(), function (acc, interaction) {
                    var interactionMaxScore = interaction.getNormalMaximum();
                    if(_.isNumber(interactionMaxScore)){
                        return gamp.add(acc, interactionMaxScore);
                    }else{
                        hasInvalidInteraction = true;
                        return acc;
                    }
                }, 0);

                customOutcomes =  _(item.getOutcomes()).filter(function(outcome){
                    return (outcome.id() !== 'SCORE' && outcome.id() !== 'MAXSCORE');
                });

                if(customOutcomes.size()){
                    maxScore = customOutcomes.reduce(function (acc, outcome) {
                        return gamp.add(acc, parseFloat(outcome.attr('normalMaximum')||0));
                    }, maxScore);
                }

                if(!hasInvalidInteraction || customOutcomes.size()){
                    maxScoreOutcome = item.getOutcomeDeclaration('MAXSCORE');
                    if(!maxScoreOutcome){
                        //add new outcome
                        maxScoreOutcome = new OutcomeDeclaration({
                            cardinality : 'single',
                            baseType : 'float'
                        });

                        //attach the outcome to the item before generating item-level unique id
                        item.addOutcomeDeclaration(maxScoreOutcome);
                        maxScoreOutcome.buildIdentifier('MAXSCORE', false);
                    }
                    maxScoreOutcome.setDefaultValue(maxScore);
                }else{
                    //remove MAXSCORE:
                    item.removeOutcome('MAXSCORE');
                }
            }
        },

        /**
         * Sort an array of associable choices by its matchMax attr value
         * @param {Array} choiceCollection
         * @returns {Array}
         */
        getMatchMaxOrderedChoices : function getMatchMaxOrderedChoices(choiceCollection){
            return _(choiceCollection).map(function(choice){
                var matchMax = parseInt(choice.attr('matchMax'), 10);
                if(_.isNaN(matchMax)){
                    matchMax = 0;
                }
                return {
                    matchMax : matchMax === 0 ? Infinity : matchMax,
                    id: choice.id()
                };
            }).sortBy('matchMax').reverse().valueOf();
        },

        /**
         * Compute the maximum score of a "choice" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        choiceInteractionBased : function choiceInteractionBased(interaction, options){
            var responseDeclaration = interaction.getResponseDeclaration();
            var mapDefault = parseFloat(responseDeclaration.mappingAttributes.defaultValue||0);
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, maxChoice, minChoice, scoreMaps, requiredChoiceCount, totalAnswerableResponse, sortedMapEntries, i, missingMapsCount;

            options = _.defaults(options || {}, {maxChoices : 0, minChoices: 0});
            maxChoice = parseInt(interaction.attr('maxChoices')||options.maxChoices, 10);
            minChoice = _ignoreMinChoice ? 0 : parseInt(interaction.attr('minChoices')||options.minChoices, 10);
            if(maxChoice && minChoice && maxChoice < minChoice){
                return 0;
            }

            if (template === 'MATCH_CORRECT') {
                if(maxChoice && _.isArray(responseDeclaration.correctResponse) && (responseDeclaration.correctResponse.length > maxChoice || responseDeclaration.correctResponse.length < minChoice)){
                    //max choice does not enable selecting the correct responses
                    max = 0;
                }else if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;
                }
            }else if(template === 'MAP_RESPONSE') {

                //at least a map entry is required to be valid QTI
                if(!responseDeclaration.mapEntries || !_.size(responseDeclaration.mapEntries)){
                    return 0;
                }

                //prepare constraint params
                requiredChoiceCount = minChoice;
                totalAnswerableResponse = (maxChoice === 0) ? Infinity : maxChoice;

                //sort the score map entries by the score
                scoreMaps = _.values(responseDeclaration.mapEntries);
                sortedMapEntries = _(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).sortBy().reverse().first(totalAnswerableResponse);

                //if there is not enough map defined, compared to the minChoice constraint, fill in the rest of required choices with the default map
                missingMapsCount = minChoice - sortedMapEntries.size();
                _.times(missingMapsCount, function(){
                    sortedMapEntries.push(mapDefault);
                });

                //if the map default is positive, the optimal strategy involves using as much mapDefault as possible
                if(mapDefault && mapDefault > 0){
                    if(maxChoice){
                        missingMapsCount = maxChoice - sortedMapEntries.size();
                    }else{
                        missingMapsCount = _.size(interaction.getChoices()) - sortedMapEntries.size();
                    }
                    if(missingMapsCount > 0){
                        _.times(missingMapsCount, function(){
                            sortedMapEntries.push(mapDefault);
                        });
                    }
                }

                //calculate the maximum reachable score by choice map
                max = sortedMapEntries.reduce(function (acc, v) {
                    var score = v;
                    if(score < 0 && requiredChoiceCount <= 0){
                        //if the score is negative check if we have the choice not to pick it
                        score = 0;
                    }
                    requiredChoiceCount--;
                    return gamp.add(acc, score);
                }, 0);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                //map point response processing does not work on choice based interaction
                max = 0;
            }
            return max;
        },

        /**
         * Compute the maximum score of a "order" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        orderInteractionBased : function orderInteractionBased(interaction){
            var minChoice = _ignoreMinChoice ? 0 : parseInt(interaction.attr('minChoices')||0, 10);
            var maxChoice = parseInt(interaction.attr('maxChoices')||0, 10);
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max;

            if(maxChoice && minChoice && maxChoice < minChoice){
                return 0;
            }

            if (template === 'MATCH_CORRECT') {
                if(_.isArray(responseDeclaration.correctResponse) && (maxChoice && responseDeclaration.correctResponse.length > maxChoice) || (minChoice && responseDeclaration.correctResponse.length < minChoice)){
                    //max choice does not enable selecting the correct responses
                    max = 0;
                }else if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;
                }
            }else if(template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT') {
                //map response processing does not work on order based interaction
                max = 0;
            }
            return max;
        },

        /**
         * Compute the maximum score of a "associate" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        associateInteractionBased : function associateInteractionBased(interaction, options){
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var maxAssoc = parseInt(interaction.attr('maxAssociations')||0, 10);
            var minAssoc = _ignoreMinChoice ? 0 : parseInt(interaction.attr('minAssociations')||0, 10);
            var mapDefault = parseFloat(responseDeclaration.mappingAttributes.defaultValue||0);
            var max, requiredAssoc, totalAnswerableResponse, usedChoices, choicesIdentifiers, sortedMapEntries, i, allPossibleMapEntries, infiniteScoringPair;

            options = _.defaults(options || {}, {possiblePairs : [], checkInfinitePair: false});

            if(maxAssoc && minAssoc && maxAssoc < minAssoc){
                return 0;
            }

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse
                    || (_.isArray(responseDeclaration.correctResponse)
                    && (!responseDeclaration.correctResponse.length || maxAssoc && responseDeclaration.correctResponse.length > maxAssoc || minAssoc && responseDeclaration.correctResponse.length < minAssoc) )){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;//is possible until proven otherwise

                    //get the list of choices used in map entries
                    choicesIdentifiers = [];
                    _.forEach(responseDeclaration.correctResponse, function(pair){
                        var choices;
                        if(!_.isString(pair)){
                            return;
                        }
                        choices = pair.trim().split(' ');
                        if(_.isArray(choices) && choices.length === 2){
                            choicesIdentifiers.push(choices[0].trim());
                            choicesIdentifiers.push(choices[1].trim());
                        }
                    });

                    //check if the choices usage are possible within the constraint defined in the interaction
                    _.forEach(_.countBy(choicesIdentifiers), function(count, identifier){
                        var matchMax;
                        var choice = interaction.getChoiceByIdentifier(identifier);
                        if(!choice){
                            max = 0;
                            return false;
                        }
                        matchMax = parseInt(choice.attr('matchMax'), 10);
                        if(matchMax && matchMax < count){
                            max = 0;
                            return false;
                        }
                    });
                }
            }else if(template === 'MAP_RESPONSE') {

                requiredAssoc = minAssoc;
                totalAnswerableResponse = (maxAssoc === 0) ? Infinity : maxAssoc;
                usedChoices = {};

                //at least a map entry is required to be valid QTI
                if(!responseDeclaration.mapEntries || !_.size(responseDeclaration.mapEntries)){
                    return 0;
                }

                allPossibleMapEntries = _.clone(responseDeclaration.mapEntries);
                if(mapDefault && mapDefault > 0){
                    _.forEachRight(options.possiblePairs, function(pair){
                        if(!pairExists(allPossibleMapEntries, pair)){
                            allPossibleMapEntries[pair[0]+' '+pair[1]] = mapDefault;
                        }
                    });
                }

                //get the sorted list of mapentries ordered by the score
                sortedMapEntries = _(allPossibleMapEntries).map(function(score, pair){
                    return {
                        score : parseFloat(score),
                        pair : pair
                    };
                }).sortBy('score').reverse().filter(function(mapEntry){
                    var pair = mapEntry.pair;
                    var choices, choiceId, choice, _usedChoices;

                    if(!_.isString(pair)){
                        return false;
                    }

                    //check that the pair is possible in term of matchMax
                    choices = pair.trim().split(' ');
                    if(_.isArray(choices) && choices.length === 2){
                        //clone the global used choices array to brings the changes in that object first before storing in the actual object
                        _usedChoices = _.cloneDeep(usedChoices);

                        for(i = 0; i < 2; i++){
                            choiceId = choices[i];

                            //collect choices usage to check if the pair is possible
                            if(!_usedChoices[choiceId]){
                                choice = interaction.getChoiceByIdentifier(choiceId);
                                if(!choice){
                                    //unexisting choice, skip
                                    return false;
                                }
                                _usedChoices[choiceId] = {
                                    used : 0,
                                    max: parseInt(choice.attr('matchMax'), 10)
                                };
                            }
                            if(_usedChoices[choiceId].max && _usedChoices[choiceId].used === _usedChoices[choiceId].max){
                                //skip
                                return false;
                            }else{
                                _usedChoices[choiceId].used ++;
                            }
                        }

                        //identify the edge case when we can get infinite association pair that create an infinite score
                        infiniteScoringPair = infiniteScoringPair || (options.checkInfinitePair
                            && mapEntry.score > 0
                            && _usedChoices[choices[0]].max === 0
                            && _usedChoices[choices[1]].max === 0);

                        //update the global used choices array
                        _.assign(usedChoices, _usedChoices);
                        return true;
                    }else{
                        //is not a correct response pair
                        return false;
                    }
                }).first(totalAnswerableResponse);

                //infinite score => no normalMaximum should be generated for it
                if(infiniteScoringPair){
                    return false;
                }

                //reduce the ordered list of map entries to calculate the max score
                max = sortedMapEntries.reduce(function (acc, v) {
                    var score = v.score;
                    if(v.score < 0 && requiredAssoc <= 0){
                        //if the score is negative check if we have the choice not to pick it
                        score = 0;
                    }
                    requiredAssoc--;
                    return gamp.add(acc, score);
                }, 0);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = 0;
            }
            return max;
        },

        /**
         * Compute the maximum score of a "gap match" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        gapMatchInteractionBased : function gapMatchInteractionBased(interaction){
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var maxAssoc = 0;
            var minAssoc = 0;
            var mapDefault = parseFloat(responseDeclaration.mappingAttributes.defaultValue||0);
            var max, skippableWrongResponse, totalAnswerableResponse, usedChoices, usedGaps, group1, group2, allPossibleMapEntries;
            var getMatchMaxOrderedChoices = function getMatchMaxOrderedChoices(choiceCollection){
                return _(choiceCollection).map(function(choice){
                    return {
                        matchMax : choice.attr('matchMax') === 0 ? Infinity : choice.attr('matchMax') || 0,
                        id: choice.id()
                    };
                }).sortBy('matchMax').reverse().valueOf();
            };
            var calculatePossiblePairs = function calculatePossiblePairs(gapMatchInteraction){
                //get max number of pairs
                var pairs = [];
                var matchSet1 = getMatchMaxOrderedChoices(gapMatchInteraction.getChoices());
                var matchSet2 = getMatchMaxOrderedChoices(gapMatchInteraction.getGaps());

                _.forEach(matchSet1, function(choice1){
                    _.forEach(matchSet2, function(choice2){
                        pairs.push([choice1.id, choice2.id]);
                    });
                });

                return pairs;
            };

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;//is possible until proven otherwise
                    group1 = [];
                    group2 = [];
                    _.forEach(responseDeclaration.correctResponse, function(pair){
                        var choices;
                        if(!_.isString(pair)){
                            return;
                        }
                        choices = pair.trim().split(' ');
                        if(_.isArray(choices) && choices.length === 2){
                            group1.push(choices[0].trim());
                            group2.push(choices[1].trim());
                        }
                    });

                    _.forEach(_.countBy(group1), function(count, identifier){
                        var choice = interaction.getChoiceByIdentifier(identifier);
                        var matchMax = parseInt(choice.attr('matchMax'), 10);
                        if(matchMax && matchMax < count){
                            max = 0;
                            return false;
                        }
                    });

                    _.forEach(_.countBy(group2), function(count){
                        var matchMax = 1;//match max for a gap is always 1
                        if(matchMax && matchMax < count){
                            max = 0;
                            return false;
                        }
                    });
                }
            }else if(template === 'MAP_RESPONSE') {

                skippableWrongResponse = (minAssoc === 0) ? Infinity : minAssoc;
                totalAnswerableResponse = (maxAssoc === 0) ? Infinity : maxAssoc;
                usedChoices = {};
                usedGaps = {};

                //at least a map entry is required to be valid QTI
                if(!responseDeclaration.mapEntries || !_.size(responseDeclaration.mapEntries)){
                    return 0;
                }

                allPossibleMapEntries = _.clone(responseDeclaration.mapEntries);
                if(mapDefault && mapDefault > 0){
                    _.forEachRight(calculatePossiblePairs(interaction), function(pair){
                        if(!pairExists(allPossibleMapEntries, pair)){
                            allPossibleMapEntries[pair[0]+' '+pair[1]] = mapDefault;
                        }
                    });
                }

                max = _(allPossibleMapEntries).map(function(score, pair){
                    return {
                        score : parseFloat(score),
                        pair : pair
                    };
                }).sortBy('score').reverse().filter(function(mapEntry){
                    var pair = mapEntry.pair;
                    var _usedChoices = _.cloneDeep(usedChoices);
                    var choices, choiceId, gapId, choice;

                    if(!_.isString(pair)){
                        return false;
                    }

                    choices = pair.trim().split(' ');
                    if(_.isArray(choices) && choices.length === 2){
                        choiceId = choices[0];
                        gapId = choices[1];
                        if(!_usedChoices[choiceId]){
                            choice = interaction.getChoiceByIdentifier(choiceId);
                            if(!choice){
                                //inexisting choice, skip
                                return false;
                            }
                            _usedChoices[choiceId] = {
                                used : 0,
                                max: parseInt(choice.attr('matchMax'), 10)
                            };
                        }
                        if(_usedChoices[choiceId].max && _usedChoices[choiceId].used === _usedChoices[choiceId].max){
                            //skip
                            return false;
                        }
                        _usedChoices[choiceId].used ++;

                        if(!usedGaps[gapId]){
                            usedGaps[gapId] = {
                                used : 0,
                                max: 1
                            };
                        }
                        if(usedGaps[gapId].max && usedGaps[gapId].used === usedGaps[gapId].max){
                            //skip
                            return false;
                        }
                        usedGaps[gapId].used ++;

                        //if an only if it is ok, we merge the temporary used choices array into the global one
                        _.assign(usedChoices, _usedChoices);
                        return true;
                    }else{
                        //is not a correct response pair
                        return false;
                    }
                }).first(totalAnswerableResponse).reduce(function (acc, v) {
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

                //console.log(usedChoices, allPossibleMapEntries, sortedMaps);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = false;
            }
            return max;
        },

        /**
         * Compute the maximum score of a "select point" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        selectPointInteractionBased : function selectPointInteractionBased(interaction){
            var maxChoice = parseInt(interaction.attr('maxChoices'), 10);
            var minChoice = _ignoreMinChoice ? 0 : parseInt(interaction.attr('minChoices'), 10);
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, skippableWrongResponse, totalAnswerableResponse;

            if (template === 'MATCH_CORRECT' || template === 'MAP_RESPONSE') {
                //such templates are not allowed
                return 0;
            }else if(template === 'MAP_RESPONSE_POINT'){
                //calculate the maximum reachable score by choice map
                skippableWrongResponse = (minChoice === 0) ? Infinity : minChoice;
                totalAnswerableResponse = (maxChoice === 0) ? Infinity : maxChoice;

                max = _(responseDeclaration.mapEntries).map(function (v) {
                    return parseFloat(v.mappedValue);
                }).sortBy().reverse().first(totalAnswerableResponse).reduce(function (acc, v) {
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
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }
            return max;
        },

        /**
         * Compute the maximum score of a "slider" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        sliderInteractionBased : function sliderInteractionBased(interaction){
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, scoreMaps;

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = 1;
                }
            }else if(template === 'MAP_RESPONSE') {

                //at least a map entry is required to be valid QTI
                if(!responseDeclaration.mapEntries || !_.size(responseDeclaration.mapEntries)){
                    return 0;
                }

                //calculate the maximum reachable score by choice map
                scoreMaps = _.values(responseDeclaration.mapEntries);
                max = _(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).max();
                max = parseFloat(max);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = 0;
            }
            return max;
        },

        /**
         * Compute the maximum score of a "text entry" typed interaction
         * @param {Object} interaction - a standard interaction model object
         * @returns {Number}
         */
        textEntryInteractionBased : function textEntryInteractionBased(interaction){
            var responseDeclaration = interaction.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, scoreMaps;

            /**
             * Check that a response is possible or not according to the defined patternmask
             * @param {String} value
             * @returns {Boolean}
             */
            var isPossibleResponse = function isPossibleResponse(value){
                var patternMask = interaction.attr('patternMask');
                if(patternMask){
                    return !!value.match(new RegExp(patternMask));
                }else{
                    //no restriction by pattern so always possible
                    return true;
                }
            };

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = isPossibleResponse(responseDeclaration.correctResponse[0]) ? 1 : 0;
                }
            }else if(template === 'MAP_RESPONSE') {

                //at least a map entry is required to be valid QTI
                if(!responseDeclaration.mapEntries || !_.size(responseDeclaration.mapEntries)){
                    return 0;
                }

                //calculate the maximum reachable score by choice map
                scoreMaps = _.values(_.filter(responseDeclaration.mapEntries, function(score, key){
                    return isPossibleResponse(key);
                }));
                max = _(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).max();
                max = parseFloat(max);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound||0));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = 0;
            }
            return max;
        }
    };
});