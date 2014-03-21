define(['taoQtiRunner/core/Renderer', 'taoQtiCommonRenderer/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});