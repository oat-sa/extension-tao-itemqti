define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'core/mouseEvent',
    'ui/interactUtils',
    'json!taoQtiItem/test/qtiCommonRenderer/interactions/graphicGapMatch2/qti.json'
], function($, _, qtiItemRunner, triggerMouseEvent, interactUtils, gapMatchData){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'default',
        handle : function defaultStrategy(url){
            if(/assets/.test(url.toString())){
                return '../../taoQtiItem/views/js/test/qtiCommonRenderer/interactions/graphicGapMatch2/' + url.toString();
            }
            return url.toString();
        }
    }];

    QUnit.module('Graphic GapMatch Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        QUnit.expect(1);

        var $container = $('#' + outsideContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                QUnit.start();
            })
            .on('statechange', function(state){
                document.getElementById('response-display').textContent = JSON.stringify(state);
            })
            .assets(strategies)
            .init()
            .render($container);
    });
});

