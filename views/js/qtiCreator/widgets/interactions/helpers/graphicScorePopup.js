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
    return function createShapePopups(shape, $container){
        var boxOffset = $container.offset();
        var $shape = $(shape.node);
        var $element = $('<div class="graphic-mapping-editor"></div>'); 
        var offset = $shape.offset();
        var bbox = shape.getBBox();
            
        //style and attach the form
        $element.css({
            'top'       : offset.top - boxOffset.top - 10,
            'left'      : offset.left - boxOffset.left + bbox.width + 10
        }).appendTo($container);

        shape.click(function(){
            $('.graphic-mapping-editor', $container).hide();
            $element.show();
        });
        $container.css('overflow', 'visible');
        return $element;
    };  
});
