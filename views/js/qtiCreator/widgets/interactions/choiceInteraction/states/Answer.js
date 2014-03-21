define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response.title'
], function(stateFactory, Answer, responseToolbarTitleTpl){

    var ChoiceInteractionStateAnswer = stateFactory.extend(Answer);
    
    ChoiceInteractionStateAnswer.prototype.createResponseWidget = function(){
        
        Answer.prototype.createResponseWidget.call(this);
        
        var _widget = this.widget;
        
        //add title to first:
        _widget.$container.find('.qti-choice:first .pseudo-label-box').append(responseToolbarTitleTpl({
            interactionSerial : _widget.serial
        }));
        
        //@todo to be fixed
//        var $correctInput =  _widget.$container.find('[data-role=correct]');
//        _widget.$container.find('.pseudo-label-box').on('click.qti-widget.answer', function(e){
//            e.preventDefault();
//            $correctInput.click();
//        });
    };

    ChoiceInteractionStateAnswer.prototype.removeResponseWidget = function(){
        
        Answer.prototype.removeResponseWidget.call(this);
        
        this.widget.$container.off('.answer');
    };

    return ChoiceInteractionStateAnswer;
});