define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'tpl!taoQtiItem/qtiCreator/tpl/notifications/widgetOverlay',
    'i18n',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
], function(stateFactory, Custom, overlayTpl, __, xmlRenderer, commonRenderer, instructionMgr){

    var InteractionStateCustom = stateFactory.create(Custom, function(){
        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect());

        commonRenderer.render(this.widget.element);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));
        

        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    }, function(){
        var interaction = this.widget.element;
        var item = interaction.getRootElement();
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

        this.widget.$container.off('responseChange.qti-widget');

        commonRenderer.resetResponse(this.widget.element);

        commonRenderer.destroy(this.widget.element);
    });

    var _formatResponse = function(response){
        return {list : {identifier : response}};
    };

    var _unformatResponse = function(formatedResponse){
        var res = [];
        if(formatedResponse.list && formatedResponse.list.identifier){
            res = formatedResponse.list.identifier;
        }
        return res;
    };

    return InteractionStateCustom;
});
