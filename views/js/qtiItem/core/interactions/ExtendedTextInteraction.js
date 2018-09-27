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
    'lodash',
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(_, BlockInteraction, rendererConfig, maxScore){
    'use strict';
    var ExtendedTextInteraction = BlockInteraction.extend({
        qtiClass : 'extendedTextInteraction',
        render : function render(){

            var i,
                args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {
                    'multiple' : false,
                    'maxStringLoop' : []
                },
                response = this.getResponseDeclaration();

            if(this.attr('maxStrings') && (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered')){
                defaultData.multiple = true;
                for(i = 0; i < this.attr('maxStrings'); i++){
                    defaultData.maxStringLoop.push(i + '');//need to convert to string. The tpl engine fails otherwise
                }
            }

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.textEntryInteractionBased(this);
        }
    });

    return ExtendedTextInteraction;
});