define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'json!taoQtiItem/test/samples/json/inlineModalFeedback.json'
], function($, _, QtiLoader, QtiRenderer, itemData){

    var containerId = 'item-container';

    QUnit.module('HTML rendering');

    QUnit.asyncTest('renders an item', function(assert){
        QUnit.expect(5);

        var renderer = new QtiRenderer({ baseUrl : './'});

        new QtiLoader().loadItemData(itemData, function(item){
            renderer.load(function(){
                var result, $result;

                item.setRenderer(this);

                result = item.render({});

                assert.ok(typeof result === 'string', 'The renderer creates a string');
                assert.ok(result.length > 0, 'The renderer create some output');

                $result = $(result);

                assert.ok($result.hasClass('qti-item'), 'The result is a qti item');
                assert.equal($('.qti-itemBody', $result).length, 1, 'The result contains an item body');
                assert.equal($('.qti-choiceInteraction', $result).length, 1, 'The result contains a choice interaction');

                QUnit.start();

            }, this.getLoadedClasses());
        });
    });

});

