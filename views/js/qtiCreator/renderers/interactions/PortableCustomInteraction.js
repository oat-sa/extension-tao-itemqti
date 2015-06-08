define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, ciRegistry, commonRenderer){
    'use strict';

    var CreatorCustomInteraction = _.clone(Renderer);

    CreatorCustomInteraction.render = function(interaction, options){

        var widget;
        var renderOptions = {
            runtimeLocations : {}
        };
        var pciCreator = ciRegistry.getCreator(interaction.typeIdentifier);
        var $container = Renderer.getContainer(interaction);


        renderOptions.runtimeLocations[interaction.typeIdentifier] = ciRegistry.getBaseUrl(interaction.typeIdentifier);

        //initial rendering:
        Renderer.render.call(commonRenderer.get(), interaction, renderOptions);

        widget =  pciCreator.getWidget().build(
            interaction,
            $container,
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),
            options
        );

        widget.changeState('question');//trigger rendering of inner elements
        widget.changeState('sleep');//restore default state "sleep"

        return widget;
    };

    return CreatorCustomInteraction;
});
