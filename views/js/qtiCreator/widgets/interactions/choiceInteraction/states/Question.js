define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice'
], function(stateFactory, Question, formElement, formTpl){

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices'))
        }));
        
        formElement.initWidget($form);
        
        var $min = $form.find('input[name=minChoices]');
        var $max = $form.find('input[name=maxChoices]');
        
        formElement.initDataBinding($form, interaction, {
            shuffle:function(interaction, value){
                
                interaction.attr('shuffle', value);
                
                //need to refind them each time in case new choices have been added
                var $choiceShuffleButtons = _widget.$container.find('[data-role="shuffle-pin"]');
                if(value){
                    $choiceShuffleButtons.show();
                }else{
                    $choiceShuffleButtons.hide();
                }
            },
            minChoices:function(interaction, value, name){
                
                if(value === ''){
                    interaction.removeAttr(name);
                }else{
                    interaction.attr(name, value);
                }
                
                //set incrementer min value for maxChoices
            },
            maxChoices:function(interaction, value, name){
                
                if(value === ''){
                    interaction.removeAttr(name);
                }else{
                    interaction.attr(name, value);
                }
                
                 //set incrementer max value for minChoices
            }
        });
    };
    
    return ChoiceInteractionStateQuestion;
});