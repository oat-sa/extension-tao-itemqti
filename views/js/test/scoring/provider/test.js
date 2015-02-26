define([
    'lodash',
    'taoItems/scoring/api/scorer',
    'taoQtiItem/scoring/provider/qti',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'json!taoQtiItem/test/samples/json/space-shuttle-m.json',
    'json!taoQtiItem/test/samples/json/characters.json',
    'json!taoQtiItem/test/samples/json/edinburgh.json',
], function(_, scorer, qtiScoringProvider, singleCorrectData, multipleCorrectData, multipleMapData, singleMapPointData){


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
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "base": {
                    "identifier": "Discovery"
                }
            }
        };

        var noRulesItemData = _.cloneDeep(singleCorrectData);
        noRulesItemData.responseProcessing.responseRules = [];

        scorer.register('qti', qtiScoringProvider);

        scorer('qti')
          .on('error', function(err){
            assert.ok(false, 'Got an error : ' + err);
          })
          .on('outcome', function(outcomes){

            assert.ok(typeof outcomes === 'object', "the outcomes are an object");
            assert.ok(typeof outcomes.RESPONSE === 'object', "the outcomes contains the response");
            assert.deepEqual(outcomes.RESPONSE, responses.RESPONSE, "the response is the same");
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { integer : '0' } }, "the score has the default value");

            QUnit.start();
          })
          .process(responses, noRulesItemData);
    });

    QUnit.asyncTest('No responseProcessing', function(assert){
        QUnit.expect(2);

        var noRPItemData = _.cloneDeep(singleCorrectData);
        delete noRPItemData.responseProcessing;

        scorer.register('qti', qtiScoringProvider);

        scorer('qti')
          .on('error', function(err){
            assert.ok(err instanceof Error, 'Got an Error');
            assert.equal(err.message, 'The given item has not responseProcessing', 'The error is about responseProcessing');
            QUnit.start();
          })
          .process({}, noRPItemData);
    });

    QUnit.module('Provider process correct template', {
        teardown : function(){
            //reset the provides
            scorer.providers = undefined;
        }
    });

/*
    QUnit.asyncTest('correct response', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "base": {
                    "identifier": "Atlantis"
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { integer : 1 } }, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, singleCorrectData);
    });


    QUnit.asyncTest('incorrect response', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "base": {
                    "identifier": "Discovery"
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { integer : 0 } }, "the score has the default value");

            QUnit.start();
          })
          .process(responses, singleCorrectData);
    });


    QUnit.asyncTest('multiple cardinality correct response', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "list": {
                    "identifier": ["Pathfinder", "Atlantis"]
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { integer : 1 } }, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, multipleCorrectData);
    });

    QUnit.asyncTest('multiple cardinality map response', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "list": {
                    "directedPair": [['C', 'R'], ['D', 'M']]
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { float : 1.5 } }, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, multipleMapData);
    });

    QUnit.asyncTest('single cardinality map response inside point', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "base": {
                    "point": [102, 113]
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { float : 1 } }, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, singleMapPointData);
    });

    QUnit.asyncTest('single cardinality map response point', function(assert){
        QUnit.expect(5);

        var responses =   {
            "RESPONSE": {
                "base": {
                    "point": [102, 113]
                }
            }
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, { base : { float : 1 } }, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, singleMapPointData);
    });
*/

    QUnit.module('templates');

    var tplDataProvider = [{
        title   : 'match correct single identifier',
        item    : singleCorrectData,
        resp    : { base : { identifier: "Atlantis" } },
        score   : { base : { integer : 1 } }
    }, {
        title   : 'match incorrect single identifier',
        item    : singleCorrectData,
        resp    : { base : { identifier: "Discovery" } },
        score   : { base : { integer : 0 } }
    }, {
        title   : 'match correct multiple identifier',
        item    : multipleCorrectData,
        resp    : { list : { identifier: ["Pathfinder", "Atlantis"] } },
        score   : { base : { integer : 1 } }
    }, {
        title   : 'match incorrect multiple identifier',
        item    : multipleCorrectData,
        resp    : { list : { identifier: ["Atlantis", "Discovery"] } },
        score   : { base : { integer : 0 } }
    }, {
        title   : 'map response multiple directedPair',
        item    : multipleMapData,
        resp    : { list : { directedPair:  [['C', 'R'], ['D', 'M']] } },
        score   : { base : { float : 1.5 } }
    }, {
        title   : 'incorrect map response multiple directedPair',
        item    : multipleMapData,
        resp    : { list : { directedPair:  [['M', 'D'], ['R', 'M']] } },
        score   : { base : { float : 0 } }
    }, {
        title   : 'incorrect map response multiple directedPair',
        item    : multipleMapData,
        resp    : { list : { directedPair:  [['M', 'D'], ['R', 'M']] } },
        score   : { base : { float : 0 } }
    }, {
        title   : 'map response  point inside',
        item    : singleMapPointData,
        resp    : { base : { point:  [102, 113] } },
        score   : { base : { float : 1 } }
    }, {
        title   : 'map response  point outside',
        item    : singleMapPointData,
        resp    : { base : { point:  [145, 190] } },
        score   : { base : { float : 0 } }
    }];

    QUnit
      .cases(tplDataProvider)
      .asyncTest('process ', function(data, assert){

        var responses = {
            'RESPONSE' : data.resp
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
            assert.ok(typeof outcomes.SCORE === 'object', "the outcomes contains the score");
            assert.deepEqual(outcomes.SCORE, data.score, "the score has the correct value");

            QUnit.start();
          })
          .process(responses, data.item);
    });
});

