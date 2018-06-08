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
    'taoQtiItem/qtiItem/helper/maxScore',
    'json!taoQtiItem/test/qtiItem/maxScore/data/choice-correct-noresponse.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/choice-correct-multiple.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/choice-map-maxchoice3.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/choice-map-upperbound2.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/composite-choice-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/composite-choice-correct-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/inlinechoice-correct-noresponse.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/inlinechoice-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/inlinechoice-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/order-noresponse.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/order-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/textentry-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/textentry-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/textentry-correct-impossible-patternmask.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/textentry-map-impossible-patternmask.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/extended-text.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/extended-text-manual-scoring.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/extended-text-manual-scoring-with-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/upload.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/pci-custom.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/custom-rp.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/upload-choice-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/hottext-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/hotspot-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/selectpoint-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphicorder-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/slider-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/gapmatch-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/gapmatch-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/associate-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/associate-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/match-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/match-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-associate-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-associate-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-gap-correct.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-gap-map.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/associate-matchmax.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/match-matchmax.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/gapmatch-matchmax.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/gapmatch-map-matchmax.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-gap-infinite.json',
    'json!taoQtiItem/test/qtiItem/maxScore/data/graphic-associate-matchmax.json'
], function (
    _,
    Element,
    Loader,
    maxScore,
    dataChoiceCorrectNoResponse,
    dataChoiceCorrectMultiple,
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
    dataExtendedText,
    dataExtendedTextManualScoring,
    dataExtendedTextManualScoringWithCorrect,
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
    dataGapmatchMap,
    dataAssociateCorrect,
    dataAssociateMap,
    dataMatchCorrect,
    dataMatchMap,
    dataGraphicAssociateCorrect,
    dataGraphicAssociateMap,
    dataGraphicGapCorrect,
    dataGraphicGapMap,
    dataAssociateMatchmax,
    dataMatchMatchmax,
    dataGapMatchMatchmax,
    dataGapMatchMapMatchmax,
    dataGapMatchInfinite,
    dataGraphicAssocMatchmax
){
    'use strict';

    var cases = [
        { title : 'single choice correct', data : dataChoiceCorrectMultiple, expectedMaximum: 1, maxScore: 1},
        { title : 'single choice correct - no correct response', data : dataChoiceCorrectNoResponse, expectedMaximum: 0, maxScore: 0},
        //if _ignoreMinChoice is turned to false, expect the expectedMaximumto be 0 instead of 1
        { title : 'single choice correct - impossible min choice', data : dataChoiceCorrectMultiple, expectedMaximum: 1, maxScore: 1, changeData : function(data){
            data.body.elements.interaction_choiceinteraction_58eb45eba8e1b211271087.attributes.minChoices = 3;
            return data;
        }},
        { title : 'single choice map - maxChoice 3', data : dataChoiceMaxchoice3, expectedMaximum: 3, maxScore: 3},
        { title : 'single choice map - map default > 3', data : dataChoiceMaxchoice3, expectedMaximum: 3, maxScore: 3, changeData : function(data){
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mappingAttributes.defaultValue = 3;
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mappingAttributes.upperBound = 0;
            return data;
        }},
        { title : 'single choice map - map default > 3 and 2 map entries', data : dataChoiceMaxchoice3, expectedMaximum: 5, maxScore: 5, changeData : function(data){
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mappingAttributes.defaultValue = 3;
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mappingAttributes.upperBound = 0;
            delete data.responses.responsedeclaration_58eb4dfbd4a74001643639.mapping.choice_3;
            return data;
        }},
        { title : 'single choice map - no map entries', data : dataChoiceMaxchoice3, expectedMaximum: 0, maxScore: 0, changeData : function(data){
            //note: when the mapping entry is empty, it is not QTI compliant
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mapping = {};
            data.responses.responsedeclaration_58eb4dfbd4a74001643639.mappingAttributes.defaultValue = 1;
            return data;
        }},
        { title : 'single choice map - upperBound 2', data : dataChoiceUpperbound2, expectedMaximum: 2, maxScore: 2},
        { title : 'composite choice correct', data : dataCompositeChoiceCorrect, expectedMaximum: 2, maxScore: 2},
        { title : 'composite choice correct and map', data : dataCompositeChoiceCorrectMap, expectedMaximum: 2.5, maxScore: 2.5},
        { title : 'inline choice correct - no correct response', data : dataInlineChoiceCorrectNoResponse, expectedMaximum: 0, maxScore: 0},
        { title : 'inline choice correct', data : dataInlineChoiceCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'inline choice map', data : dataInlineChoiceMap, expectedMaximum: 2, maxScore: 2},
        { title : 'order - no correct response', data : dataOrderNoResponse, expectedMaximum: 0, maxScore: 0},
        { title : 'order', data : dataOrder, expectedMaximum: 1, maxScore: 1},
        { title : 'text entry - correct', data : dataTextentryCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'text entry - map', data : dataTextentryMap, expectedMaximum: 2, maxScore: 2},
        { title : 'text entry - correct but impossible pattern mask', data : dataTextentryCorrectImpossiblePatternMask, expectedMaximum: 0, maxScore: 0},
        { title : 'text entry - map but some impossible pattern mask', data : dataTextentryMapImpossiblePatternMask, expectedMaximum: 0.5, maxScore: 0.5},
        { title : 'extended text', data : dataExtendedText, expectedMaximum: 1, maxScore: 1},
        { title : 'extended text - manual scoring', data : dataExtendedTextManualScoring, expectedMaximum: 0, maxScore: 3},
        { title : 'extended text - manual scoring with correct', data : dataExtendedTextManualScoringWithCorrect, expectedMaximum: 1, maxScore: 4},
        { title : 'upload', data : dataUpload, expectedMaximum: undefined, maxScore: undefined},
        { title : 'custom interaction', data : dataPci, expectedMaximum: undefined, maxScore: undefined},
        { title : 'custom response processing', data : dataCustomRp, expectedMaximum: undefined, maxScore: undefined},
        { title : 'upload and choice - correct', data : dataUploadChoice, expectedMaximum: undefined, maxScore: undefined},
        { title : 'hottext - correct', data : dataHottextCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'hotspot - correct', data : dataHotspotCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'select point - map response', data : dataSelectpointMap, expectedMaximum: 8, maxScore: 8},
        { title : 'graphic order - correct', data : dataGraphicOrderCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'slider - correct', data : dataSliderCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'gap match - correct', data : dataGapmatchCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'gap match - correct matchMax', data : dataGapmatchCorrect, expectedMaximum: 0, maxScore: 0, changeData : function(data){
            data.responses.responsedeclaration_58f5e075ede73619627566.correctResponses = ['choice_11 gap_2', 'choice_11 gap_1'];
            return data;
        }},
        { title : 'gap match - correct gap', data : dataGapmatchCorrect, expectedMaximum: 0, maxScore: 0, changeData : function(data){
            data.responses.responsedeclaration_58f5e075ede73619627566.correctResponses = ['choice_11 gap_1', 'choice_12 gap_1'];
            return data;
        }},
        { title : 'gap match - map', data : dataGapmatchMap, expectedMaximum: 3, maxScore: 3},
        { title : 'gap match - map (no match max)', data : dataGapmatchMap, expectedMaximum: 3.5, maxScore: 3.5, changeData : function(data){
            data.body.elements.interaction_gapmatchinteraction_58fa1c4a97da2623687350.choices.choice_gaptext_58fa1c4a9c05b538942409.attributes.matchMax = 0;
            return data;
        }},
        { title : 'associate - correct', data : dataAssociateCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'associate - correct impossible', data : dataAssociateCorrect, expectedMaximum: 0, maxScore: 0, changeData : function(data){
            data.body.elements.interaction_associateinteraction_58fdf58980cb4613690390.choices.choice_simpleassociablechoice_58fdf58984e63595993061.attributes.matchMax = 1;
            return data;
        }},
        { title : 'associate - map', data : dataAssociateMap, expectedMaximum: 3, maxScore: 3},
        { title : 'associate - map - matchMax=1', data : dataAssociateMap, expectedMaximum: 2, maxScore: 2, changeData : function(data){
            data.body.elements.interaction_associateinteraction_58fdfc915cb60553869971.choices.choice_simpleassociablechoice_58fdfc915f3ed319686888.attributes.matchMax = 1;
            return data;
        }},
        { title : 'associate - map - maxAssociations=1', data : dataAssociateMap, expectedMaximum: 2, maxScore: 2, changeData : function(data){
            data.body.elements.interaction_associateinteraction_58fdfc915cb60553869971.attributes.maxAssociations = 1;
            return data;
        }},
        //if _ignoreMinChoice is turned to false, expect the expectedMaximumto be 2.8 instead of 3
        { title : 'associate - map - minAssociations=3', data : dataAssociateMap, expectedMaximum: 3, maxScore: 3, changeData : function(data){
            data.body.elements.interaction_associateinteraction_58fdfc915cb60553869971.attributes.minAssociations = 3;
            return data;
        }},
        //if _ignoreMinChoice is turned to false, expect the expectedMaximumto be 2.4 instead of 3
        { title : 'associate - map - minAssociations=5', data : dataAssociateMap, expectedMaximum: 3, maxScore: 3, changeData : function(data){
            data.body.elements.interaction_associateinteraction_58fdfc915cb60553869971.attributes.minAssociations = 5;
            return data;
        }},
        { title : 'associate - map - map default > 0', data : dataAssociateMap, expectedMaximum: 5, maxScore: 5, changeData : function(data){
            data.responses.responsedeclaration_58fdfc91590be744736300.mappingAttributes.defaultValue = 1;
            data.body.elements.interaction_associateinteraction_58fdfc915cb60553869971.attributes.maxAssociations = 4;
            return data;
        }},
        { title : 'match - correct', data : dataMatchCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'match - map', data : dataMatchMap, expectedMaximum: 3.25, maxScore: 3.25},
        { title : 'graphic associate - correct', data : dataGraphicAssociateCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'graphic associate - map', data : dataGraphicAssociateMap, expectedMaximum: 1.2, maxScore: 1.2},
        { title : 'graphic gap match - correct', data : dataGraphicGapCorrect, expectedMaximum: 1, maxScore: 1},
        { title : 'graphic gap match - map', data : dataGraphicGapMap, expectedMaximum: 2.5, maxScore: 2.5},
        { title : 'associate - match max - favorable mapping', data : dataAssociateMatchmax, expectedMaximum: 15, maxScore: 15},
        { title : 'associate - match max - favorable mapping disrupt', data : dataAssociateMatchmax, expectedMaximum: 14, maxScore: 14, changeData : function(data){
            data.responses.responsedeclaration_592c14d47a3b5383510187.mapping['choice_1 choice_2'] = 5;//mess up the order
            delete data.responses.responsedeclaration_592c14d47a3b5383510187.mapping['choice_3 choice_5'];
            return data;
        }},
        { title : 'associate - match max - unfavorable mapping', data : dataAssociateMatchmax, expectedMaximum: 11, maxScore: 11, changeData : function(data){
            data.responses.responsedeclaration_592c14d47a3b5383510187.mapping['choice_3 choice_5'] = 0.5;
            return data;
        }},
        { title : 'associate - match max - unfavorable mapping', data : dataAssociateMatchmax, expectedMaximum: 11, maxScore: 11, changeData : function(data){
            data.responses.responsedeclaration_592c14d47a3b5383510187.mapping['choice_1 choice_1'] = 100;//impossible
            delete data.responses.responsedeclaration_592c14d47a3b5383510187.mapping['choice_3 choice_5'];
            return data;
        }},
        { title : 'match - match max - favorable mapping', data : dataMatchMatchmax, expectedMaximum: 17, maxScore: 17},
        { title : 'gap match - match max = 0 - favorable mapping', data : dataGapMatchMatchmax, expectedMaximum: 4, maxScore: 4},
        { title : 'gap match - match max = 1 - neutral mapping', data : dataGapMatchMapMatchmax, expectedMaximum: 6, maxScore: 6},
        { title : 'gap match - inifinite score', data : dataGapMatchInfinite, expectedMaximum: undefined, maxScore: undefined},
        { title : 'gap association - match max - favorable mapping', data : dataGraphicAssocMatchmax, expectedMaximum: 5, maxScore: 5}
    ];

    QUnit
        .cases(cases)
        .asyncTest('setNormalMaximum', function(settings, assert){

        var loader = new Loader();
        var data = _.cloneDeep(settings.data);

        if(_.isFunction(settings.changeData)){
            data = settings.changeData(data);
        }

        loader.loadItemData(data, function(item){

            var outcomeScore, outcomeMaxScore;

            QUnit.start();
            assert.ok(Element.isA(item, 'assessmentItem'), 'item loaded');

            outcomeScore = item.getOutcomeDeclaration('SCORE');
            assert.ok(_.isUndefined(outcomeScore.attr('normalMaximum')), 'normalMaximum initially undefined');

            maxScore.setNormalMaximum(item);
            assert.equal(outcomeScore.attr('normalMaximum'), settings.expectedMaximum, 'calculated normalMaximum is correct');

            maxScore.setMaxScore(item);
            if(!_.isUndefined(settings.maxScore)){
                QUnit.expect(5);
                outcomeMaxScore = item.getOutcomeDeclaration('MAXSCORE');
                assert.ok(Element.isA(outcomeMaxScore, 'outcomeDeclaration'), 'MAXSCORE outcome exists');
                assert.equal(outcomeMaxScore.getDefaultValue(), settings.maxScore);
            }else{
                QUnit.expect(4);
                assert.ok(_.isUndefined(item.getOutcomeDeclaration('MAXSCORE')), 'MAXSCORE undefined');
            }
        });
    });

});

