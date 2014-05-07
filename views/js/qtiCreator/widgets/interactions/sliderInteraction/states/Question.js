define([
'taoQtiItem/qtiCreator/widgets/states/factory',
'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
'taoQtiItem/qtiCreator/widgets/helpers/formElement',
'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/slider'
], function(stateFactory, Question, formElement, formTpl){
    var SliderInteractionStateQuestion = stateFactory.extend(Question);
    SliderInteractionStateQuestion.prototype.initForm = function(){
        var _widget = this.widget,
        $form = _widget.$form,
        interaction = _widget.element;

        $form.html(formTpl({
            // tpl data for the interaction
            lowerBound : parseFloat(interaction.attr('lowerBound')),
            upperBound : parseFloat(interaction.attr('upperBound')),
            orientation : interaction.attr('orientation'),
            reverse : !!interaction.attr('reverse'),
            step : parseInt(interaction.attr('step')),
            stepLabel : interaction.attr('stepLabel')
        }));
        
        formElement.initWidget($form);
        //  init data change callbacks
        var callbacks = {};
        callbacks['lowerBound'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
            console.log(attrValue);
        };
        callbacks['upperBound'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
        };
        callbacks['orientation'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
        };
        callbacks['reverse'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
        };
        callbacks['step'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
        };
        callbacks['stepLabel'] = function(interaction, attrValue, attrName){
            interaction.attr(attrName, attrValue);
        };
        
        formElement.initDataBinding($form, interaction, callbacks);
    };
    return SliderInteractionStateQuestion;
});