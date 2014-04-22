define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/media'
], function(stateFactory, Question, formElement, formTpl){

    var MediaInteractionStateQuestion = stateFactory.extend(Question);

    MediaInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;
    
        //initialize your form here, you certainly gonna need to modify it:
        
        //append the form to the dom (this part should be almost ok)
        $form.html(formTpl({
            
            //tpl data for the interaction
            autostart : !!interaction.attr('autostart'),
            loop : !!interaction.attr('loop'),
            minPlays : parseInt(interaction.attr('minPlays')),
            maxPlays : parseInt(interaction.attr('maxPlays')),
            
            //tpl data for the "object", this part is going to be reused by the "objectWidget", http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10173
            data:interaction.object.attr('data'),
            type:interaction.object.attr('type'),//use the same as the uploadInteraction, contact jerome@taotesting.com for this
            width:interaction.object.attr('width'),
            height:interaction.object.attr('height')
        }));

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minPlays', 'maxPlays');
        callbacks['autostart'] = formElement.getAttributeChangeCallback();
        callbacks['loop'] = formElement.getAttributeChangeCallback();
        callbacks['data'] = function(interaction, attrValue, attrName){
            //some callback method when the input has been validated
            
            //something like:
            interaction.attr(attrName, attrValue);
        };
        //and so on for the other attributes...
        
        formElement.initDataBinding($form, interaction, callbacks);
    };

    return MediaInteractionStateQuestion;
});