define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry'
], function(_, Renderer, ciRegistry){

    var CreatorCustomInteraction = _.clone(Renderer);

    CreatorCustomInteraction.render = function(interaction, options){
        
        var w,
            pciCreator = ciRegistry.getCreator(interaction.typeIdentifier),
            Widget = pciCreator.getWidget(),
            $container = Renderer.getContainer(interaction);
        
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