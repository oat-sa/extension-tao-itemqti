/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 
    'lodash' 
], function($, _){


    /**
     * Creates a popup relative to shape in a paper
     * @param {Raphael.Element} shape - the relative shape
     * @param {jQueryElement} $container - the svg container
     * @returns {jQueryElement} the popup
     */
    return function createPairPopup($container){
        var $element    = $('<div class="mapping-editor arrow-top-left"></div>'); 
        var offset      = $container.offset();
        var width       = $container.innerWidth();
        var height      = $container.innerHeight();

        //style and attach the form
        $element.css({       
            'top'       : height - 50,
            'width'     : width - 100
        }).appendTo($container);


        $container.css({
            'overflow': 'visible',
            'position': 'relative'
        });
        return $element;
    };  
});
