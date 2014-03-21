define(['tpl!taoQtiItem/qtiCommonRenderer/tpl/choices/simpleChoice.choiceInteraction', 'taoQtiItem/qtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'simpleChoice.choiceInteraction',
        getContainer : Helper.getContainer,
        template : tpl
    };
});