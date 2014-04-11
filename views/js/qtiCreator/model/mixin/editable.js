define(['taoQtiItem/qtiItem/core/Element', 'lodash', 'jquery'], function(Element, _, $){
    
    var _removeChoiceFromResponse = function(response, choice){
            
        var escapedIdentifier = choice.id().replace(/([.-])/g, '\\$1'),
            regex = new RegExp('([^a-z_\-\d\.]*)('+escapedIdentifier+')([^a-z_\-\d\.]*)');

        for(var i in response.correctResponse){
            if(response.correctResponse[i].match(regex)){
                delete response.correctResponse[i];
            }
        }

        var mapEntries = {};
        _.forIn(response.mapEntries, function(value, mapKey){
            if(!mapKey.match(regex)){
                mapEntries[mapKey] = value;
            }
        });
        response.mapEntries = mapEntries;
    };
    
    var methods = {
        init : function(serial, attributes){
            var attr = {};
            if(typeof(this.getDefaultAttributes) === 'function'){
                _.extend(attr, this.getDefaultAttributes());
            }
            _.extend(attr, attributes);
            this._super(serial, attr);
        },
        attr : function(key, value){
            var ret = this._super(key, value);
            if(key !== undefined && value !== undefined){
                $(document).trigger('attributeChange.qti-widget', {'element' : this, 'key' : key, 'value' : value});
            }
            return ret;
        },
        remove : function(){
            var removed = false, element = this, item = this.getRelatedItem();
            if(item){
                var found = item.find(element.getSerial());
                if(found){
                    var parent = found.parent;

                    if(Element.isA(parent, 'interaction') && Element.isA(element, 'choice')){
                        parent.removeChoice(element);
                        
                        //update the response:
                        _removeChoiceFromResponse(parent.getResponseDeclaration(), element);
                        
                        removed = true;
                    }else if(typeof parent.initContainer === 'function' && found.location === 'body'){
                        parent.getBody().removeElement(element);
                        removed = true;
                    }

                    if(removed){
                        $(document).off('.'+element.serial);
                        $(document).trigger('deleted.qti-widget', {'element' : element});
                    }
                }
            }
        }
    };

    return methods;
});