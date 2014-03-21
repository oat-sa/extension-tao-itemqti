define(['tpl!taoQtiCommonRenderer/tpl/item', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'assessmentItem',
        template : tpl,
        getContainer : Helper.getContainer
    };
});