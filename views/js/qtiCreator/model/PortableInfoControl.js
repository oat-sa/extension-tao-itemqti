define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/helper/portableElement',
    'taoQtiItem/portableElementRegistry/icRegistry',
    'taoQtiItem/qtiItem/core/PortableInfoControl'
], function(editable, portableElement, icRegistry, PortableInfoControl){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, portableElement.getDefaultMethods(icRegistry));//@todo to be adapted with new icRegistry
    Object.assign(methods, {
        getDefaultMarkupTemplateData : function(){
            return {};
        }
    });

    return PortableInfoControl.extend(methods);
});