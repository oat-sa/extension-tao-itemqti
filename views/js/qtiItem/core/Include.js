define([
    'taoQtiItem/qtiItem/core/Element',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'taoQtiItem/qtiItem/mixin/Container'
], function(Element, _, rendererConfig, Container){
    
    var Include = Element.extend({
        qtiClass : 'include',
        defaultNsName : 'xi',
        defaultNsUri : 'http://www.w3.org/2001/XInclude',
        isEmpty : function(){
            return (!this.attr('href'));
        }
    });
    Container.augment(Include);
    return Include;
});
