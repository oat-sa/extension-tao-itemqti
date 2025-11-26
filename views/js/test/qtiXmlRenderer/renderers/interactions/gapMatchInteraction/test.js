define([
    'taoQtiItem/qtiXmlRenderer/renderers/interactions/GapMatchInteraction'
], function (GapMatchInteractionRenderer) {
    'use strict';

    QUnit.module('GapMatchInteraction renderer - getData wraps media elements');

    QUnit.test('getData wraps top-level media elements in body', function (assert) {
        const mockInteraction = {
            qtiClass: 'gapMatchInteraction'
        };

        const inputData = {
            body: '<p>Text before</p><img src="media://image.png" alt="test" /><p>Text after</p>'
        };

        const result = GapMatchInteractionRenderer.getData(mockInteraction, inputData);

        assert.ok(result, 'getData returns data');
        assert.ok(result.body, 'body is present in result');
        assert.ok(result.body.indexOf('qti-media-wrapper') > -1, 'body contains wrapper class');

        const doc = new DOMParser().parseFromString(`<root>${result.body}</root>`, 'application/xml');
        const wrappers = doc.getElementsByClassName('qti-media-wrapper');

        assert.strictEqual(wrappers.length, 1, 'one media wrapper created');

        const wrappedImg = wrappers[0].getElementsByTagName('img')[0];
        assert.ok(wrappedImg, 'img is inside wrapper');
        assert.strictEqual(wrappedImg.getAttribute('src'), 'media://image.png', 'img attributes preserved');
        assert.strictEqual(wrappedImg.getAttribute('alt'), 'test', 'img alt attribute preserved');
    });

    QUnit.test('getData wraps multiple top-level media elements', function (assert) {
        const mockInteraction = {
            qtiClass: 'gapMatchInteraction'
        };

        const inputData = {
            body: '<object data="media://video.mp4" type="video/mp4"></object><img src="media://pic.jpg" />'
        };

        const result = GapMatchInteractionRenderer.getData(mockInteraction, inputData);

        const doc = new DOMParser().parseFromString(`<root>${result.body}</root>`, 'application/xml');
        const wrappers = doc.getElementsByClassName('qti-media-wrapper');

        assert.strictEqual(wrappers.length, 2, 'two media wrappers created');

        const wrappedObject = wrappers[0].getElementsByTagName('object')[0];
        assert.ok(wrappedObject, 'object is wrapped');

        const wrappedImg = wrappers[1].getElementsByTagName('img')[0];
        assert.ok(wrappedImg, 'img is wrapped');
    });

    QUnit.test('getData preserves body without top-level media', function (assert) {
        const mockInteraction = {
            qtiClass: 'gapMatchInteraction'
        };

        const inputData = {
            body: '<p>Just text content</p><div><object data="nested.mp3" type="audio/mpeg"></object></div>'
        };

        const result = GapMatchInteractionRenderer.getData(mockInteraction, inputData);

        assert.ok(result, 'getData returns data');
        assert.ok(result.body, 'body is present in result');
        assert.strictEqual(result.body.indexOf('qti-media-wrapper'), -1, 'no wrapper added for nested media');
    });

    QUnit.test('getData handles empty or missing body', function (assert) {
        const mockInteraction = {
            qtiClass: 'gapMatchInteraction'
        };

        const emptyData = { body: '' };
        const result1 = GapMatchInteractionRenderer.getData(mockInteraction, emptyData);
        assert.strictEqual(result1.body, '', 'empty body returned as-is');

        const noBodyData = {};
        const result2 = GapMatchInteractionRenderer.getData(mockInteraction, noBodyData);
        assert.ok(result2, 'getData handles missing body');
    });
});
