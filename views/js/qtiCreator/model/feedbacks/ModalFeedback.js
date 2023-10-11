define([
    'i18n',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/feedbacks/ModalFeedback'
], function (__, editable, ModalFeedback) {
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                title : __('modal feedback title'),
                showHide : 'show'
            };
        }
    });

    return ModalFeedback.extend(methods);
});
