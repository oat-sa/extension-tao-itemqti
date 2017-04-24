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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/areaBroker'
], function ($, _, areaBrokerFactory) {
    'use strict';

    /**
     * The mock
     * @type {Object}
     */
    var areaBroker;

    /**
     * The list of default areas
     * @type {String[]}
     */
    var defaultAreas = [
        'menu',
        'menuLeft',
        'menuRight',
        'title',
        'interactionPanel',
        'itemPanel',
        'propertyPanel',
        'itemPropertyPanel',
        'itemStylePanel',
        'modalContainer'
    ];

    /**
     * A counter utilised to generate the mock identifiers
     * @type {Number}
     */
    var mockId = 0;

    /**
     * Builds and returns a new areaBroker with dedicated areas.
     * @param $brokerContainer - where to create the area broker - default to #qunit-fixture
     * @param areas - A list of areas to create
     * @returns {areaBroker} - Returns the new areaBroker
     */
    function areaBrokerMock($brokerContainer, areas) {
        var mapping = {};
        var $areaBrokerDom = $('<div />').attr('id', 'area-broker-mock-' + (mockId++)).addClass('qti-creator');

        if (!areas) {
            areas = defaultAreas;
        } else {
            areas = _.keys(_.merge(_.object(areas), _.object(defaultAreas)));
        }

        _.forEach(areas, function (areaId) {
            mapping[areaId] = $('<div />').addClass('test-area').addClass(areaId).appendTo($areaBrokerDom);
        });

        if (! $brokerContainer) {
            $brokerContainer = $('#qunit-fixture');
        }
        $brokerContainer.append($areaBrokerDom);

        areaBroker = areaBrokerFactory($areaBrokerDom, mapping);

        return areaBroker;
    }

    return areaBrokerMock;
});
