define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/GapMatchInteraction',
    'taoQtiItem/qtiCreator/model/choices/GapText',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/helper/response'
], function(_, Element, editable, editableInteraction, Interaction, Choice, event, responseHelper){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                shuffle : false
            };
        },
        afterCreate : function(){
            this.body('<p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>');
            this.createChoice();//gapMatchInteraction requires at least one gapMatch to be valid http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10307
            this.createResponse({
                baseType : 'directedPair',
                cardinality : 'multiple'
            });
        },
        createChoice : function(text){
        
            var choice = new Choice();

            this.addChoice(choice);

            choice
                .val(text || 'choice #' + _.size(this.getChoices()))
                .buildIdentifier('choice');

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }
            
            event.choiceCreated(choice, this);

            return choice;
        },
        createGap : function(attr, body){

            var choice = new Choice('', attr);

            this.addChoice(choice);
            choice.buildIdentifier('gap');
            choice.body(body);

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }

            event.choiceCreated(choice, this);

            return choice;
        },
        removeChoice : function(gap){
            var serial = '', c;
            
            if(typeof(gap) === 'string'){
                serial = gap;
            }else if(Element.isA(gap, 'gap')){
                serial = gap.serial;
            }
            
            c = this.getBody().getElement(serial);

            if(c){
                //remove choice
                this.getBody().removeElement(c);
                
                //update the response
                responseHelper.removeChoice(this.getResponseDeclaration(), c);
                
                //trigger event
                event.deleted(c, this);
            }
            
            return this;
        }
    });
    return Interaction.extend(methods);
});


