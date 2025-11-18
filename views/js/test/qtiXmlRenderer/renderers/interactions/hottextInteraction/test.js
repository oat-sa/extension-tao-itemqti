define([
    'taoQtiItem/qtiXmlRenderer/renderers/interactions/HottextInteraction'
], function (HottextInteractionRenderer) {
    'use strict';

    QUnit.module('HottextInteraction renderer - getData wraps media elements');

    QUnit.test('getData wraps top-level media elements in body', function (assert) {
        const mockInteraction = {
            qtiClass: 'hottextInteraction'
        };

        const inputData = {
            body: '<p>Text before</p><object data="media://audio.mp3" type="audio/mpeg"></object><p>Text after</p>'
        };

        const result = HottextInteractionRenderer.getData(mockInteraction, inputData);

        assert.ok(result, 'getData returns data');
        assert.ok(result.body, 'body is present in result');
        assert.ok(result.body.indexOf('qti-media-wrapper') > -1, 'body contains wrapper class');

        const doc = new DOMParser().parseFromString(`<root>${result.body}</root>`, 'application/xml');
        const wrappers = doc.getElementsByClassName('qti-media-wrapper');

        assert.strictEqual(wrappers.length, 1, 'one media wrapper created');

        const wrappedObject = wrappers[0].getElementsByTagName('object')[0];
        assert.ok(wrappedObject, 'object is inside wrapper');
        assert.strictEqual(wrappedObject.getAttribute('data'), 'media://audio.mp3', 'object attributes preserved');
    });

    QUnit.test('getData preserves body without top-level media', function (assert) {
        const mockInteraction = {
            qtiClass: 'hottextInteraction'
        };

        const inputData = {
            body: '<p>Just text content</p><div><img src="nested.png" /></div>'
        };

        const result = HottextInteractionRenderer.getData(mockInteraction, inputData);

        assert.ok(result, 'getData returns data');
        assert.ok(result.body, 'body is present in result');
        assert.strictEqual(result.body.indexOf('qti-media-wrapper'), -1, 'no wrapper added for nested media');
    });

    QUnit.test('getData handles empty or missing body', function (assert) {
        const mockInteraction = {
            qtiClass: 'hottextInteraction'
        };

        const emptyData = { body: '' };
        const result1 = HottextInteractionRenderer.getData(mockInteraction, emptyData);
        assert.strictEqual(result1.body, '', 'empty body returned as-is');

        const noBodyData = {};
        const result2 = HottextInteractionRenderer.getData(mockInteraction, noBodyData);
        assert.ok(result2, 'getData handles missing body');
    });
});
