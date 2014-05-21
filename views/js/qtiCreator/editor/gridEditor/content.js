define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/gridEditor/resizable',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/helper/container'
], function($, _, resizable, Element, creatorRenderer, containerHelper){

    var contentHelper = {};

    /**
     * Get html string content foe a qti container
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

    /**
     * Create a callback function for the ck edit:
     * 
     * @param {object} container
     */
    contentHelper.getChangeCallback = function(container){

        return _.throttle(function(data){

            var $pseudoContainer = $('<div>').html(data),
                newBody = contentHelper.getContent($pseudoContainer);

            container.body(newBody);

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

    contentHelper.destroyGridWidgets = function($elt, inClone){

        $elt.removeData('qti-grid-options');

        $elt.find('.grid-row, [class*=" col-"], [class^="col-"]')
            .removeAttr('style')
            .removeAttr('data-active')
            .removeAttr('data-units');

        $elt.children('.ui-draggable-dragging').remove();

        resizable.destroy($elt, inClone);
    };

    contentHelper.createElements = function(container, $container, data, callback){

        var $dummy = $('<div>').html(data);

        containerHelper.createElements(container, contentHelper.getContent($dummy), function(newElts){

            creatorRenderer.get().load(function(){

                for(var serial in newElts){

                    var elt = newElts[serial],
                        $placeholder = $container.find('.widget-box[data-new][data-qti-class=' + elt.qtiClass + ']'),
                        $widget,
                        widget;

                    elt.setRenderer(this);
                    elt.render($placeholder);


                    //render widget
                    widget = elt.postRender();
                    $widget = widget.$original;

                    //inform height modification
                    $widget.trigger('contentChange.gridEdit');

                    //active it right away:
                    callback(widget);
                }

            }, this.getUsedClasses());
        });

    };

    return contentHelper;
});