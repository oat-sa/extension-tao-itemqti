define(['tpl!taoQtiCommonRenderer/tpl/choices/hottext', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'hottext',
        getContainer : Helper.getContainer,
        template : tpl
    };
});