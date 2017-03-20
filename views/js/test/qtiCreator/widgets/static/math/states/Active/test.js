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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiItem/core/Math',
    'taoQtiItem/qtiCreator/widgets/static/math/Widget',
    'taoQtiItem/qtiCreator/widgets/static/math/states/Active'
], function ($, creatorRenderer, mathElement, mathWidget, activeWidget) {
    'use strict';

    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof activeWidget === 'function', 'The module expose a function');
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function (assert) {
        var $outsideContainer = $('#outside-container'),
            $widgetBox = $outsideContainer.find('.widget-box'),
            $widgetForm = $outsideContainer.find('.property-form .panel'),
            widget,
            mathEl = new mathElement();

        creatorRenderer
            .get(true, { properties: {} })
            .load(function() {
                mathEl.init('serial');
                mathEl.setRenderer(this);

                widget = mathWidget.build(mathEl, $widgetBox, $widgetForm);
                widget.changeState('active');

                assert.ok(true);

                QUnit.start();
            }, [ 'math' ]);

    });

});