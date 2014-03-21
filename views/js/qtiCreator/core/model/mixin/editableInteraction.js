define(['taoQtiItemCreator/core/model/variables/ResponseDeclaration'], function(ResponseDeclaration){

    var methods = {
        createResponse:function(){
            var response = new ResponseDeclaration();
            
            //we assume in the context of edition, every element is created from the api so alwayd bound to an item:
            this.getRelatedItem().addResponseDeclaration(response);
            
            //assign responseIdentifier only after attaching it to the item to generate a unique id
            response.buildIdentifier('RESPONSE', false);
            response.setTemplate('MATCH_CORRECT');
            this.attr('responseIdentifier', response.id());
            
            return response;
        },
        /**
         * To be called before deleting the interaction
         */
        deleteResponse:function(){
            var response = this.getResponseDeclaration();
            if(response){
                this.getRelatedItem().deleteResponseDeclaration(response);
            }
            this.removeAttr('responseIdentifier');
            return this;
        }
    };

    return methods;
});