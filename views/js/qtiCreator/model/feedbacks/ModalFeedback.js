define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/feedbacks/ModalFeedback'
], function(_,editable,ModalFeedback){
    
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        
    });
    
    return ModalFeedback.extend(methods);
});