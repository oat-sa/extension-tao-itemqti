define(['taoQtiItem/qtiItem/core/Element', 'lodash'], function(Element, _){

    var QtiInteraction = Element.extend({
        init : function(serial, attributes){
            this._super(serial, attributes);
            this.choices = [];
        },
        is : function(qtiClass){
            return (qtiClass === 'interaction') || this._super(qtiClass);
        },
        addChoice : function(choice){
            choice.setRelatedItem(this.getRelatedItem() || null);
            this.choices[choice.getSerial()] = choice;
            return this;
        },
        removeChoice : function(choice){
            var serial = '';
            if(typeof(choice) === 'string'){
                serial = choice;
            }else if(Element.isA(choice, 'choice')){
                serial = choice.getSerial();
            }
            delete this.choices[serial];
            return this;
        },
        getChoices : function(){
            var choices = {};
            for(var i in this.choices){//prevent passing the whole array by ref
                choices[i] = this.choices[i];
            }
            return choices;
        },
        getChoice : function(serial){
            var ret = null;
            if(this.choices[serial]){
                ret = this.choices[serial];
            }
            return ret;
        },
        getChoiceByIdentifier : function(identifier){
            _.each(this.choices, function(c){
                if(c.id() === identifier){
                    return c;
                }
            });
        },
        getComposingElements : function(){
            var elts = this._super();
            //recursive to choices:
            for(var serial in this.choices){
                if(Element.isA(this.choices[serial], 'choice')){
                    elts[serial] = this.choices[serial];
                    elts = _.extend(elts, this.choices[serial].getComposingElements());
                }
            }
            return elts;
        },
        find : function(serial){
            var found = this._super(serial);
            if(!found){
                if(this.choices[serial]){
                    found = {'parent' : this, 'element' : this.choices[serial]};
                }
            }
            return found;
        },
        getResponseDeclaration : function(){
            var response = null;
            var responseId = this.attr('responseIdentifier');
            if(responseId){
                var item = this.getRelatedItem();
                if(item){
                    response = item.getResponseDeclaration(responseId);
                }else{
                    throw 'cannot get response of an interaction out of its item context';
                }
            }
            return response;
        },
        /**
         * Render the interaction to the view.
         * The optional argument "subClass" allows distinguishing customInteraction: e.g. customInteraction.matrix, customInteraction.likertScale ...
         */
        render : function(data, $container, subClass){
            var renderer = this.getRenderer(),
                defaultData = {
                    '_type' : this.qtiClass.replace(/([A-Z])/g, function($1){
                        return "_" + $1.toLowerCase();
                    }),
                    'choices' : [],
                    'choiceShuffle' : true
                };

            if(!renderer){
                throw 'no renderer found for the interaction ' + this.qtiClass;
            }

            //@todo to be removed, now use renderer.getData to pass additional data to tpl
            if(this.attr('orientation')){
                defaultData['horizontal'] = (this.attr('orientation') === 'horizontal');
            }

            try{
                var choices = (this.attr('shuffle') && renderer.shuffleChoices) ? renderer.getShuffledChoices(this) : this.getChoices();
                var interactionData = {'interaction' : {'serial' : this.serial, 'attributes' : this.attributes}};
                var _this = this;
                _.each(choices, function(choice){
                    if(Element.isA(choice, 'choice')){
                        var renderedChoice = choice.render(_.clone(interactionData, true), null, choice.qtiClass + '.' + _this.qtiClass); //use interaction type as choice subclass
                        defaultData.choices.push(renderedChoice);
                    }
                });
            }catch(e){
                //leave choices empty in case of error
            }

            var tplData = _.merge(defaultData, data || {});
            var tplName = subClass ? this.qtiClass + '.' + subClass : this.qtiClass;
            return this._super(tplData, $container, tplName);
        },
        postRender : function(data){
            var choices = this.getChoices();
            for(var i in choices){
                var c = choices[i];
                if(Element.isA(c, 'choice')){
                    c.postRender({}, c.qtiClass + '.' + this.qtiClass);
                }
            }
            this._super(data);
        },
        setResponse : function(values){
            var ret = null;
            var renderer = this.getRenderer();
            if(renderer){
                ret = renderer.setResponse(this, values);
            }else{
                throw 'no renderer found for the interaction ' + this.qtiClass;
            }
            return ret;
        },
        getResponse : function(){
            var ret = null;
            var renderer = this.getRenderer();
            if(renderer){
                ret = renderer.getResponse(this);
            }else{
                throw 'no renderer found for the interaction ' + this.qtiClass;
            }
            return ret;
        },
        toArray : function(){
            var arr = this._super();
            arr.choices = {};
            for(var serial in this.choices){
                if(Element.isA(this.choices[serial], 'choice')){
                    arr.choices[serial] = this.choices[serial].toArray();
                }
            }
            return arr;
        }
    });
    return QtiInteraction;
});