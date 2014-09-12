define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/CustomInteraction.amd',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, ciRegistry, commonRenderer){

    var CreatorCustomInteraction = _.clone(Renderer);

    CreatorCustomInteraction.render = function(interaction, options){

        //initial rendering:
        Renderer.render.call(commonRenderer.get(), interaction, {baseUrl : ciRegistry.getPath(interaction.typeIdentifier)});

        var pciCreator = ciRegistry.getCreator(interaction.typeIdentifier),
            Widget = pciCreator.getWidget();

        return Widget.build(
            interaction,
            Renderer.getContainer(interaction),
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),
            options
            );
    };

    return CreatorCustomInteraction;
});