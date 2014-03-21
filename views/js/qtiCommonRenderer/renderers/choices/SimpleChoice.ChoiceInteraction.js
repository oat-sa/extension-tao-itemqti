define(['tpl!taoQtiCommonRenderer/tpl/choices/simpleChoice.choiceInteraction', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'simpleChoice.choiceInteraction',
        getContainer : Helper.getContainer,
        template : tpl
    };
});