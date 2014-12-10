define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/interact'
], function(
    $,
    interact
    ){

    'use strict';

    function getOrigin(rotatable) {
        var $rotatable = $(rotatable),
        // compute origin based on CSS
            tOrigin = $rotatable.css('transform-origin')
                || $rotatable.css('-webkit-transform-origin')
                || $rotatable.css('-moz-transform-origin')
                || $rotatable.css('-ms-transform-origin')
                || $rotatable.css('-o-transform-origin'),
            defaultOrigin = {
                x: $rotatable.width() / 2,
                y: $rotatable.height() / 2
            },
            i,
            dim;

        if (!tOrigin) {
            return defaultOrigin;
        }

        tOrigin = tOrigin.split(/\s+/);
        if (!tOrigin.length) {
            return defaultOrigin;
        }

        if (tOrigin.length === 1) {
            tOrigin[1] = tOrigin[0];
        }

        i = tOrigin.length;
        while (i--) {
            dim = i === 0 ? 'width' : 'height';
            switch (tOrigin[i]) {
                case 'left':
                    tOrigin[i] = 0;
                    break;
                case 'center':
                    tOrigin[i] = $rotatable[dim]() / 2;
                    break;
                case 'right':
                case 'bottom':
                    tOrigin[i] = $rotatable[dim]();
                    break;
                case 'top':
                    tOrigin[i] = 0;
                    break;
            }
            tOrigin[i] = parseFloat(tOrigin[i]);
        }
        return {
            x: tOrigin[0],
            y: tOrigin[1]
        };

    }

    /**
     * Start rotation, this will work on on mobile and desktop
     * Note: this will work on ONE rotatable only!
     *
     * @param rotatorSelector
     * @param handleSelector
     */
    function init (rotatorSelector, handleSelector) {
        var rotatable = document.querySelectorAll(rotatorSelector),
            handles   = handleSelector ? document.querySelectorAll(handleSelector) : rotatable,
            angle     = 0,
            origin    = getOrigin(rotatable),
            fn = !!interact.supportsTouch() ? 'gesturable' : 'draggable',
            i = handles.length;

        rotatable = rotatable[0];

        while(i--) {
            interact(handles[i])[fn]({
                onmove: function (event) {
                    angle = !!interact.supportsTouch()
                        ? angle + (event.da || 0)
                        : Math.atan2(event.clientX - origin.x, - (event.clientY - origin.y)) * (180 / Math.PI);

                    rotatable.style.webkitTransform = rotatable.style.transform = 'rotate(' + angle + 'deg)';
                }
            });
        }
    }

    return {
        init: init
    }

});
