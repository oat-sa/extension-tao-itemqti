define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/simpleAssociableChoice',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier'
], function(stateFactory, Choice, formTpl, formElement, identifierHelper){
    
    var SimpleAssociableChoiceStateChoice = stateFactory.extend(Choice);

    SimpleAssociableChoiceStateChoice.prototype.initForm = function(){
        
        var _widget = this.widget,
            $form = _widget.$form;
        
        //build form:
        $form.html(formTpl({
            serial:_widget.element.getSerial(),
            identifier:_widget.element.id()
        }));
        
        formElement.initWidget($form);
        
        //init data validation and binding
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'matchMin', 'matchMax');
        callbacks['identifier'] = identifierHelper.updateChoiceIdentifier;
        formElement.initDataBinding($form, _widget.element, callbacks);
    };
    
    return SimpleAssociableChoiceStateChoice;
});