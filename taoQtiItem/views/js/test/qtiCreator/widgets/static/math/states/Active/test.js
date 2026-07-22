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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA;
 */
/**
 * This is a first and naive attempt at unit testing a QTI Creator Widget State
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiItem/core/Math',
    'taoQtiItem/qtiCreator/widgets/static/math/Widget',
    'taoQtiItem/qtiCreator/widgets/static/math/states/Active'
], function(
    $,
    creatorRenderer,
    mathElement,
    mathWidget,
    activeWidget
) {
    'use strict';

    QUnit.module('plugin');

    QUnit.test('module', function(assert) {
        assert.expect(1);

        assert.ok(typeof activeWidget === 'function', 'The module expose a function');
    });

    QUnit.module('Visual Test');

    QUnit.test('Display and play', function(assert) {
        const ready = assert.async();
        let widget;
        const mathEl = new mathElement();
        const $widgetBox = $('<div>', {
            'class': 'widget-box',
            'data-serial': 'serial'
        });
        const areaBroker = {
            getItemPropertyPanelArea() {
                return $('#outside-container .prop');
            },
            getElementPropertyPanelArea() {
                return $('#outside-container .elt-prop');
            },
            getItemPanelArea() {
                return $('#outside-container .item');
            },
            getContentCreatorPanelArea() {
                return $('#outside-container .content');
            }
        };

        creatorRenderer
            .get(true, {
                properties: {}
            }, areaBroker)
            .load(function() {
                mathEl.init('serial');
                mathEl.setRenderer(this);

                $widgetBox.appendTo(areaBroker.getItemPanelArea());

                widget = mathWidget.build(mathEl, $widgetBox, areaBroker.getItemPropertyPanelArea());
                widget.changeState('active');

                assert.ok(true);

                ready();
            }, ['math']);
    });

});
