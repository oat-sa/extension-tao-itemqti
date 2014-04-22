define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice',
    'taoQtiItem/qtiItem/core/Element',
    'lodash'
], function(stateFactory, Question, formElement, formTpl, Element, _){

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices')),
            choicesCount : _.size(_widget.element.getChoices())
        }));

        formElement.initWidget($form);
        
        var callbacks = this.getFormChangeCallbacks();
        
        formElement.initDataBinding($form, interaction, callbacks);
    };
    
    ChoiceInteractionStateQuestion.prototype.getFormChangeCallbacks = function(){
        
        var _widget = this.widget,
            $min = this.widget.$form.find('input[name=minChoices]'),
            $max = this.widget.$form.find('input[name=maxChoices]');
        
        var _syncMaxChoices = function(){
            var newOptions = {max : _.size(_widget.element.getChoices())};
            $min.incrementer('options', newOptions).keyup();
            $max.incrementer('options', newOptions).keyup();
        };

        _widget.on('choiceCreated', function(data){
            if(data.interaction.serial === _widget.element.serial){
                _syncMaxChoices();
            }
        }).on('deleted', function(data){
            if(data.parent.serial === _widget.element.serial
                && Element.isA(data.element, 'choice')){
                _syncMaxChoices();
            }
        });
        
        return {
            shuffle : function(interaction, value){
                interaction.attr('shuffle', value);
            },
            minChoices : function(interaction, value, name){

                var newOptions = {min : null};
                
                if(value === ''){
                    interaction.removeAttr(name);
                }else{
                    value = parseInt(value);
                    interaction.attr(name, value);
                    newOptions.min = value;

                    var max = parseInt($max.val());
                    if(max < value){
                        $max.val(value);
                    }
                }

                //set incrementer min value for maxChoices and trigger keyup event to launch validation
                $max.incrementer('options', newOptions).keyup();
            },
            maxChoices : function(interaction, value, name){

                if(value === ''){
                    interaction.removeAttr(name);
                }else{
                    interaction.attr(name, value);
                }

                //set incrementer max value for minChoices
            }
        };
    };

    return ChoiceInteractionStateQuestion;
});