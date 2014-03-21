define(['tpl!taoQtiCommonRenderer/tpl/choices/inlineChoice', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'inlineChoice',
        getContainer : Helper.getContainer,
        template : tpl
    };
});