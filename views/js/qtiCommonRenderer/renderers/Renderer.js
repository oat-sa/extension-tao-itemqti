define(['taoQtiItem/qtiRunner/core/Renderer', 'taoQtiItem/qtiCommonRenderer/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});