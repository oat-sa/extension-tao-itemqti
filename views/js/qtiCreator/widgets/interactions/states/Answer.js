define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(stateFactory, Answer, answerStateHelper){

    var InteractionStateAnswer = stateFactory.create(Answer, function(){
        
        //add class runtime to display hover style
        this.widget.$container.addClass('runtime');
        
        this.initResponseForm();
        
        this.widget.$responseForm.show();
        
    }, function(){
        
        //remove runtime style
        this.widget.$container.removeClass('runtime');
        
        this.widget.$responseForm.empty().hide();
    });
    
    //default initResponseForm will intialize the common form applicable to most of the interactions
    //some exception might be stringInteractions that require additional baseType selection
    //therfore, in the case of stringInteractions, please overwrite the prototype function with a new implementation
    InteractionStateAnswer.prototype.initResponseForm = function(){
        
        var _widget = this.widget;
        
        answerStateHelper.initResponseForm(_widget);
        
        _widget.on('responseTemplateChange', function(){
            answerStateHelper.forward(_widget);
        });
    };
    
    return InteractionStateAnswer;
});