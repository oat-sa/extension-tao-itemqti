define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/gap',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier'
], function(stateFactory, Choice, formTpl, formElement, identifierHelper){

    var GapStateChoice = stateFactory.extend(Choice, function(){

        //add the toolbar with the delete button

    }, function(){

        //add remove the toolbar
    });

    GapStateChoice.prototype.initForm = function(){

        var $form = this.widget.$form,
            interaction = this.widget.element;

        //build form:
        $form.html(formTpl({
            serial : interaction.getSerial(),
            identifier : interaction.id(),
            required : !!interaction.attr('required')
        }));

        formElement.initWidget($form);

        //init data validation and binding
        formElement.initDataBinding($form, interaction, {
            identifier : identifierHelper.updateChoiceIdentifier,
            required : formElement.getAttributeChangeCallback()
        });
    };

    return GapStateChoice;
});