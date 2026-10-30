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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
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
});
