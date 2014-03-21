define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Choice'
], function(stateFactory, Choice){

    var SimpleChoiceStateChoice = stateFactory.create(Choice, function(){
        
        var _widget = this.widget;
        
        //focus on the selected choice
        
        //listener to other siblings choice mode
        _widget.beforeStateInit(function(e, element, state){
           if(state.name === 'choice' && element.serial !== _widget.serial){
               _widget.changeState('question');
           } 
        });
        
        //add options form
        this.addOptionForm();

    }, function(){
        
        this.widget.$form.empty();
    });

    SimpleChoiceStateChoice.prototype.addOptionForm = function(){
        stateFactory.throwMissingRequiredImplementationError('addOptionForm');
    };
    
    return SimpleChoiceStateChoice;
});