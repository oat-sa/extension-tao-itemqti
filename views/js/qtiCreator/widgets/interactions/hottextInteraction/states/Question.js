define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/containerInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hottext',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create'
], function($, _, stateFactory, Question, formElement, interactionFormElement, formTpl, hottextTpl){
    'use strict';

    var HottextInteractionStateQuestion = stateFactory.extend(Question);

    HottextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            callbacks;

        $form.html(formTpl({
            maxChoices : interaction.attr('maxChoices'),
            minChoices : interaction.attr('minChoices'),
            choicesCount : _.size(interaction.getChoices())
        }));

        formElement.initWidget($form);

        callbacks = formElement.getMinMaxAttributeCallbacks($form, 'minChoices', 'maxChoices');
        formElement.setChangeCallbacks($form, interaction, callbacks);
        interactionFormElement.syncMaxChoices(_widget);
    };

    HottextInteractionStateQuestion.prototype.getGapModel = function(){

        return {
            toolbarTpl : hottextTpl,
            qtiClass : 'hottext',
            afterCreate : function(interactionWidget, newHottextWidget, $initialContent){
                var allowedInlineStaticElts = ['math'], // todo: try more !
                    $inlineStaticWidgets,
                    interaction = interactionWidget.element,
                    newHottextElt = newHottextWidget.element,
                    newHottextBody;

                // look for nested inlineStatic elements
                $inlineStaticWidgets = $initialContent.find(
                    allowedInlineStaticElts
                        .map(function(qtiClass) {
                            return '.widget-' + qtiClass;
                        })
                        .join(',')
                );

                // update elements hierarchy
                if($inlineStaticWidgets && $inlineStaticWidgets.length > 0) {
                    $inlineStaticWidgets.each(function() {
                        var serial = $(this).data('serial'),
                            elt = interaction.getElement(serial),
                            eltWidget = elt.data('widget');

                        // move element from interaction to hottext element
                        interaction.removeElement(elt);
                        newHottextElt.setElement(elt);

                        // destroy the widget and replace it with a placeholder that will be used for rendering
                        $(this).replaceWith(elt.placeholder());
                        eltWidget.destroy();
                    });
                }
                // strip everything that hasn't been replaced and that is not pure text
                newHottextBody = _.escape($initialContent.text());

                if (newHottextBody.trim() !== '') { // todo: check if we lost any check like this before creating elements
                    // update model and render it
                    newHottextElt.body(newHottextBody);
                    newHottextElt.render(newHottextElt.getContainer());
                    newHottextElt.postRender();

                    // recreate editing widget
                    newHottextWidget.destroy();
                    newHottextWidget = newHottextElt.data('widget');
                    newHottextWidget.changeState('choice');
                }
            }
        };
    };

    return HottextInteractionStateQuestion;
});
