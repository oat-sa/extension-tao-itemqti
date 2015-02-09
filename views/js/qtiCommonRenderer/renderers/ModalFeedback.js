define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/modalFeedback',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeFinder',
    'ui/modal'
], function($, _, tpl, containerHelper, sizeFinder){
    'use strict';

    var modalFeedbackRenderer = {
        qtiClass : 'modalFeedback',
        template : tpl,
        getContainer : containerHelper.get,
        minHeight : 200,
        minWidth : 400,
        maxWidth : 800,
        render : function(modalFeedback, data){

            data = data || {};

            var $modal = $('#' + modalFeedback.getSerial());

            sizeFinder.measure($modal, function(size){
                
                $modal.modal({
                    startClosed : false,
                    minHeight : Math.max(size.height , modalFeedbackRenderer.minHeight),
                    width : Math.max( Math.min(size.width, modalFeedbackRenderer.maxWidth), modalFeedbackRenderer.minWidth)
                });

                $modal.on('closed.modal', function(){
                    if(_.isFunction(data.callback)){
                        data.callback.call(this);
                    }
                });
            });
        }
    };

    return modalFeedbackRenderer;
});