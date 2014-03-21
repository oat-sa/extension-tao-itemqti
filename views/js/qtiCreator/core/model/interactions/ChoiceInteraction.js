define([
    'lodash',
    'taoQtiItemCreator/core/model/mixin/editable',
    'taoQtiItemCreator/core/model/mixin/editableInteraction',
    'taoQtiItem/core/interactions/ChoiceInteraction',
    'taoQtiItemCreator/core/model/choices/SimpleChoice'
], function(_, editable, editableInteraction, Interaction, Choice){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                'shuffle' : false,
                'maxChoice' : 0,
                'minChoice' : 0,
                'orientation' : 'vertical'
            };
        },
        afterCreate : function(){
            this.createChoice();
            this.createChoice();
            this.createChoice();
            this.createResponse();
        },
        createChoice : function(){
            var choice = new Choice();
            
            this.addChoice(choice);

            var rank = _.size(this.getChoices());
            
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


