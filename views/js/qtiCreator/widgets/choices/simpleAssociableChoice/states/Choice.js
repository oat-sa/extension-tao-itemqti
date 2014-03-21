define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/simpleAssociableChoice',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function(stateFactory, Choice, formTpl, formElement){

    var SimpleAssociableChoiceStateChoice = stateFactory.extend(Choice);

    SimpleAssociableChoiceStateChoice.prototype.addOptionForm = function(){
        
        var _widget = this.widget;
        
        //build form:
        _widget.$form.html(formTpl({
            identifier:_widget.element.id()
        }));
        
        formElement.initIdentifier(_widget);
        //init range slider:
    };
    
    return SimpleAssociableChoiceStateChoice;
});