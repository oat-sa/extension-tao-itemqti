define([
    'taoQtiItem/qtiXmlRenderer/renderers/Container'
], function (ContainerRenderer) {
    'use strict';

    const { wrapMediaElements } = ContainerRenderer;

    // QUnit.module('Container renderer - wrapMediaElements');

    // QUnit.test('returns non-string input untouched', function (assert) {
    //     assert.strictEqual(wrapMediaElements(null), null, 'null stays null');

    //     const obj = { foo: 'bar' };
    //     assert.strictEqual(wrapMediaElements(obj), obj, 'non-string object is returned as-is');
    // });

    // QUnit.test('preserves existing markup when no top-level media elements', function (assert) {
    //     const input =
    //         '<div class="grid-row"><div class="col-12"><hottextInteraction maxChoices="0" responseIdentifier="RESPONSE">' +
    //         '<prompt /><p>Sample text</p><div><object data="media://foo" type="audio/mpeg"></object></div>' +
    //         '</hottextInteraction></div></div>';

    //     const output = wrapMediaElements(input);
    //     assert.ok(output.indexOf('<hottextInteraction') > -1, 'interaction stays intact');

    //     const doc = new DOMParser().parseFromString(`<root>${output}</root>`, 'application/xml');

    //     const promptNodes = doc.getElementsByTagName('prompt');
    //     assert.strictEqual(promptNodes.length, 1, 'prompt element still present');
    //     assert.strictEqual(promptNodes[0].childNodes.length, 0, 'prompt remains self-closing');

    //     const objectNodes = doc.getElementsByTagName('object');
    //     assert.strictEqual(objectNodes.length, 1, 'nested media element preserved');
    //     assert.strictEqual(objectNodes[0].parentNode.tagName, 'div', 'nested object still inside original div');
    // });

    // QUnit.test('wraps top-level media elements with div while preserving attributes', function (assert) {
    //     const input =
    //         '<object data="media://top-level-object" type="audio/mpeg"></object>' +
    //         '<img src="media://image.png" alt="sample" />' +
    //         '<p>After media</p>';

    //     const output = wrapMediaElements(input);

    //     const doc = new DOMParser().parseFromString(`<root>${output}</root>`, 'application/xml');
    //     const root = doc.documentElement;

    //     const firstChild = root.firstElementChild;
    //     assert.ok(firstChild, 'first child exists');
    //     assert.strictEqual(firstChild.tagName, 'div', 'first child is wrapping div');
    //     assert.strictEqual(firstChild.getAttribute('class'), 'qti-media-wrapper', 'wrapper gets expected class');

    //     const wrappedObject = firstChild.firstElementChild;
    //     assert.strictEqual(wrappedObject.tagName, 'object', 'object node is inside wrapper');
    //     assert.strictEqual(wrappedObject.getAttribute('data'), 'media://top-level-object', 'object data preserved');
    //     assert.strictEqual(wrappedObject.getAttribute('type'), 'audio/mpeg', 'object type preserved');

    //     const secondChild = firstChild.nextElementSibling;
    //     assert.ok(secondChild, 'there is a second child after the first wrapper');
    //     assert.strictEqual(secondChild.tagName, 'div', 'second top-level media is wrapped in div');

    //     const wrappedImg = secondChild.firstElementChild;
    //     assert.strictEqual(wrappedImg.tagName, 'img', 'img node is inside wrapper');
    //     assert.strictEqual(wrappedImg.getAttribute('src'), 'media://image.png', 'img src preserved');
    //     assert.strictEqual(wrappedImg.getAttribute('alt'), 'sample', 'img alt preserved');

    //     const trailingParagraph = secondChild.nextElementSibling;
    //     assert.strictEqual(trailingParagraph.tagName, 'p', 'non-media node order preserved');
    //     assert.strictEqual(trailingParagraph.textContent, 'After media', 'paragraph content preserved');
    // });
});
