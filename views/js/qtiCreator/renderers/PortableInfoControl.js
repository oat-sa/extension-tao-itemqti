define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/PortableInfoControl',
    'taoQtiItem/qtiCreator/editor/infoControlRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, icRegistry, commonRenderer){
    'use strict';

    var CreatorPortableInfoControl = _.clone(Renderer);

    CreatorPortableInfoControl.render = function render(infoControl, options){

        var pciCreator = icRegistry.getCreator(infoControl.typeIdentifier);
        var renderOptions = {
            runtimeLocations : {}
        };
        renderOptions.runtimeLocations[infoControl.typeIdentifier] = icRegistry.getBaseUrl(infoControl.typeIdentifier);

        //initial rendering:
        Renderer.render.call(commonRenderer.get(), infoControl, renderOptions);

        return pciCreator.getWidget().build(
            infoControl,
            Renderer.getContainer(infoControl),
            this.getOption('bodyElementOptionForm'),
            options
            );
    };

    return CreatorPortableInfoControl;
});
