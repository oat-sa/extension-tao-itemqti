define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/modalFeedback',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'ui/waitForMedia',
    'ui/modal'
], function(_, tpl, Helper){

    'use strict';

    var modalFeedbackRenderer = {
        qtiClass : 'modalFeedback',
        template : tpl,
        getContainer : Helper.getContainer,
        minHeight : 200,
        width : 600,
        render : function(modalFeedback, data){

            data = data || {};

            var $modal = Helper.getContainer(modalFeedback);

            $modal.waitForMedia(function(){

                //when we are sure that media is loaded:
                $modal.on('opened.modal', function(){

                    //set item body height
                    var $itemBody = Helper.getContainer(modalFeedback.getRelatedItem()).children('.qti-itemBody');
                    var requiredHeight = $modal.outerHeight() + parseInt($modal.css('top'));
                    if(requiredHeight > $itemBody.height()){
                        $itemBody.height(requiredHeight);
                    }

                }).on('closed.modal', function(){
                    if(_.isFunction(data.callback)){
                        data.callback.call(this);
                    }
                }).modal({
                    startClosed : false,
                    minHeight : modalFeedbackRenderer.minHeight,
                    width : modalFeedbackRenderer.width
                });
            });

        }
    };

    return modalFeedbackRenderer;
});