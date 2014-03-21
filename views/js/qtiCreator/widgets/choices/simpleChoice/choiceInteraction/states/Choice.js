define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/choice',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
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