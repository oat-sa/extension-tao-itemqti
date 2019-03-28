/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

/**
 * Test the include renderer taoQtiItem/qtiCommonRenderer/renderers/Include
 *
 * @author Martin Nicholson <martin@taotesting.com>
 */

define([
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'json!taoQtiItem/test/samples/json/with-stimulus.json'
], function($, QtiLoader, QtiRenderer, itemData) {
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
