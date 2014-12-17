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

    interact.maxInteractions(Infinity);

    function setupControls($container, $controls) {

        var hasFocus = false;


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
    }

    function init($container) {
        // this needs to be a single DOM element
        var tool = $container.find('.sts-container')[0],
            $content = $container.find('.sts-content'),
            $controls = $container.find('[class*=" sts-handle-"],[class^="sts-handle-"]').not('.sts-handle-move'),
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

        // set up the controls for resize, rotate etc.
        setupControls($container, $controls);

        $content.on('mousedown', function() {
            this.style.cursor = 'move';
        }).on('mouseup', function() {
            this.style.cursor = 'default';
        });

        // init moving
        interact(tool)
            .draggable({ max: Infinity })
            .on('dragstart', function (event) {
                var $el = $(event.target);
                event.interaction.x = parseInt($el.css('left'), 10) || 0;
                event.interaction.y = parseInt($el.css('top'), 10) || 0;
            })
            .on('dragmove', function (event) {
                event.interaction.x += event.dx;
                event.interaction.y += event.dy;
                event.target.style.left = event.interaction.x + 'px';
                event.target.style.top  = event.interaction.y + 'px';
            });

        rotator.init(tool, handleSelector);
    }


    return {
        init: init
    };

});





