define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/Widget'
], function(_, MediaInteraction, MediaInteractionWidget){
    
    var MediaInteraction = _.clone(MediaInteraction);

    MediaInteraction.render = function(interaction, options){
        
        return MediaInteractionWidget.build(
            interaction,
            MediaInteraction.getContainer(interaction),
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),//note : no response required...
            options
        );
    };

    return MediaInteraction;
});