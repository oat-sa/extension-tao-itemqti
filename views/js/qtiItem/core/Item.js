define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiItem/core/IdentifiedElement', 'taoQtiItem/qtiItem/mixin/ContainerItemBody', 'lodash'], function(Element, IdentifiedElement, Container, _){

    var Item = IdentifiedElement.extend({
        qtiClass : 'assessmentItem',
        init : function(serial, attributes){
            this._super(serial, attributes);
            this.relatedItem = this;
            this.stylesheets = {};
            this.responses = {};
            this.outcomes = {};
            this.modalFeedbacks = {};
            this.responseProcessing = null;
        },
        getInteractions : function(){
            var interactions = [];
            var elts = this.getComposingElements();
            for(var serial in elts){
                if(Element.isA(elts[serial], 'interaction')){
                    interactions.push(elts[serial]);
                }
            }
            return interactions;
        },
        addResponseDeclaration : function(response){
            if(Element.isA(response, 'responseDeclaration')){
                response.setRelatedItem(this);
                this.responses[response.getSerial()] = response;
            }else{
                throw 'is not a qti response declaration';
            }
            return this;
        },
        getResponseDeclaration : function(identifier){
            for(var i in this.responses){
                if(this.responses[i].attr('identifier') === identifier){
                    return this.responses[i];
                }
            }
            return null;
        },
        addOutcomeDeclaration : function(outcome){
            if(Element.isA(outcome, 'outcomeDeclaration')){
                outcome.setRelatedItem(this);
                this.outcomes[outcome.getSerial()] = outcome;
            }else{
                throw 'is not a qti outcome declaration';
            }
            return this;
        },
        addModalFeedback : function(feedback){
            if(Element.isA(feedback, 'modalFeedback')){
                feedback.setRelatedItem(this);
                this.modalFeedbacks[feedback.getSerial()] = feedback;
            }else{
                throw 'is not a qti modal feedback';
            }
            return this;
        },
        getComposingElements : function(){
            var elts = this._super(), _this = this;
            _.each(['responses', 'outcomes', 'modalFeedbacks', 'stylesheets'], function(elementCollection){
                for(var i in _this[elementCollection]){
                    var elt = _this[elementCollection][i];
                    elts[i] = elt;
                    elts = _.extend(elts, elt.getComposingElements());
                }
            });
            if(this.responseProcessing instanceof Element){
                elts[this.responseProcessing.getSerial()] = this.responseProcessing;
            }
            return elts;
        },
        find : function(serial){
            var found = this._super(serial);
            if(!found){
                //@todo: missing outcomes and responses here!
                var elt = this.modalFeedbacks[serial];
                if(elt){
                    found = {'parent' : this, 'element' : elt};
                }
            }
            return found;
        },
        getResponses : function(){
            return this.responses;
        },
        getRelatedItem : function(){
            return this;
        },
        setNamespaces : function(namespaces){
            this.namespaces = namespaces;
        },
        getNamespaces : function(){
            return _.clone(this.namespaces);
        },
        addStylesheet : function(stylesheet){
            if(Element.isA(stylesheet, 'stylesheet')){
                stylesheet.setRelatedItem(this);
                this.stylesheets[stylesheet.getSerial()] = stylesheet;
            }else{
                throw 'is not a qti stylesheet declaration';
            }
            return this;
        },
        setResponseProcessing:function(rp){
            if(Element.isA(rp, 'responseProcessing')){
                rp.setRelatedItem(this);
                this.responseProcessing = rp;
            }else{
                throw 'is not a response processing';
            }
            return this;
        },
        toArray : function(){
            var arr = this._super();
            arr.outcomes = {};
            for(var i in this.outcomes){
                arr.outcomes[i] = this.outcomes[i].toArray();
            }
            arr.responses = {};
            for(var i in this.responses){
                arr.responses[i] = this.responses[i].toArray();
            }
            arr.namespaces = this.namespaces;
            arr.stylesheets = this.stylesheets;
            return arr;
        }
    });

    Container.augment(Item);

    return Item;
});