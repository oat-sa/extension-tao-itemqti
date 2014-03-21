define(['tpl!taoQtiCommonRenderer/tpl/interactions/prompt', 'taoQtiCommonRenderer/helpers/Helper'], function(tpl, Helper){
    return {
        qtiClass : 'prompt',
        template : tpl,
        getContainer : Helper.getContainer
    };
});