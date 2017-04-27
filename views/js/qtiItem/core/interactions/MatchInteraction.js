define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/core/choices/SimpleAssociableChoice',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'taoQtiItem/qtiItem/helper/util',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(BlockInteraction, SimpleAssociableChoice, _, rendererConfig, util, maxScore){
    'use strict';

    var MatchInteraction = BlockInteraction.extend({
        qtiClass : 'matchInteraction',
        init : function init(serial, attributes){
            this._super(serial, attributes);
            this.choices = [{}, {}];
        },
        addChoice : function addChoice(choice, matchSet){
            matchSet = parseInt(matchSet);
            if(this.choices[matchSet]){
                choice.setRelatedItem(this.getRelatedItem() || null);
                this.choices[matchSet][choice.getSerial()] = choice;
            }
        },
        getChoices : function getChoices(matchSet){
            matchSet = parseInt(matchSet);
            if(this.choices[matchSet]){
                return _.clone(this.choices[matchSet]);
            }else{
                return _.clone(this.choices);
            }
        },
        getChoice : function getChoice(serial){
            return this.choices[0][serial] || this.choices[1][serial] || null;
        },
        getChoiceByIdentifier : function getChoiceByIdentifier(identifier){
            var i, matchSet, serial;
            //recursive to both match sets:
            for(i = 0; i < 2; i++){
                matchSet = this.getChoices(i);
                for(serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice && matchSet[serial].id() === identifier){
                        return matchSet[serial];
                    }
                }
            }
            return null;
        },
        getComposingElements : function getComposingElements(){
            var i, matchSet, serial;
            var elts = this._super();
            //recursive to both match sets:
            for(i = 0; i < 2; i++){
                matchSet = this.getChoices(i);
                for(serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        elts[serial] = matchSet[serial];
                        elts = _.extend(elts, matchSet[serial].getComposingElements());
                    }
                }
            }

            return elts;
        },
        find : function find(serial){
            var found = this._super(serial);
            if(!found){
                found = util.findInCollection(this, ['choices.0', 'choices.1'], serial);
            }
            return found;
        },
        render : function render(){

            var args = rendererConfig.getOptionsFromArguments(arguments);
            var renderer = args.renderer || this.getRenderer();
            var defaultData = {
                'matchSet1' : [],
                'matchSet2' : []
            };
            var choices, i, matchSet, serial;
            var interactionData = {'interaction' : {'serial' : this.serial, 'attributes' : this.attributes}};

            if(!renderer){
                throw 'no renderer found for the interaction ' + this.qtiClass;
            }

            if(this.attr('shuffle') && renderer.getOption('shuffleChoices')){
                choices = renderer.getShuffledChoices(this);
            }else{
                choices = this.getChoices();
            }

            for(i = 0; i < 2; i++){
                matchSet = choices[i];
                for(serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        defaultData['matchSet' + (i + 1)].push(matchSet[serial].render(_.clone(interactionData, true), null, 'simpleAssociableChoice.matchInteraction', renderer));
                    }
                }
            }
            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        postRender : function postRender(data, altClassName, renderer){
            renderer = renderer || this.getRenderer();
            return _(this.getChoices())
                .map(function(choices){
                    return _(choices)
                        .filter(function(choice){
                            return choice instanceof SimpleAssociableChoice;
                        })
                        .map(function(choice){
                            return choice.postRender({}, 'simpleAssociableChoice.matchInteraction', renderer);
                        })
                        .value();
                })
                .flatten(true)
                .value()
                .concat(this._super(data, altClassName, renderer));
        },
        toArray : function toArray(){
            var i, matchSet, serial;
            var arr = this._super();
            arr.choices = {0 : {}, 1 : {}};
            for(i = 0; i < 2; i++){
                matchSet = this.getChoices(i);
                for(serial in matchSet){
                    if(matchSet[serial] instanceof SimpleAssociableChoice){
                        arr.choices[i][serial] = matchSet[serial].toArray();
                    }
                }
            }
            return arr;
        },
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.associateInteractionBased(this);
        }
    });

    return MatchInteraction;
});


