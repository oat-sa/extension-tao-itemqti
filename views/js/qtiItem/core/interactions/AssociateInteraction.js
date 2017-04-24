define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(BlockInteraction, responseHelper, _){
    'use strict';
    var AssociateInteraction = BlockInteraction.extend({
        qtiClass : 'associateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var responseDeclaration = this.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max;
            var self = this;
            var maxAssoc = parseInt(this.attr('maxAssociations'));
            var minAssoc = parseInt(this.attr('minAssociations'));
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
                        var choice = self.getChoiceByIdentifier(identifier);
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
    });
    return AssociateInteraction;
});


