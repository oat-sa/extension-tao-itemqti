define(['tpl!taoQtiCommonRenderer/tpl/choices/simpleAssociableChoice.matchInteraction', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'simpleAssociableChoice.matchInteraction',
        getContainer : Helper.getContainer,
        template : tpl
    };
});