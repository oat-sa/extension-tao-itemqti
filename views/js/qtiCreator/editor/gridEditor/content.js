define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/gridEditor/resizable'
], function($, _, resizable){

    var contentHelper = {};

    /**
     * Get html string content foe a qti container
     * 
     * @param {string|domelement|jquery} element
     * @returns {string}
     */
    contentHelper.getContent = function(element){
        
        var $body = $('<div>', {'class' : 'col-fictive content-helper-wrapper'}).append($(element).clone());

        contentHelper.destroyGridWidgets($body);

        contentHelper.serializeElements($body);

        return $body.html();
    };

    contentHelper.getChangeCallback = function(container){

        return _.throttle(function(data){

            container.body(contentHelper.getContent(data));

        }, 800);
    };

    contentHelper.serializeElements = function($el){

        var existingElements = [];

        $el.find('.widget-box').each(function(){

            var $qtiElementWidget = $(this);

            if($qtiElementWidget.data('serial')){

                //an existing qti element:
                var serial = $qtiElementWidget.data('serial');
                $qtiElementWidget.replaceWith('{{' + serial + '}}');
                existingElements.push(serial);

            }else if($qtiElementWidget.data('new') && $qtiElementWidget.data('qti-class')){

                //a newly inserted qti element
                var qtiClass = $qtiElementWidget.data('qti-class');
                $qtiElementWidget.replaceWith('{{' + qtiClass + ':new}}');
            }else{

                throw 'unknown qti-widget type';
            }

        });

        return existingElements;
    };

    contentHelper.destroyGridWidgets = function($elt){

        $elt.removeData('qti-grid-options');

        $elt.find('.grid-row, [class*=" col-"], [class^="col-"]')
            .removeAttr('style')
            .removeAttr('data-active')
            .removeAttr('data-units');

        $elt.children('.ui-draggable-dragging').remove();

        resizable.destroy($elt);

    };

    return contentHelper;
});