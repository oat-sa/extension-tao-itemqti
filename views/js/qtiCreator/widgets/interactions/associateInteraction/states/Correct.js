define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct'
], function(stateFactory, Correct){

    var AssociateInteractionStateCorrect = stateFactory.create(Correct, function(){
        this.createResponseWidget();
    }, function(){
        
        this.widget.$container.find('[data-edit="correct"]').hide();
    });
    
    AssociateInteractionStateCorrect.prototype.createResponseWidget = function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect());
        
        commonRenderer.restore(interaction);
        
        helper.appendInstruction(this.widget.element, __('Please define the correct association pairs below.'));
        
        this.widget.element.responseMappingMode = true;
        commonRenderer.render(this.widget.element);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        _widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    };
    
    return AssociateInteractionStateCorrect;
});