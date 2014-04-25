define(['tpl!taoQtiItem/qtiCommonRenderer/tpl/math', 'taoQtiItem/qtiCommonRenderer/helpers/Helper', 'mathJax'], function(tpl, Helper, MathJax){
    return {
        qtiClass : 'math',
        template : tpl,
        getContainer : Helper.getContainer,
        render : function(math, data){
            if(typeof(MathJax) !== 'undefined' && MathJax){
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, Helper.getContainer(math).parent()[0]]);
            }
        }
    };
});