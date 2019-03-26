define([

    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'json!taoQtiItem/test/samples/json/with-stimulus.json'
], function($, _, QtiLoader, QtiRenderer, itemData) {
    'use strict';

    QUnit.module('HTML rendering');

    QUnit.test('renders an item', function(assert) {
        var ready = assert.async();
        var renderer = new QtiRenderer({baseUrl: './'});

        assert.expect(6);

        new QtiLoader().loadItemData(itemData, function(item) {
            renderer.load(function() {
                var result, $result;

                item.setRenderer(this);

                result = item.render({});

                assert.ok(typeof result === 'string', 'The renderer creates a string');
                assert.ok(result.length > 0, 'The renderer create some output');

                $result = $(result);

                assert.ok($result.hasClass('qti-item'), 'The result is a qti item');
                assert.equal($('.qti-itemBody', $result).length, 1, 'The result contains an item body');
                assert.equal($('.qti-include', $result).length, 1, 'The result contains a qti include');
                assert.equal($('.qti-include', $result).data('href'), 'taomedia://mediamanager/http_2_tao12_0_local_1_first_0_rdf_3_i1550672688604730', 'The qti include has the expected href attribute');

                ready();

            }, this.getLoadedClasses());
        });
    });

});
