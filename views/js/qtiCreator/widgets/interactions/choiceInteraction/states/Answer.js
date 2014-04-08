define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/ResponseWidget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response.title'
], function(stateFactory, Answer, responseHelper, ResponseWidget, responseToolbarTitleTpl){

    var ChoiceInteractionStateAnswer = stateFactory.create(Answer, function(){
        
        ResponseWidget.create(this.widget);
        
        var _widget = this.widget;
        
        //add class runtime to display hover style
        _widget.$container.addClass('runtime');
        
        //add title to first:
        _widget.$container.find('.qti-choice:first .pseudo-label-box').append(responseToolbarTitleTpl({
            interactionSerial : _widget.serial
        }));
        
        _widget.$container.on('click.qti-widget.answer', '.qti-choice', function(e){
            e.stopPropagation();
            $(this).find('[data-role=correct]').click();
        });
        
        //forward to one of the available sub state:
        var response = this.widget.element.getResponseDeclaration();
        if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

            this.widget.changeState('correct');

        }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE')){

            this.widget.changeState('map');
        }
        
    }, function(){
        
        ResponseWidget.destroy(this.widget);
        
        this.widget.$container.removeClass('runtime');
        
        this.widget.$container.off('.answer');
    });

    return ChoiceInteractionStateAnswer;
});