define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/helpers/content'
], function(stateFactory, Answer, answerStateHelper, contentHelper){
    'use strict';

    var InteractionStateAnswer = stateFactory.create(Answer, function initInteractionStateAnswer(){

        //add class runtime to display hover style
        this.widget.$container.addClass('runtime');

        this.initResponseForm();

        answerStateHelper.forward(this.widget);

        this.widget.$responseForm.show();

        contentHelper.changeInnerWidgetState(this.widget, 'inactive');

    }, function exitInteractionStateAnswer(){

        //remove runtime style
        this.widget.$container.removeClass('runtime');

        this.widget.$responseForm.empty().hide();
        
        contentHelper.changeInnerWidgetState(this.widget, 'sleep');
    });

    //default initResponseForm will intialize the common form applicable to most of the interactions
    //some exception might be stringInteractions that require additional baseType selection
    //therfore, in the case of stringInteractions, please overwrite the prototype function with a new implementation
    InteractionStateAnswer.prototype.initResponseForm = function initResponseForm(){
        answerStateHelper.initResponseForm(this.widget);
    };

    return InteractionStateAnswer;
});