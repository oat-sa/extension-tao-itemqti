define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/modalFeedback',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'ui/modal'
], function(_, tpl, Helper){

    return {
        qtiClass : 'modalFeedback',
        template : tpl,
        getContainer : Helper.getContainer,
        render:function(modalFeedback, data){
            
            data = data || {};
            
            var $modal = $('#' + modalFeedback.getSerial()).modal();
            
            $modal.on('closed.modal', function(){
               if(_.isFunction(data.callback)){
                   data.callback.call(this);
               }
            });
        }
    };
});