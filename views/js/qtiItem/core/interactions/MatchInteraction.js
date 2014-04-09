define([
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/core/choices/SimpleAssociableChoice',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig'
], function(Element, BlockInteraction, SimpleAssociableChoice, _, rendererConfig){

    var MatchInteraction = BlockInteraction.extend({
        qtiClass : 'matchInteraction',
        init : function(serial, attributes){
            this._super(serial, attributes);
            this.choices = [{}, {}];
        },
        addChoice : function(choice, matchSet){
            matchSet = parseInt(matchSet);
            if(this.choices[matchSet]){
                choice.setRelatedItem(this.getRelatedItem() || null);
                this.choices[matchSet][choice.getSerial()] = choice;
            }
        },
        removeChoice : function(choice){
            var serial = '';
            if(typeof(choice) === 'string'){
                serial = choice;
            }else if(Element.isA('choice')){
                serial = choice.getSerial();
            }
            delete this.choices[0][serial];
            delete this.choices[1][serial];
            return this;
        },
        getChoices : function(matchSet){
            matchSet = parseInt(matchSet);
            if(this.choices[matchSet]){
                return _.clone(this.choices[matchSet]);
            }else{
                return _.clone(this.choices);
            }
        },
        getComposingElements : function(){

            var elts = this._super();
            //recursive to both match sets:
            for(var i = 0; i < 2; i++){
                var matchSet = this.getChoices(i);
                for(var serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        elts[serial] = matchSet[serial];
                        elts = _.extend(elts, matchSet[serial].getComposingElements());
                    }
                }
            }

            return elts;
        },
        find : function(serial){
            var found = this._super(serial);
            if(!found){
                for(var i = 0; i < 2; i++){
                    var matchSet = this.getChoices(i);
                    if(matchSet[serial]){
                        found = {parent : this, element : matchSet[serial]};
                        break;
                    }
                }
            }
            return found;
        },
        render : function(){
        
            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                choices,
                defaultData = {
                'matchSet1' : [],
                'matchSet2' : []
            };

            var interactionData = {'interaction' : {'serial' : this.serial, 'attributes' : this.attributes}};

            if(!renderer){
                throw 'no renderer found for the interaction ' + this.qtiClass;
            }

            if(this.attr('shuffle') && renderer.shuffleChoices){
                choices = renderer.getShuffledChoices(this);
            }else{
                choices = this.getChoices();
            }

            for(var i = 0; i < 2; i++){
                var matchSet = choices[i];
                for(var serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        defaultData['matchSet' + (i + 1)].push(matchSet[serial].render(_.clone(interactionData, true), null, 'simpleAssociableChoice.matchInteraction', renderer));
                    }
                }
            }

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        postRender : function(data, altClassName, renderer){

            renderer = renderer || this.getRenderer();
            
            var choices = this.getChoices();
            
            for(var i = 0; i < 2; i++){
                _.forIn(choices[i], function(c){
                    if(c instanceof SimpleAssociableChoice){
                        c.postRender({}, 'simpleAssociableChoice.matchInteraction', renderer);
                    }
                });
            }

            return this._super(data, altClassName, renderer);
        },
        toArray : function(){
            var arr = this._super();
            arr.choices = {0 : {}, 1 : {}};
            for(var i = 0; i < 2; i++){
                var matchSet = this.getChoices(i);
                for(var serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        arr.choices[i][serial] = matchSet[serial].toArray();
                    }
                }
            }
            return arr;
        }
    });

    return MatchInteraction;
});


