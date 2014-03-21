define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/AssociateInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(stateFactory, Answer, commonRenderer, helper, _, __){

    var AssociateInteractionStateAnswer = stateFactory.clone(Answer);

    AssociateInteractionStateAnswer.prototype.createResponseWidget = function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect());
        
        commonRenderer.restore(interaction);
        
        helper.appendInstruction(this.widget.element, __('Please define the correct association pairs below.'));
        
        interaction.responseMappingMode = true;
        commonRenderer.render(interaction);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        _widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    };

    AssociateInteractionStateAnswer.prototype.removeResponseWidget = function(){
        
        var interaction = this.widget.element;
        
        this.widget.$container.off('responseChange.qti-widget');
        
        commonRenderer.restore(interaction);
        
        interaction.responseMappingMode = false;
        commonRenderer.renderEmptyPairs(interaction);
    };
    
    var _formatResponse = function(response){
        var formatedRes = {list : {pair : []}};
        _.each(response, function(pairString){
            var pair = pairString.split(' ');
            formatedRes.list.pair.push(pair);
        });
        return formatedRes;
    };

    var _unformatResponse = function(formatedResponse){
        var res = [];
        if(formatedResponse.list && formatedResponse.list.pair){
            _.each(formatedResponse.list.pair, function(pair){
                res.push(pair.join(' '));
            });
        }else if(formatedResponse.base && formatedResponse.base.pair){
            res.push(formatedResponse.base.pair.join(' '));
        }
        return res;
    };
    
    return AssociateInteractionStateAnswer;
});