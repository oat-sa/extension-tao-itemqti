define(['taoQtiItem/qtiItem/core/Element', 'lodash', 'jquery'], function(Element, _, $){

    var _removeChoiceFromResponse = function(response, choice){

        var escapedIdentifier = choice.id().replace(/([.-])/g, '\\$1'),
            regex = new RegExp('([^a-z_\-\d\.]*)(' + escapedIdentifier + ')([^a-z_\-\d\.]*)');

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

    var removeSelf = function(element){

        var removed = false,
            item = element.getRelatedItem();

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
                    Element.unsetElement(element.serial);
                    $(document).off('.' + element.serial);
                    $(document).trigger('deleted.qti-widget', {element : element, parent : parent});
                }
            }
        }

        return removed;
    };

    var removeElement = function(element, containerPropName, eltToBeRemoved){

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

            //system properties, for item creator internal use only
            this.meta = {};

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
                return removeSelf(this);
            }else if(arguments.length === 2){
                return removeElement(this, arguments[0], arguments[1]);
            }else{
                throw 'invalid number of argument given';
            }
        },
        setMeta : function(key, value){
            this.meta[key] = value;
        },
        getMeta : function(key){
            return this.meta[key];
        }
    };

    return methods;
});