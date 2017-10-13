/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/core/Element',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'taoQtiItem/qtiItem/helper/maxScore',
    'taoQtiItem/qtiItem/helper/response'
], function(GraphicInteraction, Element, _, rendererConfig, maxScore, responseHelper){
    'use strict';

    var GraphicGapMatchInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicGapMatchInteraction',
        init : function init(serial, attributes){
            this._super(serial, attributes);
            this.gapImgs = {};
        },
        addGapImg : function addGapImg(gapImg){
            if(Element.isA(gapImg, 'gapImg')){
                gapImg.setRootElement(this.getRootElement() || null);
                this.gapImgs[gapImg.getSerial()] = gapImg;
            }
        },
        removeGapImg : function removeGapImg(gapImg){
            var serial = '';
            if(typeof(gapImg) === 'string'){
                serial = gapImg;
            }else if(Element.isA(gapImg, 'gapImg')){
                serial = gapImg.getSerial();
            }
            delete this.gapImgs[serial];
            return this;
        },
        getGapImgs : function getGapImgs(){
            return _.clone(this.gapImgs);
        },
        getGapImg : function getGapImg(serial){
            return this.gapImgs[serial];
        },
        getChoiceByIdentifier : function getChoiceByIdentifier(identifier){
            var choice = this._super(identifier);
            if(!choice){
                //if not found among the choices, search the gapImgs
                choice = _.find(this.gapImgs, function(elt){
                    return (elt && elt.id() === identifier);
                });
            }
            return choice;
        },
        getComposingElements : function getComposingElements(){
            var serial, elts = this._super();
            //recursive to choices:
            for(serial in this.gapImgs){
                elts[serial] = this.gapImgs[serial];
                elts = _.extend(elts, this.gapImgs[serial].getComposingElements());
            }
            return elts;
        },
        find : function find(serial){
            var found = this._super(serial);
            if(!found){
                if(this.gapImgs[serial]){
                    found = {'parent' : this, 'element' : this.gapImgs[serial]};
                }
            }
            return found;
        },
        render : function render(){
            var serial,
                args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {
                    'gapImgs' : []
                };

            //note: no choice shuffling option available for graphic gap match
            var gapImgs = this.getGapImgs();
            for(serial in gapImgs){
                if(Element.isA(gapImgs[serial], 'choice')){
                    defaultData.gapImgs.push(gapImgs[serial].render({}, null, '', renderer));
                }
            }

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        toArray : function toArray(){
            var serial, gapImgs, arr = this._super();
            arr.gapImgs = {};
            gapImgs = this.getGapImgs();
            for(serial in gapImgs){
                arr.gapImgs[serial] = gapImgs[serial].toArray();
            }
            return arr;
        },
        getNormalMaximum : function getNormalMaximum(){
            var calculatePossiblePairs = function calculatePossiblePairs(graphicGapInteraction){
                var pairs = [];
                var matchSet1 = maxScore.getMatchMaxOrderedChoices(graphicGapInteraction.getGapImgs());
                var matchSet2 = maxScore.getMatchMaxOrderedChoices(graphicGapInteraction.getChoices());

                _.forEach(matchSet1, function(choice1){
                    _.forEach(matchSet2, function(choice2){
                        pairs.push([choice1.id, choice2.id]);
                    });
                });

                return pairs;
            };
            return maxScore.associateInteractionBased(this, {possiblePairs : calculatePossiblePairs(this), checkInfinitePair : true});
        }
    });

    return GraphicGapMatchInteraction;
});
