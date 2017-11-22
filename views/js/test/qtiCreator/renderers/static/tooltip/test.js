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
    'taoQtiItem/test/qtiCreator/mocks/qtiCreatorContextMock',
    'taoQtiItem/test/qtiCreator/mocks/areaBrokerMock',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/Tooltip'
], function($, qtiCreatorContextMockFactory, areaBrokerFactory, creatorRenderer, Tooltip) {
    'use strict';

    QUnit.module('Creator Renderer');

    QUnit.asyncTest('Display and play', function (assert) {
        var $outsideContainer = $('#outside-container'),
            config = {
                qtiCreatorContext: qtiCreatorContextMockFactory()
            },
            areaBroker = areaBrokerFactory({
                $brokerContainer: $outsideContainer,
                mapping: {
                    itemPanel: $('.item-editor-item'),
                    contentCreatorPanel: $('#item-editor-panel'),
                    toolbar: $('#toolbar-top')
                }
            }),
            tooltipContent  = 'my tooltip <strong>content</strong>',
            tooltipSerial   = '_tooltip_4568613547893',
            tooltipId       = 'tooltip_123456',

            tooltip = new Tooltip(tooltipSerial, { 'aria-describedby': tooltipId }, tooltipContent);

        QUnit.expect(1);

        creatorRenderer
            .get(true, config, areaBroker)
            .load(function() {
                var $tooltipPlaceholder = $('.tooltip-placeholder');

                tooltip.setRenderer(this);
                tooltip.body('tootlip target');

                tooltip.render($tooltipPlaceholder);
                tooltip.postRender();

                assert.ok(true);

                QUnit.start();
            }, [ '_tooltip', '_container' ]);

    });
});