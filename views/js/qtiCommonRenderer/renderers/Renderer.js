define([
    'taoQtiItem/qtiRunner/core/Renderer',
    'taoQtiItem/qtiCommonRenderer/renderers/config',
    'css!taoQtiItem/../css/qti',
    'css!tao/../css/tao-main-style'
], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});
