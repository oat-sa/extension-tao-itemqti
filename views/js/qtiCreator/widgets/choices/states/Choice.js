define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Choice'
], function(stateFactory, Choice){

    var ChoiceStateChoice = stateFactory.create(Choice, function(){
        
        var _widget = this.widget;
        
        //focus on the selected choice
        
        //listener to other siblings choice mode
        _widget.beforeStateInit(function(e, element, state){
           if(state.name === 'choice' && element.serial !== _widget.serial){
               _widget.changeState('question');
           } 
        });
        
        //add options form
        this.initForm();
        this.widget.$form.show();
        
    }, function(){
        
        //destroy and hide the form
        this.widget.$form.empty().hide();
    });

    ChoiceStateChoice.prototype.initForm = function(){
        stateFactory.throwMissingRequiredImplementationError('initForm');
    };
    
    return ChoiceStateChoice;
});