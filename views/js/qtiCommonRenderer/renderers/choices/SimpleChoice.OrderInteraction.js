define(['tpl!taoQtiCommonRenderer/tpl/choices/choice', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'simpleChoice.orderInteraction',
        getContainer : Helper.getContainer,
        template : tpl
    };
});