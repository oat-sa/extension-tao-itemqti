define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/HottextInteraction',
    'taoQtiItem/qtiCreator/model/choices/Hottext',
    'taoQtiItem/qtiCreator/model/helper/event'
], function(_, Element, editable, editableInteraction, Interaction, Choice, event){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                maxChoices : 1,
                minChoices : 0
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType : 'identifier',
                cardinality : 'single'
            });
        },
        createChoice : function(attr, body){

            var choice = new Choice('', attr);

            this.addChoice(choice);
            choice.buildIdentifier('hotspot');
            choice.body(body);
                
            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }
            
            event.choiceCreated(choice, this);

            return choice;
        },
        removeChoice : function(hottext){
        
            var serial = '', c;
            
            if(typeof(hottext) === 'string'){
                serial = hottext;
            }else if(Element.isA('hottext')){
                serial = hottext.getSerial();
            }
            
            c = this.getBody().getElement(serial);
            if(c){
                this.getBody().removeElement(c);
                event.deleted(c, this);
            }
            
            return this;
        }
    });
    return Interaction.extend(methods);
});