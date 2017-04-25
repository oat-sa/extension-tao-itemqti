define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(GraphicInteraction, responseHelper, _){
    'use strict';
    var SelectPointInteraction = GraphicInteraction.extend({
        qtiClass : 'selectPointInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var maxChoice = parseInt(this.attr('maxChoices'));
            var minChoice = parseInt(this.attr('minChoices'));
            var responseDeclaration = this.getResponseDeclaration();
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
            }
            return max;
        }
    });
    return SelectPointInteraction;
});

