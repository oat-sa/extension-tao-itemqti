define([
    'jquery',
    'lodash',
    'context',
    'taoQtiItem/portableElementRegistry/factory/ciRegistry',
    'taoQtiItem/test/ciRegistry/data/testProvider',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function($, _, context, ciRegistry, testProvider, qtiElements){

    QUnit.module('Custom Interaction Registry');

    var testReviewApi = [
        {name : 'get', title : 'get'},
        {name : 'registerProvider', title : 'registerProvider'},
        {name : 'getAllVersions', title : 'getAllVersions'},
        {name : 'getRuntime', title : 'getRuntime'},
        {name : 'getCreator', title : 'getCreator'},
        {name : 'getBaseUrl', title : 'getBaseUrl'},
        {name : 'loadRuntimes', title : 'loadRuntimes'},
        {name : 'loadCreators', title : 'loadCreators'},
        {name : 'getAuthoringData', title : 'getAuthoringData'},
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function (data, assert){
            var registry = ciRegistry();
            assert.equal(typeof registry[data.name], 'function', 'The registry exposes a "' + data.title + '" function');
        });

    QUnit.asyncTest('load creator', function(assert){

        ciRegistry().on('creatorsloaded', function(){
            assert.ok(qtiElements.isBlock('customInteraction.samplePci'), 'sample ci loaded into model');
            QUnit.start();
        }).registerProvider('taoQtiItem/test/ciRegistry/data/testProvider').loadCreators(function(creators){
            assert.ok(_.isPlainObject(creators), 'creators loaded');
            assert.ok(_.isObject(creators.samplePci), 'sample ci creator loaded');
        });

    });

    QUnit.asyncTest('getAuthoringData', function(assert){

        ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider').loadCreators(function(){

            var authoringData = this.getAuthoringData('samplePci');

            assert.ok(_.isPlainObject(authoringData), 'authoring data is an object');
            assert.equal(authoringData.label, 'Sample Pci', 'label ok');
            assert.equal(authoringData.qtiClass, 'customInteraction.samplePci', 'qti class ok');
            assert.ok(authoringData.icon.indexOf('taoQtiItem/views/js/test/ciRegistry/data/samplePcicreator/img/icon.svg') > 0, 'label ok');

            QUnit.start();
        });

    });

    QUnit.asyncTest('error handling', function(assert){

        ciRegistry().on('error', function(message, id, version){
            assert.equal(id, 'inexistingCustomInteraction', 'correct error catched');
            assert.equal(version, '1.0.0', 'correct error catched');
            QUnit.start();
        }).getCreator('inexistingCustomInteraction', '1.0.0');
    });

});

