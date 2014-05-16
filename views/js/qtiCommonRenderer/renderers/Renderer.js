define([
    'taoQtiItem/qtiRunner/core/Renderer',
    'taoQtiItem/qtiCommonRenderer/renderers/config',
    'css!taoQtiItem_css/qti',
    'css!tao_css/tao-main-style'// not until fonts are separated
], function(Renderer, config){
    return Renderer.build(config.locations, config.name);
});
