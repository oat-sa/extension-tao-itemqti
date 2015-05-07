define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, ciRegistry, commonRenderer){

    var CreatorCustomInteraction = _.clone(Renderer);

    CreatorCustomInteraction.render = function(interaction, options){
        
        var w,
            pciCreator = ciRegistry.getCreator(interaction.typeIdentifier),
            Widget = pciCreator.getWidget(),
            $container = Renderer.getContainer(interaction);
        
        //initial rendering:
        Renderer.render.call(commonRenderer.get(), interaction, {baseUrl : ciRegistry.getBaseUrl(interaction.typeIdentifier)});
        
        w =  Widget.build(
            interaction,
            $container,
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),
            options
            );
        
        w.changeState('question');//trigger rendering of inner elements
        w.changeState('sleep');//restore default state "sleep"
        
        return w;
    };

    return CreatorCustomInteraction;
});