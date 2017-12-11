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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test the areaBroker
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/test/qtiCreator/mocks/areaBrokerMock'
], function (_, $, areaBrokerMock) {
    'use strict';

    QUnit.module('API');


    QUnit.test('module', 1, function (assert) {
        assert.equal(typeof areaBrokerMock, 'function', "The module exposes a function");
    });


    QUnit.test('factory', function (assert) {
        var $container = $('#qunit-fixture');
        var extraArea = 'extra';
        var areas = [
            'menu',
            'menuLeft',
            'menuRight',
            'editorBar',
            'title',
            'toolbar',
            'interactionPanel',
            'itemPanel',
            'contentCreatorPanel',
            'propertyPanel',
            'itemPropertyPanel',
            'itemStylePanel',
            'modalContainer',
            'elementPropertyPanel'
        ];
        var broker = areaBrokerMock({ defaultAreas: areas });

        QUnit.expect(37);

        assert.equal(typeof broker, 'object', "The factory creates an object");
        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length, "The container contains the exact number of areas");

        _.forEach(areas, function (area) {
            assert.equal(broker.getContainer().find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        broker = areaBrokerMock({ defaultAreas: areas, $brokerContainer: $container, areas: [extraArea] });

        assert.equal(typeof broker, 'object', "The factory creates an object");
        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length + 1, "The container contains the exact number of areas");
        assert.equal(broker.getContainer().find('.' + extraArea).length, 1, "The container must contain the extra area");

        _.forEach(areas, function (area) {
            assert.equal(broker.getContainer().find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        assert.notEqual(areaBrokerMock({ defaultAreas: areas }), areaBrokerMock({ defaultAreas: areas }), "The factory creates new instances");
        assert.notEqual(areaBrokerMock({ defaultAreas: areas }).getContainer().get(0), areaBrokerMock({ defaultAreas: areas }).getContainer().get(0), 'The factory creates a new container for each instance');
    });

});
