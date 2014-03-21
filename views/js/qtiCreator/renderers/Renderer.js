define(['taoQtiRunner/core/Renderer', 'taoQtiItemCreator/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});