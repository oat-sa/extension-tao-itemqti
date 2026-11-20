/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA.
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, itemLoader, itemData) {
    'use strict';

    QUnit.module('itemLoader', {
        beforeEach() {
            $.mockjaxSettings.logger = null;
            $.mockjaxSettings.responseTime = 1;
            $.mockjax({
                url: 'undefined/tao/Languages/index',
                status: 200,
                responseText: {
                    success: true,
                    data: []
                }
            });
        },
        afterEach() {
            $.mockjax.clear();
        }
    });

    QUnit.test('uses the resource language for a new item', assert => {
        const ready = assert.async();

        assert.expect(1);
        $.mockjax({
            url: /mockNewItemEndpoint/,
            status: 200,
            responseText: {
                itemData: {
                    identifier: 'item-1'
                },
                language: 'pl-PL'
            }
        });
        itemLoader.loadItem(
            {
                uri: 'item-uri',
                label: 'Polish item',
                itemDataUrl: 'mockNewItemEndpoint'
            },
            item => {
                assert.strictEqual(item.attr('xml:lang'), 'pl-PL', 'the QTI language matches the resource language');
                ready();
            }
        );
    });

    QUnit.test('uses the resource language for an existing item', assert => {
        const ready = assert.async();

        assert.expect(1);
        $.mockjax({
            url: /mockExistingItemEndpoint/,
            status: 200,
            responseText: {
                itemData,
                language: 'de-DE'
            }
        });
        itemLoader.loadItem(
            {
                uri: 'item-uri',
                label: 'German item',
                itemDataUrl: 'mockExistingItemEndpoint'
            },
            item => {
                assert.strictEqual(item.attr('xml:lang'), 'de-DE', 'the RDF language replaces the stored QTI language');
                ready();
            }
        );
    });

    QUnit.test('opening imported oversized alternatives truncates only the editable model', assert => {
        const done = assert.async();
        const imported = JSON.parse(JSON.stringify(itemData));
        const longText = `${'🌍'.repeat(199)}<&é`;
        imported.body.elements.imported_image = {
            qtiClass: 'img', serial: 'imported_image',
            attributes: { src: 'image.png', alt: longText }
        };
        imported.body.elements.imported_media = {
            qtiClass: 'mediaInteraction', serial: 'imported_media',
            attributes: { responseIdentifier: 'RESPONSE' },
            object: {
                qtiClass: 'object', attributes: { data: 'video.mp4', type: 'video/mp4' },
                _alt: `<span class="legacy">Preserved</span><span class="tao-multimedia-video-description">${'é'.repeat(5000)}</span>`
            }
        };
        imported.body.elements.imported_video = {
            qtiClass: 'object', serial: 'imported_video',
            attributes: { data: 'inserted.mp4', type: 'video/mp4' },
            _alt: `<span class="legacy">Standalone fallback</span><span class="tao-multimedia-video-description">${'🌍'.repeat(201)}</span>`
        };
        imported.body.body += '{{imported_image}}{{imported_media}}{{imported_video}}';
        const stored = JSON.stringify(imported);
        let writes = 0;
        $.mockjax({
            url: /mockImportedAltText/,
            type: 'GET',
            responseText: { itemData: JSON.parse(stored), language: 'en-US' }
        });
        $.mockjax({
            url: /.*/,
            type: 'POST',
            response() {
                writes++;
            }
        });
        itemLoader.loadItem({
            uri: 'imported-item-uri', label: 'Imported item', itemDataUrl: 'mockImportedAltText'
        }, item => {
            const elements = item.getComposingElements();
            assert.strictEqual(elements.imported_image.attr('alt'), `${'🌍'.repeat(199)}<`);
            assert.strictEqual(elements.imported_media.object.description(), 'é'.repeat(200));
            assert.ok(elements.imported_media.object._alt.includes('Preserved'));
            assert.strictEqual(elements.imported_video.description(), '🌍'.repeat(200), 'Standalone video fallback is loaded before truncation');
            assert.ok(String(elements.imported_video._alt).includes('Standalone fallback'), 'Unrelated standalone fallback survives');
            assert.strictEqual(elements.imported_video.data('altTextTruncatedFrom'), 201);
            assert.strictEqual(elements.imported_image.data('altTextTruncatedFrom'), 202);
            assert.strictEqual(elements.imported_media.object.data('altTextTruncatedFrom'), 5000);
            assert.strictEqual(item.data('altTextTruncated'), 3, 'Unopened properties were normalized');
            assert.strictEqual(writes, 0, 'Opening does not save');
            done();
        });
    });

    QUnit.test('malformed video fallback reports a load error instead of leaving the creator waiting', assert => {
        const done = assert.async();
        assert.timeout(1500);
        const imported = JSON.parse(JSON.stringify(itemData));
        imported.body.elements.malformed_video = {
            qtiClass: 'object', serial: 'malformed_video',
            attributes: { data: 'video.mp4', type: 'video/mp4' },
            _alt: '<span>Unclosed'
        };
        imported.body.body += '{{malformed_video}}';
        $.mockjax({
            url: /mockMalformedAltText/,
            responseText: { itemData: imported, language: 'en-US' }
        });
        itemLoader.loadItem({
            uri: 'malformed-item-uri', label: 'Malformed fallback', itemDataUrl: 'mockMalformedAltText'
        }, (item, classes, error) => {
            assert.strictEqual(item, null);
            assert.ok(error instanceof Error);
            assert.ok(error.message.includes('invalid object fallback XML'));
            done();
        });
    });
});
