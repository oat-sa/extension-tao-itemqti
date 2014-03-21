define(['tpl!taoQtiCommonRenderer/tpl/choices/choice', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'simpleAssociableChoice.associateInteraction',
        getContainer : Helper.getContainer,
        template : tpl
    };
});