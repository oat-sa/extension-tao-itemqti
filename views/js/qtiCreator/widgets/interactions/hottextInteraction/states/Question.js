define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hottext'
], function(stateFactory, Question, formElement, formTpl){

    var HottextInteractionStateQuestion = stateFactory.extend(Question);

    HottextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            matchMin : interaction.attr('matchMin'),
            matchMax : interaction.attr('matchMax')
        }));

        formElement.initWidget($form);
        
        var callbacks = formElement.getMinMaxAttributeCallbacks($form, 'matchMin', 'matchMax', true);
        formElement.initDataBinding($form, interaction, callbacks);
        
    };

    return HottextInteractionStateQuestion;
});
