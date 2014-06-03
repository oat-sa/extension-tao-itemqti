define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch'
], function(stateFactory, Question, formElement, formTpl){

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question);

    GapMatchInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle')
        }));

        formElement.initWidget($form);
        
        formElement.initDataBinding($form, interaction, {
            shuffle : formElement.getAttributeChangeCallback()
        });
        
    };

    return GapMatchInteractionStateQuestion;
});
