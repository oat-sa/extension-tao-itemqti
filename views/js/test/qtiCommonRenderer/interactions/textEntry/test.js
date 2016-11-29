define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/text-entry-noconstraint.json',
    'json!taoQtiItem/test/samples/json/text-entry-length.json',
    'json!taoQtiItem/test/samples/json/text-entry-pattern.json',
], function($, _, qtiItemRunner, textEntryData, textEntryLengthConstrainedData, textEntryPatternConstrainedData){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    module('Choice Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        QUnit.expect(3);

        var $container = $('#' + outsideContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', textEntryLengthConstrainedData)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction.qti-textEntryInteraction').length, 1, 'the container contains a text entry interaction .qti-textEntryInteraction');

                QUnit.start();
            })
            .init()
            .render($container);
    });
});

