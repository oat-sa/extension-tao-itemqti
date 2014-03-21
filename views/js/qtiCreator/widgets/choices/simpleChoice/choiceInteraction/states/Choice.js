define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItemCreator/tpl/forms/choices/choice',
    'taoQtiItemCreator/widgets/helpers/formElement'
], function(stateFactory, Choice, formTpl, formElement){
    
    var SimpleChoiceStateChoice = stateFactory.clone(Choice);

    SimpleChoiceStateChoice.prototype.addOptionForm = function(){
        
        var _widget = this.widget;
        
        //build form:
        _widget.$form.html(formTpl({
            identifier:_widget.element.id()
        }));
        
        formElement.initChoiceIdentifier(_widget);
    };
    
    return SimpleChoiceStateChoice;
});