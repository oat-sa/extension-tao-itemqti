define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/mediaInteraction'
], function(_, MediaInteraction, MediaInteractionWidget, tpl){
    
    var MediaInteraction = _.clone(MediaInteraction);

    MediaInteraction.template = tpl;
    
    MediaInteraction.render = function(interaction, options){
        
        var defAtt = interaction.getDefaultAttributes();
        _.extend(interaction.attributes, defAtt);
        delete interaction.attributes.media;
        _.extend(interaction.object.attributes, defAtt.media);

        //MediaInteraction.theRender(interaction, true);
        
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