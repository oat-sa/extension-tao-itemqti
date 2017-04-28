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
    'taoQtiItem/qtiItem/core/interactions/InlineInteraction',
    'taoQtiItem/qtiItem/helper/response',
    'lodash'
], function(InlineInteraction, responseHelper, _){
    'use strict';
    var TextEntryInteraction = InlineInteraction.extend({
        'qtiClass' : 'textEntryInteraction',
        getNormalMaximum : function getNormalMaximum(){
            var responseDeclaration = this.getResponseDeclaration();
            var template = responseHelper.getTemplateNameFromUri(responseDeclaration.template);
            var max, scoreMaps;
            var self = this;

            /**
             * Check that a response is possible or not according to the defined patternmask
             * @param {String} value
             * @returns {Boolean}
             */
            var isPossibleResponse = function isPossibleResponse(value){
                var patternMask = self.attr('patternMask');
                if(patternMask){
                    return !!value.match(new RegExp(patternMask));
                }else{
                    //no restriction by pattern so always possible
                    return true;
                }
            };

            if (template === 'MATCH_CORRECT') {
                if(!responseDeclaration.correctResponse || (_.isArray(responseDeclaration.correctResponse) && !responseDeclaration.correctResponse.length)){
                    //no correct response defined -> score always zero
                    max = 0;
                }else{
                    max = isPossibleResponse(responseDeclaration.correctResponse[0]) ? 1 : 0;
                }
            }else if(template === 'MAP_RESPONSE') {

                //calculate the maximum reachable score by choice map
                scoreMaps = _.values(_.filter(responseDeclaration.mapEntries, function(score, key){
                    return isPossibleResponse(key);
                }));
                max = _(scoreMaps).map(function (v) {
                    return parseFloat(v);
                }).max();
                max = parseFloat(max);

                //compare the calculated maximum with the mapping upperbound
                if (responseDeclaration.mappingAttributes.upperBound) {
                    max = Math.min(max, parseFloat(responseDeclaration.mappingAttributes.upperBound));
                }
            }else if(template === 'MAP_RESPONSE_POINT'){
                max = 0;
            }
            return max;
        }
    });
    return TextEntryInteraction;
});