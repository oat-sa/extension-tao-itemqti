define(['tpl!taoQtiItem/qtiCommonRenderer/tpl/item', 'taoQtiItem/qtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'assessmentItem',
        template : tpl,
        getContainer : Helper.getContainer
    };
});