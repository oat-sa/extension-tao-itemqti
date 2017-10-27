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
    'taoQtiItem/test/qtiCreator/mocks/areaBrokerMock',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiItem/core/Tooltip'
], function($, areaBrokerFactory, creatorRenderer, Tooltip) {
    'use strict';

    QUnit.module('Creator Renderer');

    QUnit.asyncTest('Display and play', function (assert) {
        var $outsideContainer = $('#outside-container'),
            areaBroker = areaBrokerFactory($outsideContainer),
            tooltipContent  = 'my tooltip <strong>content</strong>',
            tooltipSerial   = '_tooltip_4568613547893',

            tooltip = new Tooltip(tooltipSerial, {}, tooltipContent);

        QUnit.expect(1);

        creatorRenderer
            .get(true, {}, areaBroker)
            .load(function() {
                var $container = areaBroker.getItemPanelArea();

                tooltip.setRenderer(this);
                tooltip.body('tootlip target');

                $container.append(tooltip.render());
                tooltip.postRender();

                assert.equal($container.find('.widget-inline').length, 1, 'element has been wrapped in a inline widget container');

                QUnit.start();
            }, [ '_tooltip', '_container' ]);

    });
});