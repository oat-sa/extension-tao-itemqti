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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 **/
define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/helper/response',
    'json!taoQtiItem/test/qtiItem/response/data/choice-correct-multiple.json',
    'json!taoQtiItem/test/qtiItem/response/data/choice-map-maxchoice3.json',
    'json!taoQtiItem/test/qtiItem/response/data/choice-map-upperbound2.json',
    'json!taoQtiItem/test/qtiItem/response/data/composite-choice-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/composite-choice-correct-map.json',
], function (
    _,
    Element,
    Loader,
    responseHelper,
    dataChoiceCorrectMupltiple,
    dataChoiceMaxchoice3,
    dataChoiceUpperbound2,
    dataCompositeChoiceCorrect,
    dataCompositeChoiceCorrectMap
){
    'use strict';

    var cases = [
        { title : 'single choice correct', data : dataChoiceCorrectMupltiple, expectedMaximum: 1},
        { title : 'single choice map - maxChoice 3', data : dataChoiceMaxchoice3, expectedMaximum: 3},
        { title : 'single choice map - upperBound 2', data : dataChoiceUpperbound2, expectedMaximum: 2},
        { title : 'composite choice correct', data : dataCompositeChoiceCorrect, expectedMaximum: 2},
        { title : 'composite choice correct and map', data : dataCompositeChoiceCorrectMap, expectedMaximum: 2.5}
    ];

    QUnit
        .cases(cases)
        .asyncTest('setNormalMaximum', function(data, assert){

        var loader = new Loader();

        loader.loadItemData(data.data, function(item){

            var outcomeScore;

            QUnit.start();
            assert.ok(Element.isA(item, 'assessmentItem'), 'item loaded');

            outcomeScore = item.getOutcomeDeclaration('SCORE');
            assert.ok(_.isUndefined(outcomeScore.attr('normalMaximum')), 'normalMaximum initially undefined');

            responseHelper.setNormalMaximum(item);
            assert.equal(outcomeScore.attr('normalMaximum'), data.expectedMaximum, 'calculated normalMaximum is correct');
        });
    });

});

