define([
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/AssociateInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(commonRenderer, helper, _, __){

    var ResponseWidget = {
        create : function(widget, responseMappingMode){

            var interaction = widget.element;

            commonRenderer.restore(interaction);

            if(responseMappingMode){
                helper.appendInstruction(widget.element, __('Please define association pairs and their scores below.'));
                interaction.responseMappingMode = true;
            }else{
                helper.appendInstruction(widget.element, __('Please define the correct association pairs below.'));
            }

            commonRenderer.render(interaction);
        },
        setResponse : function(interaction, response){
        
            commonRenderer.setResponse(interaction, this.formatResponse(response));
        },
        destroy : function(widget){

            var interaction = widget.element;

            commonRenderer.restore(interaction);

            delete interaction.responseMappingMode;

            commonRenderer.renderEmptyPairs(interaction);
        },
        getResponseSummary : function(responseDeclaration){
            
            var pairs = [],
                correctResponse = _.values(responseDeclaration.getCorrect()),
                mapEntries = responseDeclaration.getMapEntries();
            
            _.each(correctResponse, function(pair) {

                var sortedIdPair = pair.split(' ').sort(),
                    sortedIdPairKey = sortedIdPair.join(' ');

                pairs[sortedIdPairKey] = {
                    pair: sortedIdPair,
                    correct: true,
                    score: undefined
                };
            });

            _.forIn(mapEntries, function(score, pair) {

                var sortedIdPair = pair.split(' ').sort(),
                    sortedIdPairKey = sortedIdPair.join(' ');

                if (!pairs[sortedIdPairKey]) {
                    pairs[sortedIdPairKey] = {
                        pair: sortedIdPair,
                        correct: false,
                        score: score
                    };
                } else {
                    pairs[sortedIdPairKey].score = score;
                }
            });
            
            return pairs;
        },
        formatResponse : function(response){

            var formatedRes = {list : {pair : []}};

            _.each(response, function(pairString){
                var pair = pairString.split(' ');
                formatedRes.list.pair.push(pair);
            });

            return formatedRes;
        },
        unformatResponse : function(formatedResponse){

            var res = [];

            if(formatedResponse.list && formatedResponse.list.pair){
                _.each(formatedResponse.list.pair, function(pair){
                    res.push(pair.join(' '));
                });
            }else if(formatedResponse.base && formatedResponse.base.pair){
                res.push(formatedResponse.base.pair.join(' '));
            }
            return res;
        }
    };

    return ResponseWidget;
});