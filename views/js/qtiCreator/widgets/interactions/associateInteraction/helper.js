define(['taoQtiItem/qtiCreator/helper/adaptSize'], function(adaptSize){
    
    return {
        adaptSize : function(widget){
            adaptSize.height(widget.$container.find('.add-option, .result-area .target, .choice-area .qti-choice'));
        }
    }
});