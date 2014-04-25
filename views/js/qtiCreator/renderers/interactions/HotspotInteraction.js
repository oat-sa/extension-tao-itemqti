define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/Widget'
], function(_, HotspotInteraction, HotspotInteractionWidget){
    
    var CreatorHotspotInteraction = _.clone(HotspotInteraction);

    CreatorHotspotInteraction.render = function(interaction, options){

        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.choiceForm = this.getOption('choiceOptionForm');
        
        return HotspotInteractionWidget.build(
            interaction,
            HotspotInteraction.getContainer(interaction),
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),
            options
        );
    };

    return CreatorHotspotInteraction;
});
