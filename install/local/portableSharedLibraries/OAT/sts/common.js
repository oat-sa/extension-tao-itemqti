define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/interact',
    'OAT/interact-rotate'
], function(
    $,
    _,
    interact,
    rotator
    ){

    'use strict';

    var transformProp;

    interact.maxInteractions(Infinity);

    function init($container) {
        var $tool = $container.find('.sts-container'),
            tool = $tool[0],
            $controls = $container.find('[class*=" sts-handle-"],[class^="sts-handle-"]').not('.sts-handle-move'),
            hasFocus = false,
            handleSelector = (function() {
                var selectors = [];
                $controls.each(function(){
                    var cls = this.className.match(/sts-handle-rotate-[a-z]{1,2}/);
                    if(cls.length){
                        selectors.push('.' + cls[0])
                    }
                });
                return selectors.join(',')
            }());


        $container.removeAttr('style');
        $controls.on('mousedown', function() {
            $controls.not(this).addClass('lurking');
            $(this).addClass('active');
        });
        $container.on('mouseup mouseleave', function() {
            $controls.removeClass('lurking active');
        });
        $container.on('mouseenter', function() {

            hasFocus = true;
            setTimeout(function() {
                // in case we left already
                if(hasFocus){
                    return;
                }
                $controls.hide().removeClass('lurking').fadeIn();
            }, 100);
        });
        $container.on('mouseleave', function() {
            $controls.hide();
            hasFocus = false;
        });

        // init moving
        interact(tool)
            .draggable({ max: Infinity })
            .on('dragstart', function (event) {
                event.interaction.x = parseInt(event.target.getAttribute('data-x'), 10) || 0;
                event.interaction.y = parseInt(event.target.getAttribute('data-y'), 10) || 0;
            })
            .on('dragmove', function (event) {
                event.interaction.x += event.dx;
                event.interaction.y += event.dy;

                if (transformProp) {
                    event.target.style[transformProp] =
                        'translate(' + event.interaction.x + 'px, ' + event.interaction.y + 'px)';
                }
                else {
                    event.target.style.left = event.interaction.x + 'px';
                    event.target.style.top  = event.interaction.y + 'px';
                }
            })
            .on('dragend', function (event) {
                event.target.setAttribute('data-x', event.interaction.x);
                event.target.setAttribute('data-y', event.interaction.y);
            });

        $('.sts-container-controls').hide();

        //rotator.init(tool, handleSelector);
    }


    return {
        init: init
    };

});


