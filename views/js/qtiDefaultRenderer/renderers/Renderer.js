define(['taoQtiItem/qtiRunner/core/Renderer', 'taoQtiItem/qtiDefaultRenderer/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});