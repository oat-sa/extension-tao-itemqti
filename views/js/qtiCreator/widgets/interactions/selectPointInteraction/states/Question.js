/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeFactory',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeSideBar',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/selectPoint'
], function($, _, GraphicHelper, stateFactory, Question, shapeFactory, shapeEditor, shapeSideBar, formElement, interactionFormElement,  identifierHelper, formTpl){

    
    /**
     * The question state for the selectPoint interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Question
     */
    var SelectPointInteractionStateQuestion = stateFactory.extend(Question);

    /**
     * Initialize the form linked to the interaction
     */
    SelectPointInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices'))
       }));

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices');
        formElement.initDataBinding($form, interaction, callbacks);
        
        interactionFormElement.syncMaxChoices(_widget);
    };

    return SelectPointInteractionStateQuestion;
});
