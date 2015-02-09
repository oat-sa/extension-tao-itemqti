define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/modalFeedback',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeFinder',
    'ui/waitForMedia',
    'ui/modal'
], function(_, tpl, Helper, sizeFinder){

    'use strict';

    var modalFeedbackRenderer = {
        qtiClass : 'modalFeedback',
        template : tpl,
        getContainer : Helper.getContainer,
        minHeight : 200,
        minWidth : 400,
        maxWidth : 800,
        render : function(modalFeedback, data){

            data = data || {};

            var $modal = Helper.getContainer(modalFeedback);

            $modal.waitForMedia(function(){
                
                //when we are sure that media is loaded:
                sizeFinder.measure($modal, function(size){

                    $modal.modal({
                        startClosed : false,
                        minHeight : Math.max(size.height, modalFeedbackRenderer.minHeight),
                        width : Math.max(Math.min(size.width, modalFeedbackRenderer.maxWidth), modalFeedbackRenderer.minWidth)
                    });

                    //set item body height
                    var $itemBody = Helper.getContainer(modalFeedback.getRelatedItem()).children('.qti-itemBody');
                    if($modal.height() > $itemBody.height()){
                        $itemBody.height($modal.height());
                    }

                    $modal.on('closed.modal', function(){
                        if(_.isFunction(data.callback)){
                            data.callback.call(this);
                        }
                    });
                });
            });

        }
    };

    return modalFeedbackRenderer;
});