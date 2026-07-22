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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/NoRp',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(stateFactory, NoRp, xmlRenderer){
    'use strict';

    return stateFactory.create(NoRp, ()=>{}, function exitStateNoRp(){
        var interaction = this.widget.element;
        var item = interaction.getRootElement();
        var outcomeScore = item.getOutcomeDeclaration('SCORE');
        var rp = item.responseProcessing;
        var rpXml = xmlRenderer.render(rp);

        //create the outcome score if rp required
        if(rpXml && !outcomeScore){
            outcomeScore = item.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }
    });
});
