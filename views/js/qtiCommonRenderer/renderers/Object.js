define([
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/object',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
], function(tpl, containerHelper){
    return {
        qtiClass : 'object',
        template : tpl,
        getContainer : containerHelper.get,
        render : function(obj){
            //var media = new DefaultRendererObject(obj);
            //media.render();
        }
    };
});
