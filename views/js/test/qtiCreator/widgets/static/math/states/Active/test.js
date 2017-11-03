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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * This is a first and naive attempt at unit testing a QTI Creator Widget State
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/mocks/areaBrokerMock',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiItem/core/Math',
    'taoQtiItem/qtiCreator/widgets/static/math/Widget',
    'taoQtiItem/qtiCreator/widgets/static/math/states/Active'
], function ($, areaBrokerFactory, creatorRenderer, mathElement, mathWidget, activeWidget) {
    'use strict';

    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof activeWidget === 'function', 'The module expose a function');
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function (assert) {
        var $outsideContainer = $('#outside-container'),
            widget,
            mathEl = new mathElement(),
            areaBroker = areaBrokerFactory({ $brokerContainer: $outsideContainer }),
            $widgetBox = $('<div>', { 'class': 'widget-box', 'data-serial': 'serial' }),
            $widgetForm = areaBroker.getItemPropertyPanelArea();

        creatorRenderer
            .get(true, { properties: {} }, areaBroker)
            .load(function() {
                mathEl.init('serial');
                mathEl.setRenderer(this);

                $widgetBox.appendTo(areaBroker.getItemPanelArea());

                widget = mathWidget.build(mathEl, $widgetBox, $widgetForm);
                widget.changeState('active');

                assert.ok(true);

                QUnit.start();
            }, [ 'math' ]);

    });

});