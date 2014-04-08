define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/ResponseWidget',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response.title'
], function(stateFactory, Answer, ResponseWidget, answerStateHelper, responseToolbarTitleTpl){

    var ChoiceInteractionStateAnswer = stateFactory.extend(Answer, function(){
        
        ResponseWidget.create(this.widget);
        
        var _widget = this.widget;
        
        //add title to first:
        _widget.$container.find('.qti-choice:first .pseudo-label-box').append(responseToolbarTitleTpl({
            interactionSerial : _widget.serial
        }));
        
        _widget.$container.on('click.qti-widget.answer', '.qti-choice', function(e){
            e.stopPropagation();
            $(this).find('[data-role=correct]').click();
        });
        
        answerStateHelper.forward(this.widget);
        
    }, function(){
        
        var _widget = this.widget;
        
        _widget.$container.off('.answer');
        
        ResponseWidget.destroy(_widget);
        
        _widget.$responseForm.empty().hide();
    });
    
    return ChoiceInteractionStateAnswer;
});