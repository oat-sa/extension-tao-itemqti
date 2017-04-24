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
    'json!taoQtiItem/test/qtiItem/response/data/choice-correct-noresponse.json',
    'json!taoQtiItem/test/qtiItem/response/data/choice-correct-multiple.json',
    'json!taoQtiItem/test/qtiItem/response/data/choice-map-maxchoice3.json',
    'json!taoQtiItem/test/qtiItem/response/data/choice-map-upperbound2.json',
    'json!taoQtiItem/test/qtiItem/response/data/composite-choice-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/composite-choice-correct-map.json',
    'json!taoQtiItem/test/qtiItem/response/data/inlinechoice-correct-noresponse.json',
    'json!taoQtiItem/test/qtiItem/response/data/inlinechoice-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/inlinechoice-map.json',
    'json!taoQtiItem/test/qtiItem/response/data/order-noresponse.json',
    'json!taoQtiItem/test/qtiItem/response/data/order-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/textentry-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/textentry-map.json',
    'json!taoQtiItem/test/qtiItem/response/data/textentry-correct-impossible-patternmask.json',
    'json!taoQtiItem/test/qtiItem/response/data/textentry-map-impossible-patternmask.json',
    'json!taoQtiItem/test/qtiItem/response/data/upload.json',
    'json!taoQtiItem/test/qtiItem/response/data/pci-custom.json',
    'json!taoQtiItem/test/qtiItem/response/data/custom-rp.json',
    'json!taoQtiItem/test/qtiItem/response/data/upload-choice-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/hottext-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/hotspot-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/selectpoint-map.json',
    'json!taoQtiItem/test/qtiItem/response/data/graphicorder-map.json',
    'json!taoQtiItem/test/qtiItem/response/data/slider-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/gapmatch-correct.json',
    'json!taoQtiItem/test/qtiItem/response/data/gapmatch-map.json',
], function (
    _,
    Element,
    Loader,
    responseHelper,
    dataChoiceCorrectNoResponse,
    dataChoiceCorrectMupltiple,
    dataChoiceMaxchoice3,
    dataChoiceUpperbound2,
    dataCompositeChoiceCorrect,
    dataCompositeChoiceCorrectMap,
    dataInlineChoiceCorrectNoResponse,
    dataInlineChoiceCorrect,
    dataInlineChoiceMap,
    dataOrderNoResponse,
    dataOrder,
    dataTextentryCorrect,
    dataTextentryMap,
    dataTextentryCorrectImpossiblePatternMask,
    dataTextentryMapImpossiblePatternMask,
    dataUpload,
    dataPci,
    dataCustomRp,
    dataUploadChoice,
    dataHottextCorrect,
    dataHotspotCorrect,
    dataSelectpointMap,
    dataGraphicOrderCorrect,
    dataSliderCorrect,
    dataGapmatchCorrect,
    dataGapmatchMap
){
    'use strict';

    var cases = [
        { title : 'single choice correct - no correct response', data : dataChoiceCorrectNoResponse, expectedMaximum: 0},
        { title : 'single choice correct', data : dataChoiceCorrectMupltiple, expectedMaximum: 1},
        { title : 'single choice map - maxChoice 3', data : dataChoiceMaxchoice3, expectedMaximum: 3},
        { title : 'single choice map - upperBound 2', data : dataChoiceUpperbound2, expectedMaximum: 2},
        { title : 'composite choice correct', data : dataCompositeChoiceCorrect, expectedMaximum: 2},
        { title : 'composite choice correct and map', data : dataCompositeChoiceCorrectMap, expectedMaximum: 2.5},
        { title : 'inline choice correct - no correct response', data : dataInlineChoiceCorrectNoResponse, expectedMaximum: 0},
        { title : 'inline choice correct', data : dataInlineChoiceCorrect, expectedMaximum: 1},
        { title : 'inline choice map', data : dataInlineChoiceMap, expectedMaximum: 2},
        { title : 'order - no correct response', data : dataOrderNoResponse, expectedMaximum: 0},
        { title : 'order', data : dataOrder, expectedMaximum: 1},
        { title : 'text entry - correct', data : dataTextentryCorrect, expectedMaximum: 1},
        { title : 'text entry - map', data : dataTextentryMap, expectedMaximum: 2},
        { title : 'text entry - correct but impossible pattern mask', data : dataTextentryCorrectImpossiblePatternMask, expectedMaximum: 0},
        { title : 'text entry - map but some impossible pattern mask', data : dataTextentryMapImpossiblePatternMask, expectedMaximum: 0.5},
        { title : 'upload', data : dataUpload, expectedMaximum: undefined},
        { title : 'custom interaction', data : dataPci, expectedMaximum: undefined},
        { title : 'custom response processing', data : dataCustomRp, expectedMaximum: undefined},
        { title : 'upload and choice - correct', data : dataUploadChoice, expectedMaximum: undefined},
        { title : 'hottext - correct', data : dataHottextCorrect, expectedMaximum: 1},
        { title : 'hotspot - correct', data : dataHotspotCorrect, expectedMaximum: 1},
        { title : 'select point - map', data : dataSelectpointMap, expectedMaximum: 2},
        { title : 'graphic order - correct', data : dataGraphicOrderCorrect, expectedMaximum: 1},
        { title : 'slider - correct', data : dataSliderCorrect, expectedMaximum: 1},
        { title : 'gap match - correct', data : dataGapmatchCorrect, expectedMaximum: 1},
        { title : 'gap match - correct matchMax', data : dataGapmatchCorrect, expectedMaximum: 0, changeData : function(data){
            data.responses.responsedeclaration_58f5e075ede73619627566.correctResponses = ['choice_11 gap_2', 'choice_11 gap_1'];
            return data;
        }},
        { title : 'gap match - correct gap', data : dataGapmatchCorrect, expectedMaximum: 0, changeData : function(data){
            data.responses.responsedeclaration_58f5e075ede73619627566.correctResponses = ['choice_11 gap_1', 'choice_12 gap_1'];
            return data;
        }},
        { title : 'gap match - map', data : dataGapmatchMap, expectedMaximum: 3},
        { title : 'gap match - map (no match max)', data : dataGapmatchMap, expectedMaximum: 3.5, changeData : function(data){
            data.body.elements.interaction_gapmatchinteraction_58fa1c4a97da2623687350.choices.choice_gaptext_58fa1c4a9c05b538942409.attributes.matchMax = 0;
            return data;
        }},
    ];

    QUnit
        .cases(cases)
        .asyncTest('setNormalMaximum', function(config, assert){

        var loader = new Loader();
        var data = _.cloneDeep(config.data);

        if(_.isFunction(config.changeData)){
            data = config.changeData(data);
        }

        loader.loadItemData(data, function(item){

            var outcomeScore;

            QUnit.start();
            assert.ok(Element.isA(item, 'assessmentItem'), 'item loaded');

            outcomeScore = item.getOutcomeDeclaration('SCORE');
            assert.ok(_.isUndefined(outcomeScore.attr('normalMaximum')), 'normalMaximum initially undefined');

            responseHelper.setNormalMaximum(item);
            assert.equal(outcomeScore.attr('normalMaximum'), config.expectedMaximum, 'calculated normalMaximum is correct');
        });
    });

});

