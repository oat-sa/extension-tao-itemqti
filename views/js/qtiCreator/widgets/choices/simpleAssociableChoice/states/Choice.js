define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItemCreator/tpl/forms/choices/simpleAssociableChoice',
    'taoQtiItemCreator/widgets/choices/helpers/formElement'
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