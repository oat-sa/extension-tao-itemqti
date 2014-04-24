define(['jquery', 'taoQtiItem/qtiItem/core/Element'], function($, Element){

    return {
        choiceCreated : function(choice, interaction){
            $(document).trigger('choiceCreated.qti-widget', {choice : choice, interaction : interaction});
        },
        deleted : function(element, parent){
            Element.unsetElement(element.getSerial());
            $(document).off('.' + element.getSerial());
            $(document).trigger('deleted.qti-widget', {element : element, parent : parent});
        }
    }
});