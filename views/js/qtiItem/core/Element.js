define(['class', 'lodash', 'taoQtiItem/qtiItem/helper/util'], function(Class, _, util){

    var _instances = {};

    var Element = Class.extend({
        qtiClass : '',
        serial : '',
        relatedItem : null,
        init : function(serial, attributes){

            //init own attributes
            this.attributes = {};

            //init call in the format init(attributes)
            if(typeof(serial) === 'object'){
                attributes = serial;
                serial = '';
            }

            if(!serial){
                serial = util.buildSerial(this.qtiClass + '_');

            }
            if(serial && (typeof serial !== 'string' || !serial.match(/^[a-z_0-9]*$/i))){
                throw 'invalid QTI serial : (' + (typeof serial) + ') ' + serial;
            }
            if(!_instances[serial]){
                _instances[serial] = this;
                this.serial = serial;
                this.setAttributes(attributes || {});
            }else{
                throw 'a QTI Element with the same serial already exists ' + serial;
            }
            if(typeof this.initContainer === 'function'){
                this.initContainer(arguments[2] || '');
            }
            if(typeof this.initObject === 'function'){
                this.initObject();
            }
        },
        is : function(qtiClass){
            return (qtiClass === this.qtiClass);
        },
        placeholder : function(){
            return '{{' + this.serial + '}}';
        },
        getSerial : function(){
            return this.serial;
        },
        getUsedIdentifiers : function(){
            var usedIds = {};
            var elts = this.getComposingElements();
            for(var i in elts){
                var elt = elts[i];
                var id = elt.attr('identifier');
                if(id){
                    //warning: simplistic implementation, allow only one unique identifier in the item no matter the element class/type
                    usedIds[id] = elt;
                }
            }
            return usedIds;
        },
        attr : function(name, value){
            if(name){
                if(value !== undefined){
                    this.attributes[name] = value;
                }else{
                    if(typeof(name) === 'object'){
                        for(var prop in name){
                            this.attr(prop, name[prop]);
                        }
                    }else if(typeof(name) === 'string'){
                        if(this.attributes[name] === undefined){
                            return null;
                        }else{
                            return this.attributes[name];
                        }
                    }
                }
            }
            return this;
        },
        removeAttr : function(name){
            return this.removeAttributes(name);
        },
        setAttributes : function(attributes){
            this.attributes = attributes;
            return this;
        },
        getAttributes : function(){
            var attrs = {};
            for(var name in this.attributes){
                attrs[name] = this.attributes[name];
            }
            return attrs;
        },
        removeAttributes : function(attrNames){
            if(typeof(attrNames) === 'string'){
                attrNames = [attrNames];
            }
            for(var i in attrNames){
                delete this.attributes[attrNames[i]];
            }
            return this;
        },
        getComposingElements : function(){
            var elts = {};
            if(typeof this.initContainer === 'function'){
                var container = this.getBody();
                elts[container.getSerial()] = container;//pass individual object by ref, instead of the whole list(object)
                elts = _.extend(elts, container.getComposingElements());
            }
            if(typeof this.initObject === 'function'){
                var object = this.getObject();
                elts[object.getSerial()] = object;//pass individual object by ref, instead of the whole list(object)
                elts = _.extend(elts, object.getComposingElements());
            }
            return elts;
        },
        getUsedClasses : function(){
            var ret = [this.qtiClass],
                composingElts = this.getComposingElements();

            _.each(composingElts, function(elt){
                ret.push(elt.qtiClass);
            });

            return _.uniq(ret);
        },
        find : function(serial){
            if(typeof this.initObject === 'function'){
                var object = this.getObject();
                if(object.serial === serial){
                    return {'parent' : this, 'element' : object, 'location' : 'object'};
                }
            }
            if(typeof this.initContainer === 'function'){
                var elts = this.getBody().getElements();
                if(elts[serial]){
                    return {'parent' : this, 'element' : elts[serial], 'location' : 'body'};
                }else{
                    for(var i in elts){
                        var found = elts[i].find(serial);
                        if(found){
                            return found;
                        }
                    }
                }
            }
            return null;
        },
        parent : function(){
            var item = this.getRelatedItem();
            if(item){
                var found = item.find(this.getSerial());
                if(found){
                    return found.parent;
                }
            }
            return null;
        },
        setRelatedItem : function(item, recursive){

            recursive = (typeof recursive === 'undefined') ? true : recursive;

            if(Element.isA(item, 'assessmentItem')){
                this.relatedItem = item;
                var composingElts = this.getComposingElements();
                for(var i in composingElts){
                    composingElts[i].setRelatedItem(item, false);
                }
            }

        },
        getRelatedItem : function(){
            var ret = null;
            if(Element.isA(this.relatedItem, 'assessmentItem')){
                ret = this.relatedItem;
            }
            return ret;
        },
        setRenderer : function(renderer){
            if(renderer && renderer.isRenderer){
                this.renderer = renderer;
                var elts = this.getComposingElements();
                for(var serial in elts){
                    elts[serial].setRenderer(renderer);
                }
            }else{
                throw 'invalid qti rendering engine';
            }
        },
        getRenderer : function(){
            return this.renderer;
        },
        render : function(data, $container, subclassedName, renderer){
            
            renderer = renderer||this.getRenderer();
            
            var tplData = {},
                defaultData = {
                'tag' : this.qtiClass,
                'serial' : this.serial,
                'attributes' : this.attributes
            };

            if(!renderer){
                throw 'render: no renderer found for the element ' + this.qtiClass + ':' + this.serial;
            }

            if(typeof this.initContainer === 'function'){
                defaultData.body = this.getBody().render(renderer);
            }
            if(typeof this.initObject === 'function'){
                defaultData.object = {
                    attributes : this.object.getAttributes()
                };
                //@todo clean this;
                var url = defaultData.object.attributes.data;
                if(typeof(qti_base_www) !== 'undefined'){
                    if(!/^http(s)?:\/\//.test(url)){
                        defaultData.object.attributes.data = qti_base_www + url;
                    }
                }
            }
            
            tplData = _.merge(defaultData, data || {});
            tplData = renderer.getData(this, tplData, subclassedName);
            var rendering = renderer.renderTpl(this, tplData, subclassedName);
            if($container){
                if($container.length && $container.replaceWith){
                    //if is a jquery container
                    $container.replaceWith(rendering);
                }else{
                    throw 'invalid jQuery container in arg';
                }
            }

            return rendering;
        },
        postRender : function(data, altClassName, renderer){
            
            renderer = renderer || this.getRenderer();
            
            if(typeof this.initContainer === 'function'){
                //post render body element
                this.getBody().postRender({}, '', renderer);
            }
            
            if(renderer){
                return renderer.postRender(this, data, altClassName);
            }else{
                throw 'postRender: no renderer found for the element ' + this.qtiClass + ':' + this.serial;
            }
        },
        getContainer : function($scope){
            var renderer = this.getRenderer();
            if(renderer){
                return renderer.getContainer(this, $scope);
            }else{
                throw 'getContainer: no renderer found for the element ' + this.qtiClass + ':' + this.serial;
            }
        },
        toArray : function(){
            var arr = {
                serial : this.serial,
                type : this.qtiClass,
                attributes : this.getAttributes()
            };
            
            if(typeof this.initContainer === 'function'){
                arr.body = this.getBody().toArray();
            }
            if(typeof this.initObject === 'function'){
                arr.object = this.object.toArray();
            }

            return arr;
        },
        remove : function(containerPropName, element){
            if(this[containerPropName]){
                var serial = '';
                if(typeof(element) === 'string'){
                    serial = element;
                }else if(element instanceof Element){
                    serial = element.getSerial();
                }
                if(serial){
                    delete this[containerPropName][serial];
                }
            }
            return this;
        }
    });

    //helpers
    Element.isA = function(qtiElement, qtiClass){
        return (qtiElement instanceof Element && qtiElement.is(qtiClass));
    };

    return Element;
});


