define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/helper/event'
], function(_, $, Element, event){

    var _removeSelf = function(element){
        
        var removed = false,
            item = element.getRelatedItem();

        if(item){
            
            var found = item.find(element.getSerial());
            if(found){
                
                var parent = found.parent;
                if(Element.isA(parent, 'interaction') && Element.isA(element, 'choice')){
                    parent.removeChoice(element);
                    removed = true;
                }else if(typeof parent.initContainer === 'function' && found.location === 'body'){
                    parent.getBody().removeElement(element);
                    removed = true;
                }

                if(removed){
                    event.deleted(element, parent);
                }
            }
        }else{
            throw 'no related item found';
        }

        return removed;
    };
    
    var _removeElement = function(element, containerPropName, eltToBeRemoved){

        if(element[containerPropName]){
            var serial = '';
            if(typeof(eltToBeRemoved) === 'string'){
                serial = eltToBeRemoved;
            }else if(eltToBeRemoved instanceof Element){
                serial = eltToBeRemoved.getSerial();
            }
            if(serial){
                delete element[containerPropName][serial];
                Element.unsetElement(serial);
            }
        }

        return element;
    };
    
    var methods = {
        init : function(serial, attributes){

            //init call in the format init(attributes)
            if(typeof(serial) === 'object'){
                attributes = serial;
                serial = '';
            }

            var attr = {};

            if(_.isFunction(this.getDefaultAttributes)){
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
            if(arguments.length === 0){
                return _removeSelf(this);
            }else if(arguments.length === 2){
                return _removeElement(this, arguments[0], arguments[1]);
            }else{
                throw 'invalid number of argument given';
            }
        }        
    };

    return methods;
});