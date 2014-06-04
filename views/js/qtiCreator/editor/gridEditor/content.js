define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/gridEditor/resizable'
], function($, _, resizable){

    var contentHelper = {};

    /**
     * Get html string content for a qti container
     * 
     * @param {string|domelement|jquery} element
     * @returns {string}
     */
    contentHelper.getContent = function(element, opts){

        var options = _.defaults({
            inner : true
        }, opts);

        var $body = options.inner ? $(element).clone() : $('<div>', {'class' : 'col-fictive content-helper-wrapper'}).append($(element).clone());

        contentHelper.destroyGridWidgets($body, true);//working on clone only, so destroyGridWidgetsClone

        contentHelper.serializeElements($body);

        return $body.html();
    };
    
    var _htmlEncode = function(encodedStr){

        var returnValue = '';

        if(encodedStr){
            
            //<br...> are replaced by <br... />
            returnValue = encodedStr;
            returnValue = returnValue.replace(/<br([^>]*)?>/ig, '<br />');
            returnValue = returnValue.replace(/<hr([^>]*)?>/ig, '<hr />');

            //<img...> are replaced by <img... />
            returnValue = returnValue.replace(/(<img([^>]*)?\s?[^\/]>)+/ig,
                function($0, $1){
                    return $0.replace('>', ' />');
                });
        }

        return returnValue;
    };
    
    /**
     * Create a callback function for the ck edit:
     * 
     * @param {object} container
     */
    contentHelper.getChangeCallback = function(container){

        return _.throttle(function(data){

            var $pseudoContainer = $('<div>').html(data),
                newBody = _htmlEncode(contentHelper.getContent($pseudoContainer));

            console.log(container);

            container.body(newBody);

        }, 800);
    };

    contentHelper.serializeElements = function($el){

        var existingElements = [];

        //select only the first level of ".widget-box" found
        $el.find('.widget-box:not(.widget-box *)').each(function(){

            var $qtiElementWidget = $(this);

            if($qtiElementWidget.data('serial')){

                //an existing qti element:
                var serial = $qtiElementWidget.data('serial');
                $qtiElementWidget.replaceWith('{{' + serial + '}}');

                //store existing element
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

    contentHelper.destroyGridWidgets = function($elt, inClone){

        $elt.removeData('qti-grid-options');

        $elt.find('.grid-row, [class*=" col-"], [class^="col-"]')
            .removeAttr('style')
            .removeAttr('data-active')
            .removeAttr('data-units');

        $elt.children('.ui-draggable-dragging').remove();

        resizable.destroy($elt, inClone);
    };

    return contentHelper;
});