define(['jquery', 'taoQtiItem/qtiCreator/tpl/modalFeedback/popup.tpl', 'ui/modal'], function($, popupTpl){
    
    function ModalFeedback(modalFeedback, $feedbacksContainer){
        
        this.element = modalFeedback;
        this.$feedbacksContainer = $feedbacksContainer;
        
        popupTpl({
            serial:modalFeedback.serial,
            attributes:{
                identifier:modalFeedback.id(),
                title:modalFeedback.attr('title'),
            }
        })
    }
    
});