define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/Question',
    'tpl!taoQtiItemCreator/tpl/forms/interactions/choice'
], function(stateFactory, Question, formTpl){

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.addOptionForm = function(){

        var _widget = this.widget,
            interaction = _widget.element;

        _widget.$form.html(formTpl({
            shuffle : !!this.widget.element.attr('shuffle')
        }));

        _widget.$form.find('[data-role=shuffle]').on('change', function(){

            var $choiceShuffleButtons = _widget.$container.find('.qti-choice [data-role="shuffle-pin"]');

            if($(this).prop('checked')){
                interaction.attr('shuffle', true);
                $choiceShuffleButtons.show();
            }else{
                interaction.attr('shuffle', false);
                $choiceShuffleButtons.hide();
            }
        });

    };
    
    return ChoiceInteractionStateQuestion;
});