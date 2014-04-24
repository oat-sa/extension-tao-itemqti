define([
    'taoQtiItem/qtiItem/core/Element', 
    'taoQtiItem/qtiCreator/model/variables/ResponseDeclaration', 
    'taoQtiItem/qtiCreator/model/helper/event'
], function(Element, ResponseDeclaration, event){

    var methods = {
        /**
         * Remove a choice from the interaction
         * 
         * @param {string|choice} choice
         * @returns {object} this
         */
        removeChoice : function(choice){
            var serial = '', c;
            if(typeof(choice) === 'string'){
                serial = choice;
            }else if(Element.isA(choice, 'choice')){
                serial = choice.getSerial();
            }
            if(this.choices[serial]){
                c = this.choices[serial];
                delete this.choices[serial];
                event.deleted(c, this);
            }
            return this;
        },
        createResponse:function(attrs){
            
            var response = new ResponseDeclaration();
            if(attrs){
                response.attr(attrs);
            }
            
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