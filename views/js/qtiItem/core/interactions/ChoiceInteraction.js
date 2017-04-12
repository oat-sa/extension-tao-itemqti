define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(BlockInteraction, responseHelper, _){
    'use strict';
    var ChoiceInteraction = BlockInteraction.extend({
        qtiClass : 'choiceInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var maxChoice = parseInt(this.attr('maxChoices'));
            var minChoice = parseInt(this.attr('minChoices'));
            var responseDeclaration = this.getResponseDeclaration();
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
            }else if(template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT') {

                //calculate the maximum reachable score by choice map
                scoreMaps = _.values(responseDeclaration.mapEntries);
                skippableWrongResponse = (minChoice === 0) ? Infinity : minChoice;
                totalAnswerableResponse = (maxChoice === 0) ? Infinity : maxChoice;

                console.log(_(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).sortBy().reverse().take(totalAnswerableResponse).values());

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

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound));
                }
            }
            return max;
        }
    });
    return ChoiceInteraction;
});


