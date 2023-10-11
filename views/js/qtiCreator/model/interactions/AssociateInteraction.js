define([
    'jquery',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/AssociateInteraction',
    'taoQtiItem/qtiCreator/model/choices/SimpleAssociableChoice'
], function($, editable, editableInteraction, Interaction, Choice){
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                'shuffle' : false,
                'maxAssociations' : 0,
                'minAssociations' : 0
            };
        },
        afterCreate : function(){
            this.createChoice();
            this.createChoice();
            this.createResponse({
                baseType:'pair',
                cardinality:'multiple'
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


