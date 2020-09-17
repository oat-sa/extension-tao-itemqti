define(['taoQtiItem/qtiRunner/core/Renderer', 'taoQtiItem/qtiXmlRenderer/renderers/scoreconfig'], function(Renderer, config){
    'use strict';

    return Renderer.build(config.locations, config.name, config.options);
});
