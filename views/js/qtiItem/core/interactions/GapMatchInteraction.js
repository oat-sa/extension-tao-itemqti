define([
    'taoQtiItem/qtiItem/core/interactions/ContainerInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(ContainerInteraction, responseHelper, _){
    'use strict';
    var GapMatchInteraction = ContainerInteraction.extend({
        qtiClass : 'gapMatchInteraction',
        getGaps : function getGaps(){
            return this.getBody().getElements('gap');
        },
        getNormalMaximum : function getNormalMaximum(){
            var responseDeclaration = this.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max;
            var self = this;
            var maxAssoc = 0;
            var minAssoc = 0;
            var skippableWrongResponse, totalAnswerableResponse, usedChoices, usedGaps, group1, group2;

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
                        var choice = self.getChoiceByIdentifier(identifier);
                        var matchMax = parseInt(choice.attr('matchMax'));
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
                max = _(responseDeclaration.mapEntries).map(function(score, pair){
                    return {
                        score : parseFloat(score),
                        pair : pair
                    };
                }).sortBy('score').reverse().filter(function(mapEntry){
                    var pair = mapEntry.pair;
                    var choices, choiceId, gapId, choice;

                    if(!_.isString(pair)){
                        return false;
                    }

                    choices = pair.trim().split(' ');
                    if(_.isArray(choices) && choices.length === 2){
                        choiceId = choices[0];
                        gapId = choices[1];
                        if(!usedChoices[choiceId]){
                            choice = self.getChoiceByIdentifier(choiceId);
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
                        }
                        usedChoices[choiceId].used ++;

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
    });
    return GapMatchInteraction;
});