define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/ResponseWidget',
    'lodash',
    'taoQtiItem/qtiItem/helper/interactionHelper',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response'
], function(stateFactory, Map, responseWidget, _, interactionHelper, responseToolbarTpl){

    var AssociateInteractionStateCorrect = stateFactory.create(Map, function(){

        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration();

        responseWidget.create(this.widget, true);

        this.widget.$container.on('responseChange.qti-widget', function(e, data, extraData){

//            response.setCorrect(this.unformatResponse(data.response));
            if(extraData.type === 'added'){
                console.log('manage mapped option here:', extraData.$pair);

                //choice identifier pair:
                var pair = [];
                extraData.$pair.find('div').each(function(){

                    var serial = $(this).data('serial'),
                        choice = interaction.getChoice(serial);

                    pair.push(choice.id());
                });
                pair.sort();

                if(!extraData.$pair.children('.mini-tlb').length){

                    extraData.$pair.append(responseToolbarTpl({
                        interactionSerial : this.widget.element,
                        choiceSerial : 'n/a',
                        choiceIdentifier : pair.join(' ')
                    }));
                }
                
                extraData.$pair.find('[data-role=correct]').data('pair', pair);
                extraData.$pair.find('[data-role=score]').data('pair', pair);
            }
        });

        var pairs = [];
        var correctResponse = _.values(response.getCorrect());
        _.each(correctResponse, function(pair){

            var sortedIdPair = pair.split(' ').sort();
            var sortedIdPairKey = sortedIdPair.join(' ');

            pairs[sortedIdPairKey] = {
                pair : sortedIdPair,
                correct : true,
                score : undefined
            };
        });

        var mapEntries = response.getMapEntries();
        _.forIn(mapEntries, function(score, key){

            var sortedIdPair = key.split(' ').sort();
            var sortedIdPairKey = sortedIdPair.join(' ');

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

        console.log(pairs);

    }, function(){

        this.widget.$container.off('responseChange.qti-widget');

        responseWidget.destroy(this.widget);
    });

    _addResponseToolbar = function($pair){
        $pair.append(responseToolbarTpl({
            
        }));
    };

    return AssociateInteractionStateCorrect;
});