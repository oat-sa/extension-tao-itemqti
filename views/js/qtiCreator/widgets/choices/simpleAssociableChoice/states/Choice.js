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
            $form = _widget.$form,
            choice = _widget.element;

        //build form:
        $form.html(formTpl({
            serial : choice.getSerial(),
            identifier : choice.id(),
            matchMin : choice.attr('matchMin'),
            matchMax : choice.attr('matchMax')
        }));

        formElement.initWidget($form);

        //init data validation and binding
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'matchMin', 'matchMax');
        callbacks['identifier'] = identifierHelper.updateChoiceIdentifier;
        formElement.initDataBinding($form, choice, callbacks);
    };

    return SimpleAssociableChoiceStateChoice;
});