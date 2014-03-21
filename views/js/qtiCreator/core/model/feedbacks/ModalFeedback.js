define([
    'lodash',
    'taoQtiItemCreator/core/model/mixin/editable',
    'taoQtiItem/core/feedbacks/ModalFeedback'
], function(_,editable,ModalFeedback){
    
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        
    });
    
    return ModalFeedback.extend(methods);
});