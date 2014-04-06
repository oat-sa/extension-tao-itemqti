define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableContainer',
    'taoQtiItem/qtiItem/core/Item',
    'taoQtiItem/qtiCreator/model/ResponseProcessing',
], function(_, editable, editableContainer, Item, ResponseProcessing){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableContainer);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                identifier : 'myItem_1',
                title : 'Item title',
                adaptive : false,
                timeDependent : false
            };
        },
        createResponseProcessing : function(){
            var rp = new ResponseProcessing();
            rp.processingType = 'templateDriven';
            this.setResponseProcessing(rp);
            return rp;
        }
    });
    return Item.extend(methods);
});