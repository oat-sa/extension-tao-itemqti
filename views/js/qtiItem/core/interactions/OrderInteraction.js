define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(BlockInteraction, responseHelper, _){
    'use strict';
    var OrderInteraction = BlockInteraction.extend({
        qtiClass : 'orderInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var maxChoice = parseInt(this.attr('maxChoices'));
            var responseDeclaration = this.getResponseDeclaration();
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
        }
    });
    return OrderInteraction;
});