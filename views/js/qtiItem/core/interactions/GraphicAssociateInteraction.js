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
    'taoQtiItem/qtiItem/helper/maxScore'
], function(GraphicInteraction, maxScore){
    'use strict';
    var GraphicAssociateInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicAssociateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var calculatePossiblePairs = function calculatePossiblePairs(associateInteraction){
                var i, j, pairs = [];
                var choices = maxScore.getMatchMaxOrderedChoices(associateInteraction.getChoices());
                for(i=0; i < choices.length; i++){
                    for(j=i; j < choices.length; j++){
                        if(i !== j){
                            pairs.push([choices[i].id, choices[j].id]);
                        }
                    }
                }
                return pairs;
            };
            return maxScore.associateInteractionBased(this, {possiblePairs: calculatePossiblePairs(this)});
        }
    });
    return GraphicAssociateInteraction;
});

