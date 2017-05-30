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
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/maxScore',
    'lodash'
], function(BlockInteraction, maxScore, _){
    'use strict';
    var calculatePossiblePairs0 = function(associateInteraction){
        //get max number of pairs
        var pairs = [];
        var choices = _(associateInteraction.getChoices()).map(function(choice){
            return {
                matchMax : choice.attr('matchMax') === 0 ? Infinity : choice.attr('matchMax') || 0,
                id: choice.id()
            };
        }).sortBy('matchMax').reverse().valueOf();

        var i,j;

        for(i=0; i < choices.length; i++){
            for(j=i; j < choices.length; j++){
                if(!choices[i].matchMax){
                    break;
                }
                if(!choices[j].matchMax){
                    continue;
                }
                pairs.push([choices[i].id, choices[j].id]);
                choices[i].matchMax --;
                choices[j].matchMax --;
            }
        }

        return pairs;
    };

    var calculatePossiblePairs = function calculatePossiblePairs(associateInteraction){
        //get max number of pairs
        var pairs = [];
        var choices = _(associateInteraction.getChoices()).map(function(choice){
            return {
                matchMax : choice.attr('matchMax') === 0 ? Infinity : choice.attr('matchMax') || 0,
                id: choice.id()
            };
        }).sortBy('matchMax').reverse().valueOf();

        var i,j;

        for(i=0; i < choices.length; i++){
            for(j=i; j < choices.length; j++){
                pairs.push([choices[i].id, choices[j].id]);
            }
        }

        return pairs;
    };

    var AssociateInteraction = BlockInteraction.extend({
        qtiClass : 'associateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.associateInteractionBased(this, {possiblePairs: calculatePossiblePairs(this)});
        }
    });
    return AssociateInteraction;
});


