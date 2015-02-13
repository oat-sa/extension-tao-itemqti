define([
    'lodash',
    'taoItems/scoring/api/scorer',
    'taoQtiItem/scoring/provider/qti',
    'json!taoQtiItem/test/samples/json/space-shuttle.json'
], function(_, scorer, qtiScoringProvider, itemData){


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


    module('Provider process correct template', {
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

        var noRulesItemData = _.cloneDeep(itemData);
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
            assert.deepEqual(outcomes.SCORE, { base : { integer : '1' } }, "the score has the default value");

            QUnit.start();
          })
          .process(responses, itemData);
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
            assert.deepEqual(outcomes.SCORE, { base : { integer : '0' } }, "the score has the default value");

            QUnit.start();
          })
          .process(responses, itemData);
    });
});

