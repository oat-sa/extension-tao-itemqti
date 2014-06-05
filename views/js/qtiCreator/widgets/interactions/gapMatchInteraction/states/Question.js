define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/containerInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create',
    'lodash'
], function(stateFactory, Question, formElement, formTpl, gapTpl, _){

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function(){

        //ensure that the cardinality of the interaction response is consistent with thte number of gaps
        this.syncCardinality();

    }, function(){

    });

    GapMatchInteractionStateQuestion.prototype.syncCardinality = function(){

        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration();

        var updateCardinality = function(data){

            var cardinality,
                choice = data.element || data.choice;

            if(choice.qtiClass === 'gap'){
                cardinality = _.size(interaction.getGaps()) === 1 ? 'single' : 'multiple';
                response.attr('cardinality', cardinality);
            }
        };

        this.widget
            .on('elementCreated', updateCardinality)
            .on('deleted', updateCardinality);
    };

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

    GapMatchInteractionStateQuestion.prototype.getGapModel = function(){

        return {
            toolbarTpl : gapTpl,
            qtiClass : 'gap',
            afterCreate : function(interactionWidget, newHottextWidget, text){
                
                //after the gap is created, delete it
                var choice = interactionWidget.element.createChoice(text);
                interactionWidget.$container.find('.choice-area .add-option').before(choice.render());
                choice.postRender().changeState('question');

            }
        };
    };

    return GapMatchInteractionStateQuestion;
});