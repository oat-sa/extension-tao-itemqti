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
 * Copyright (c) 2015-2018 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'lodash',
    'taoItems/scoring/api/scorer',
    'taoQtiItem/scoring/provider/qti',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'json!taoQtiItem/test/samples/json/space-shuttle-m.json',
    'json!taoQtiItem/test/samples/json/characters.json',
    'json!taoQtiItem/test/samples/json/edinburgh.json',
    'json!taoQtiItem/test/samples/json/customrp/Choicemultiple_2014410822.json',
    'json!taoQtiItem/test/samples/json/customrp/TextEntrynumeric_770468849.json',
    'json!taoQtiItem/test/samples/json/customrp/Choicemultiple_871212949.json',
    'json!taoQtiItem/test/samples/json/customrp/Matchsingle_143114773.json',
    'json!taoQtiItem/test/samples/json/customrp/order.json',
    'json!taoQtiItem/test/samples/json/es6.json',
    'json!taoQtiItem/test/samples/json/pluto.json',
    'json!taoQtiItem/test/samples/json/customrp/andAnd.json',
    'json!taoQtiItem/test/samples/json/customrp/custom_record.json'
], function(_, scorer, qtiScoringProvider,
    singleCorrectData,
    multipleCorrectData,
    multipleMapData,
    singleMapPointData,
    customChoiceMultipleData,
    customTextEntryNumericData,
    customChoiceMultipleData2,
    customChoiceSingleData,
    orderData,
    multipleResponseCorrectData,
    embedConditionsData,
    andAndData,
    customRecordData
){
    'use strict';

    QUnit.module('Provider API');

    QUnit.test('module', function(assert){
        assert.ok(typeof qtiScoringProvider !== 'undefined', "The module exports something");
        assert.ok(typeof qtiScoringProvider === 'object', "The module exports an object");
        assert.ok(typeof qtiScoringProvider.process === 'function', "The module exposes a process method");
    });


    QUnit.module('Register the provider', {
        teardown : function(){
            //reset the provider
            scorer.providers = undefined;
        }
    });

    QUnit.test('register the qti provider', function(assert){
        QUnit.expect(4);

        assert.ok(typeof scorer.providers === 'undefined', 'the scorer has: no providers');

        scorer.register('qti', qtiScoringProvider);

        assert.ok(typeof scorer.providers === 'object', 'the scorer has now providers');
        assert.ok(typeof scorer.providers.qti === 'object', 'the scorer has now the qti providers');
        assert.equal(scorer.providers.qti, qtiScoringProvider, 'the scorer has now the qti providers');

    });

    QUnit.module('Without processing', {
        teardown : function(){
            //reset the provides
            scorer.providers = undefined;
        }
    });

    QUnit.asyncTest('default outcomes', function(assert){
        var responses =   {
            "RESPONSE": {
                "base": {
                    "identifier": "Discovery"
                }
            }
        };

        var noRulesItemData = _.cloneDeep(singleCorrectData);

        QUnit.expect(10);

        noRulesItemData.responseProcessing.responseRules = [];

        scorer.register('qti', qtiScoringProvider);

        scorer('qti')
            .on('error', function(err){
                assert.ok(false, 'Got an error : ' + err);
            })
            .on('outcome', function(outcomes, state){

                assert.ok(typeof outcomes === 'object', "the outcomes are an object");
                assert.ok(typeof outcomes.RESPONSE === 'object', "the outcomes contains the response");
                assert.deepEqual(outcomes.RESPONSE, responses.RESPONSE, "the response is the same");
                assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
                assert.deepEqual(outcomes.SCORE, { base : { integer : 0 } }, "the score has the default value");

                assert.ok(typeof state === 'object', "the state is an object");
                assert.ok(typeof state.RESPONSE === 'object', "the state contains the RESPONSE variable");
                assert.deepEqual(state.RESPONSE, {
                    cardinality: "single",
                    baseType: "identifier",
                    correctResponse: ["Atlantis"],
                    defaultValue: undefined,
                    mapping: undefined,
                    value: "Discovery"
                }, "the RESPONSE variable matches");
                assert.ok(typeof state.SCORE === 'object', "the state contains the SCORE variable");
                assert.deepEqual(state.SCORE, {
                    cardinality: "single",
                    baseType: "integer",
                    defaultValue: "0",
                    value: 0
                }, "the SCORE variable matches");

                QUnit.start();
            })
            .process(responses, noRulesItemData);
    });

    QUnit.asyncTest('No responseProcessing', function(assert){
        var noRPItemData = _.cloneDeep(singleCorrectData);

        QUnit.expect(3);

        assert.equal(noRPItemData.identifier, 'space-shuttle-30-years-of-adventure', 'The item has the expected identifier');
        delete noRPItemData.responseProcessing;

        scorer.register('qti', qtiScoringProvider);

        scorer('qti')
            .on('error', function(err){
                assert.ok(err instanceof Error, 'Got an Error');
                assert.equal(err.message, 'The item space-shuttle-30-years-of-adventure has not responseProcessing', 'The error is about responseProcessing');
                QUnit.start();
            })
            .process({}, noRPItemData);
    });

    QUnit.module('Provider process correct template', {
        teardown : function(){
            //reset the provides
            delete scorer.providers;
        }
    });


    QUnit.cases([{
        title   : 'match correct single identifier',
        item    : singleCorrectData,
        outcomes : {
            RESPONSE : { base : { identifier: "Atlantis" } },
            SCORE    : { base : { integer : 1 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "single",
                "baseType": "identifier",
                "value": "Atlantis"
            },
            SCORE: { value: 1 }
        }
    }, {
        title   : 'match incorrect single identifier',
        item    : singleCorrectData,
        outcomes : {
            RESPONSE : { base : { identifier: "Discovery" } },
            SCORE    : { base : { integer : 0 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "single",
                "baseType": "identifier",
                "value": "Discovery"
            },
            SCORE: { value: 0 }
        }
    }, {
        title   : 'match correct multiple identifier',
        item    : multipleCorrectData,
        outcomes : {
            RESPONSE : { list : { identifier: ["Pathfinder", "Atlantis"]   } },
            SCORE    : { base : { integer : 1 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "multiple",
                "baseType": "identifier",
                "value": ["Pathfinder", "Atlantis"]
            },
            SCORE: { value: 1 }
        }
    }, {
        title   : 'match incorrect multiple identifier',
        item    : multipleCorrectData,
        outcomes : {
            RESPONSE : { list : { identifier:  ["Atlantis", "Discovery"] } },
            SCORE    : { base : { integer : 0 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "multiple",
                "baseType": "identifier",
                "value": ["Atlantis", "Discovery"]
            },
            SCORE: { value: 0 }
        }
    }, {
        title   : 'map response multiple directedPair',
        item    : multipleMapData,
        outcomes : {
            RESPONSE : { list : { directedPair:  [['C', 'R'], ['D', 'M']] } },
            SCORE    : { base : { float : 1.5 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "multiple",
                "baseType": "directedPair",
                "value": [ ["C", "R"], ["D", "M"] ]
            },
            SCORE: { value: 1.5 }
        }
    }, {
        title   : 'incorrect map response multiple directedPair',
        item    : multipleMapData,
        outcomes : {
            RESPONSE : { list : { directedPair:  [['M', 'D'], ['R', 'M']] } },
            SCORE    : { base : {  float : 0} },
        },
        state : {
            RESPONSE: {
                "cardinality": "multiple",
                "baseType": "directedPair",
                "value": [['M', 'D'], ['R', 'M']]
            },
            SCORE: { value: 0 }
        }
    }, {
        title   : 'map response  point inside',
        item    : singleMapPointData,
        outcomes : {
            RESPONSE : { base : { point:  [102, 113]  } },
            SCORE    : { base : { float : 1 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "single",
                "baseType": "point",
                "value": [102, 113]
            },
            SCORE: { value: 1 }
        }
    }, {
        title   : 'map response  point outside',
        item    : singleMapPointData,
        outcomes : {
            RESPONSE : { base : { point:  [145, 190]  } },
            SCORE    : { base : { float : 0 } },
        },
        state : {
            RESPONSE: {
                "cardinality": "single",
                "baseType": "point",
                "value": [145, 190]
            },
            SCORE: { value: 0 }
        }
    }]).asyncTest('process ', function(data, assert){

        QUnit.expect(8);

        scorer.register('qti', qtiScoringProvider);

        scorer('qti')
            .on('error', function(err){
                assert.ok(false, 'Got an error : ' + err);
            })
            .on('outcome', function(outcomes, state){

                assert.deepEqual(outcomes, data.outcomes, 'Generated outcomes matche');

                assert.ok(typeof state === 'object', 'The generated state is an object');

                //check RESPONSE variable cardinality, baseType and value
                assert.ok(typeof state.RESPONSE === 'object', 'The generated state contains a RESPONSE variable');
                assert.equal(state.RESPONSE.cardinality, data.state.RESPONSE.cardinality, 'The RESPONSE cardinality is correct');
                assert.equal(state.RESPONSE.baseType, data.state.RESPONSE.baseType, 'The RESPONSE baseType is correct');
                assert.deepEqual(state.RESPONSE.value, data.state.RESPONSE.value, 'The RESPONSE value is correct');

                //check only SCORE value
                assert.ok(typeof state.SCORE === 'object', 'The generated state contains a SCORE variable');
                assert.equal(state.SCORE.value, data.state.SCORE.value, 'The score matches the expected value');

                QUnit.start();
            })
            .process({
                RESPONSE : data.outcomes.RESPONSE
            }, data.item);
    });

    QUnit.asyncTest('process multiple responses', function(assert){

            QUnit.expect(7);

            var responses = {
                'RESPONSE' : { list : { identifier : ["choice_3"] } },
                'RESPONSE_1' : { base : { identifier : "choice_7" } },
            };
            scorer.register('qti', qtiScoringProvider);

            scorer('qti')
                .on('error', function(err){
                    assert.ok(false, 'Got an error : ' + err);
                })
                .on('outcome', function(outcomes){

                    assert.ok(typeof outcomes === 'object', "the outcomes are an object");
                    assert.ok(typeof outcomes.RESPONSE === 'object', "the outcomes contains the response");
                    assert.deepEqual(outcomes.RESPONSE, responses.RESPONSE, "the response is the same");
                    assert.ok(typeof outcomes.RESPONSE_1 === 'object', "the outcomes contains the response");
                    assert.deepEqual(outcomes.RESPONSE_1, responses.RESPONSE_1, "the response is the same");
                    assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
                    assert.deepEqual(outcomes.SCORE, { base : { float : 2 } }, "the score has the correct value");

                    QUnit.start();
                })
                .process(responses, multipleResponseCorrectData);
    });

    QUnit.asyncTest('process multiple responses one is empty', function(assert){

            QUnit.expect(7);

            var responses = {
                'RESPONSE' : { list : { identifier : ["choice_3"] } },
                'RESPONSE_1' : { base : null }
            };
            scorer.register('qti', qtiScoringProvider);

            scorer('qti')
                .on('error', function(err){
                    assert.ok(false, 'Got an error : ' + err);
                })
                .on('outcome', function(outcomes){

                    assert.ok(typeof outcomes === 'object', "the outcomes are an object");
                    assert.ok(typeof outcomes.RESPONSE === 'object', "the outcomes contains the response");
                    assert.deepEqual(outcomes.RESPONSE, responses.RESPONSE, "the response is the same");
                    assert.ok(typeof outcomes.RESPONSE_1 === 'object', "the outcomes contains the response");
                    assert.deepEqual(outcomes.RESPONSE_1, responses.RESPONSE_1, "the response is the same");
                    assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
                    assert.deepEqual(outcomes.SCORE, { base : { float : 1 } }, "the score has the correct value");

                    QUnit.start();
                })
                .process(responses, multipleResponseCorrectData);
    });

    QUnit.module('Custom template', {
        teardown : function(){
            //reset the provides
            scorer.providers = undefined;
        }
    });


    var customDataProvider = [{
        title   : 'choice multiple correct',
        item    : customChoiceMultipleData,
        resp    : { RESPONSE_13390220 : { list : { identifier: ['choice_693643701', 'choice_853818748'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 1 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'correct' } }
        }
    }, {
        title   : 'choice multiple incorrect',
        item    : customChoiceMultipleData,
        resp    : { RESPONSE_13390220 : { list : { identifier: ['choice_853818748'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 0 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'incorrect' } }
        }
    }, {
        title   : 'single numeric text entry exact',
        item    : customTextEntryNumericData,
        resp    : { RESPONSE_1 : { base : { float: 4.136 } } },
        outcomes : {
            SCORE : { base : { 'float' : 1 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'correct' } }
        }
    }, {
        title   : 'single numeric text entry pretty correct',
        item    : customTextEntryNumericData,
        resp    : { RESPONSE_1 : { base : { float: 4.132 } } },
        outcomes : {
            SCORE : { base : { 'float' : 1 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'correct' } }
        }
    }, {
        title   : 'single numeric text entry incorrect',
        item    : customTextEntryNumericData,
        resp    : { RESPONSE_1 : { base : { float: 5.8756 } } },
        outcomes : {
            SCORE : { base : { 'float' : 0 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'incorrect' } }
        }
    },{
        title   : 'choice multiple correct',
        item    : customChoiceMultipleData2,
        resp    : { RESPONSE_27966883 : { list : { identifier: ['choice_934383202', 'choice_2022864592','choice_1534527094'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 3 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'correct' } }
        }
    }, {
        title   : 'choice multiple incorrect',
        item    : customChoiceMultipleData2,
        resp    : { RESPONSE_27966883 : { list : { identifier: ['choice_921260236'] } } },
        outcomes : {
            SCORE : { base : { 'float' : -1 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'incorrect' } }
        }
    },{
        title   : 'choice directed pair multiple correct',
        item    : customChoiceSingleData,
        resp    : { RESPONSE : { list : { directedPair: [ 'Match29886762 Match30518135', 'Match5256823 Match2607634', 'Match4430647 Match8604807', 'Match1403839 Match5570831'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 1 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'correct' } }
        }
    }, {
        title   : 'choice directed pair multiple incorrect',
        item    : customChoiceSingleData,
        resp    : { RESPONSE : { list : { directedPair: [ 'Match29886762 Match30518135', 'Match2607634 Match5256823', 'Match4430647 Match8604807', 'Match1403839 Match5570831'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 0 } },
            FEEDBACKBASIC : { base : { 'identifier' : 'incorrect' } }
        }
    },{
        title   : 'ordered correct',
        item    : orderData,
        resp    : { RESPONSE : { list : { identifier: [  'DriverC', 'DriverA', 'DriverB'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 1 } }
        }
    }, {
        title   : 'ordered incorrect',
        item    : orderData,
        resp    : { RESPONSE : { list : { identifier: [  'DriverC', 'DriverAS', 'DriverB'] } } },
        outcomes : {
            SCORE : { base : { 'float' : 0 } }
        }
    }, {
        title   : 'embed conditions correct',
        item    : embedConditionsData.data,
        resp    : {
            RESPONSE   : { base : { identifier: 'choice_1' } },
            RESPONSE_1 : { base : { identifier: 'choice_6' } },
        },
        outcomes : {
            SCORE : { base : { 'float' : 2 } }
        }
    }, {
        title   : 'embed conditions  first correct',
        item    : embedConditionsData.data,
        resp    : {
            RESPONSE   : { base : { identifier: 'choice_1' } },
            RESPONSE_1 : { base : { identifier: 'choice_7' } },
        },
        outcomes : {
            SCORE : { base : { 'float' : 1 } }
        }
    }, {
        title   : 'embed conditions 2nd correct',
        item    : embedConditionsData.data,
        resp    : {
            RESPONSE   : { base : { identifier: 'choice_2' } },
            RESPONSE_1 : { base : { identifier: 'choice_6' } },
        },
        outcomes : {
            SCORE : { base : { 'float' : 0 } }
        }
    }, {
        title   : 'embed conditions 2nd null',
        item    : embedConditionsData.data,
        resp    : {
            RESPONSE   : { base : { identifier: 'choice_1' } },
            RESPONSE_1 : { base : null },
        },
        outcomes : {
            SCORE : { base : { 'float' : 1 } }
        }
    }, {
        title   : 'embed conditions null',
        item    : embedConditionsData.data,
        resp    : {
            RESPONSE   : { base : null },
            RESPONSE_1 : { base : null },
        },
        outcomes : {
            SCORE : { base : { 'float' : 0 } }
        }
     }, {
        title   : 'nested and incorrect',
        item    : andAndData.data,
        resp    : {
            RESPONSE   : { base : { float: 1.234 } },
            RESPONSE_2 : { base : { float: 42 }  },
        },
        outcomes : {
            SCORE : { base : { 'float' : 0 } }
        }
     }, {
        title   : 'nested and correct',
        item    : andAndData.data,
        resp    : {
            RESPONSE   : { base : { float: 1234 } },
            RESPONSE_2 : { base : { float: 42 }  },
        },
        outcomes : {
            SCORE : { base : { 'float' : 1 } }
        }
    }, {
        title   : 'custom record',
        item    : customRecordData.data,
        resp    : {
            RESPONSE   : { record : [{
                name : 'fieldA',
                base : {string : 'yes'}
            }] }
        },
        outcomes : {
            SCORE : { base : { 'float' : 2 } }
        }
    }];

    QUnit
        .cases(customDataProvider)
        .asyncTest('process ', function(data, assert){

            scorer.register('qti', qtiScoringProvider);

            scorer('qti')
                .on('error', function(err){
                    assert.ok(false, 'Got an error : ' + err);
                })
                .on('outcome', function(outcomes){

                    assert.ok(typeof outcomes === 'object', "the outcomes are an object");

                    _.forEach(data.outcomes, function(outcome, name){
                        assert.deepEqual(outcomes[name], outcome, "the outcome " + name + " is correct" );
                    });

                    QUnit.start();
                })
                .process(data.resp, data.item);
        });

});

