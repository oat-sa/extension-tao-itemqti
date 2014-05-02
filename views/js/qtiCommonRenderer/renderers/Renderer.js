define([
    'taoQtiItem/qtiRunner/core/Renderer',
    'taoQtiItem/qtiCommonRenderer/renderers/config',
    'css!taoQtiItem_css/qti.css',
    'css!tao_css/tao-main-style.css'
], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});
