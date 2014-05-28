define([
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/item',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/itemStylesheetHandler'
], function(tpl, Helper, itemStylesheetHandler){
    return {
        qtiClass : 'assessmentItem',
        template : tpl,
        getContainer : Helper.getContainer,
        render: function(item) {
            itemStylesheetHandler.attach(item.stylesheets);
        }
    };
});