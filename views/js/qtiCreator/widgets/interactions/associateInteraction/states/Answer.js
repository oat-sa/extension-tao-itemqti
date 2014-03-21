define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/states/Answer',
    'taoQtiCommonRenderer/renderers/interactions/AssociateInteraction',
    'taoQtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(stateFactory, Answer, commonRenderer, helper, _, __){

    var AssociateInteractionStateAnswer = stateFactory.clone(Answer);

    AssociateInteractionStateAnswer.prototype.createResponseWidget = function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect());

        helper.appendInstruction(this.widget.element, __('Please define the correct association pairs below.'));

        commonRenderer.render(this.widget.element);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        _widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    };

    AssociateInteractionStateAnswer.prototype.removeResponseWidget = function(){
        commonRenderer.restore(this.widget.element);
        this.widget.$container.off('responseChange.qti-widget');
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