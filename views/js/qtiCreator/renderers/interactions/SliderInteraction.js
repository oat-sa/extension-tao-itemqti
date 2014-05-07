define([
'lodash',
'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Widget'
], function(_, SliderInteraction, SliderInteractionWidget){
    var SliderInteraction = _.clone(SliderInteraction);
    
    SliderInteraction.render = function(interaction, options){
        return SliderInteractionWidget.build(
                interaction,
                SliderInteraction.getContainer(interaction),
                this.getOption('interactionOptionForm'),
                this.getOption('responseOptionForm'),
                options
        );
    };
    
    return SliderInteraction;
});