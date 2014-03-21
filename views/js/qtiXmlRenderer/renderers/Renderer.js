define(['taoQtiRunner/core/Renderer', 'taoQtiXmlRenderer/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});