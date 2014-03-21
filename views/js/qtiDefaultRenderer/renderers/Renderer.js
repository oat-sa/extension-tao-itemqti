define(['taoQtiRunner/core/Renderer', 'taoQtiDefaultRenderer/renderers/config'], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});