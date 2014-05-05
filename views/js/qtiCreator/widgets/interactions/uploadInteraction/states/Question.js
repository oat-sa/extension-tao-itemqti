define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/upload'
], function(stateFactory, Question, formElement, formTpl){

    var UploadInteractionStateQuestion = stateFactory.extend(Question);

    UploadInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            type : interaction.attr('type')
        }));

        formElement.initWidget($form);

        //init data change callbacks
        formElement.initDataBinding($form, interaction, {
            type : formElement.getAttributeChangeCallback()
        });
    };

    return UploadInteractionStateQuestion;
});