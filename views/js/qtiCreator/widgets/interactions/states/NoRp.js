define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/NoRp',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(stateFactory, NoRp, xmlRenderer){
    'use strict';

    return stateFactory.create(NoRp, function initStateNoRp(){
        var interaction = this.widget.element;
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var rpXml = xmlRenderer.render(rp);

        //remove outcome SCORE if there is no response processing
        if(!rpXml.trim()){
            item.removeOutcome('SCORE');
        }

    }, function exitStateNoRp(){
        var interaction = this.widget.element;
        var item = interaction.getRelatedItem();
        var outcomeScore = item.getOutcomeDeclaration('SCORE');
        var rp = item.responseProcessing;
        var rpXml = xmlRenderer.render(rp);

        //create the outcome score if rp required
        if(rpXml && !outcomeScore){
            outcomeScore = item.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }
    });
});
