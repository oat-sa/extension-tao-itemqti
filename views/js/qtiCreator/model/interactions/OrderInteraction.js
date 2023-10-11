define([
    'jquery',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/OrderInteraction',
    'taoQtiItem/qtiCreator/model/choices/SimpleChoice'
], function($, editable, editableInteraction, Interaction, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                shuffle : false,
                orientation : 'vertical'
            };
        },
        afterCreate : function(){
            this.createChoice();
            this.createChoice();
            this.createChoice();
            this.createResponse({
                baseType:'identifier',
                cardinality:'ordered'
            });
        },
        createChoice : function(){
            var choice = new Choice();

            this.addChoice(choice);

            var rank = this.getChoices().length;

            choice
                .body('choice' + ' #' + rank)
                .buildIdentifier('choice');

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', {'choice' : choice, 'interaction' : this});

            return choice;
        }
    });
    return Interaction.extend(methods);
});


