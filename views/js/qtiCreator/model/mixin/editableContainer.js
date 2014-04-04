define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiCreator/model/qtiClasses'], function(Element, qtiClasses){

    var methods = {
        createElements : function(body, callback){

            var regex = /{{([a-z0-9]*):new}}/ig;
            
            //first pass to get required qti classes, but do not replace
            var required = {};
            body.replace(regex,
                function(original, qtiClass){
                    if(qtiClasses[qtiClass]){
                        required[qtiClass] = qtiClasses[qtiClass];
                    }
                });

            //second pass after requiring classes:
            var _this = this;
            require(_.values(required), function(){

                //register and name all loaded classes:
                var Qti = {};
                for(var i in arguments){
                    Qti[arguments[i].prototype.qtiClass] = arguments[i];
                }
                
                //create new elements
                var newElts = {};
                var newBody = body.replace(regex,
                    function(original, qtiClass){
                        if(Qti[qtiClass]){
                            //create new element
                            var elt = new Qti[qtiClass]();
                            if(_this.getRenderer()){
                                elt.setRenderer(_this.getRenderer());
                            }
                            newElts[elt.getSerial()] = elt;
                            return elt.placeholder();
                        }else{
                            return original;
                        }
                    });
                    
                //insert them:    
                _this.bdy.setElements(newElts, newBody);
                
                //operations after insertions:
                for(var i in newElts){
                    var elt = newElts[i];
                    if(typeof(elt.buildIdentifier) === 'function'){
                        elt.buildIdentifier();
                    }
                    if(typeof(elt.afterCreate) === 'function'){
                        elt.afterCreate();
                    }
                    $(document).trigger('elementCreated.qti-widget', {'parent' : _this, 'element' : elt});
                }
                
                if(typeof(callback) === 'function'){
                    callback.call(_this, newElts);
                }
            });

        }
    };

    return methods;
});