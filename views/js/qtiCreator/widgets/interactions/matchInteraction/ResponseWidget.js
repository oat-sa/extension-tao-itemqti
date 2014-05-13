define([
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(commonRenderer, helper, _, __){

    var ResponseWidget = {
        create : function(widget, responseMappingMode){

            var interaction = widget.element;

            commonRenderer.destroy(interaction);

            if(responseMappingMode){
                helper.appendInstruction(widget.element, __('Please define the correct response and the score below.'));
                interaction.responseMappingMode = true;
            }else{
                helper.appendInstruction(widget.element, __('Please define the correct response below.'));
            }

            commonRenderer.render(interaction);

            widget.$container.find('table.matrix input[type=checkbox]')
                .removeProp('disabled')
                .attr('data-edit', 'correct')
                .attr('data-role', 'correct');
        },
        setResponse : function(interaction, response){
            
            commonRenderer.setResponse(interaction, this.formatResponse(response));
        },
        destroy : function(widget){

            var interaction = widget.element;

            commonRenderer.destroy(interaction);

            delete interaction.responseMappingMode;

            widget.$container.find('table.matrix input[type=checkbox]').prop('disabled', 'disabled');
        },
        getResponseSummary : function(responseDeclaration){

            var pairs = [],
                correctResponse = _.values(responseDeclaration.getCorrect()),
                mapEntries = responseDeclaration.getMapEntries();

            _.each(correctResponse, function(pair){

                var sortedIdPair = pair.split(' ').sort(),
                    sortedIdPairKey = sortedIdPair.join(' ');

                pairs[sortedIdPairKey] = {
                    pair : sortedIdPair,
                    correct : true,
                    score : undefined
                };
            });

            _.forIn(mapEntries, function(score, pair){

                var sortedIdPair = pair.split(' ').sort(),
                    sortedIdPairKey = sortedIdPair.join(' ');

                if(!pairs[sortedIdPairKey]){
                    pairs[sortedIdPairKey] = {
                        pair : sortedIdPair,
                        correct : false,
                        score : score
                    };
                }else{
                    pairs[sortedIdPairKey].score = score;
                }
            });

            return pairs;
        },
        formatResponse : function(response){

            var formatedRes = {list : {directedPair : []}};
            if(_.size(response) === 1){
                var pair = _.values(response).pop().split(' ');
                formatedRes = {base : {directedPair : pair}};
            }else{
                formatedRes = {list : {directedPair : []}};
                _.each(response, function(pairString){
                    var pair = pairString.split(' ');
                    formatedRes.list.directedPair.push(pair);
                });
            }
            return formatedRes;
        },
        unformatResponse : function(formatedResponse){

            var res = [];

            if(formatedResponse.list && formatedResponse.list.directedPair){
                _.each(formatedResponse.list.directedPair, function(pair){
                    res.push(pair.join(' '));
                });
            }else if(formatedResponse.base && formatedResponse.base.directedPair){
                res.push(formatedResponse.base.directedPair.join(' '));
            }
            return res;
        }
    };

    return ResponseWidget;
});