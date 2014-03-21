define([
    'lodash',
    'taoQtiItem/qtiCreator/core/model/mixin/editable',
    'taoQtiItem/qtiCreator/core/model/mixin/editableContainer',
    'taoQtiItem/qtiItem/core/Item',
    'taoQtiItem/qtiCreator/core/model/ResponseProcessing',
], function(_, editable, editableContainer, Item, ResponseProcessing){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableContainer);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                identifier : 'myItem_1',
                title : 'my item',
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