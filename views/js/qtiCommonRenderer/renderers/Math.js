define(['tpl!taoQtiItem/qtiCommonRenderer/tpl/math', 'taoQtiItem/qtiCommonRenderer/helpers/Helper', 'mathJax'], function(tpl, Helper, MathJax){
    return {
        qtiClass : 'math',
        template : tpl,
        getContainer : Helper.getContainer,
        render : function(math, data){
            var $mathElt = $('#' + math.serial);
            if(typeof(MathJax) !== 'undefined' && MathJax){
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, $mathElt.parent()[0]]);
            }
        }
    };
});