define(['IMSGlobal/jquery_2_1_1', 'OAT/MathJax', 'qtiCustomInteractionContext'], function($, m, qtiCustomInteractionContext){


    return {
        render : function render($container){
            
            console.log('get def', qtiCustomInteractionContext.getDefined());
            
            $container.find('math').each(function(){
                var $math = $(this);
                $math.wrap($('<span>', {'class' : 'math-renderer'}));
                var $wrap = $math.parent('.math-renderer');
                m.Hub.Queue(["Typeset", m.Hub, $wrap[0]]);
            });

        }
    };
});