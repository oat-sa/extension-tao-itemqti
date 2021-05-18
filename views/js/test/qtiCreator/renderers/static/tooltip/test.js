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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/mocks/qtiCreatorContextMock',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/Tooltip'
], function(
    $,
    qtiCreatorContextMockFactory,
    creatorRenderer,
    Tooltip
) {
    'use strict';

    QUnit.module('Creator Renderer');

    QUnit.test('Display and play', function(assert) {
        const ready = assert.async();
        const config = {
            qtiCreatorContext: qtiCreatorContextMockFactory()
        };

        const areaBroker = {
            getElementPropertyPanelArea() {
                return $('#qunit-fixture');
            },
            getContentCreatorPanelArea() {
                return $('#item-editor-panel');
            },
            getItemPanelArea() {
                return $('#outside-container .item-editor-item');
            },
            getToolbarArea() {
                return $('#toolbar-top');
            }
        };

        const tooltipContent = 'my tooltip <strong>content</strong>';
        const tooltipSerial = '_tooltip_4568613547893';
        const tooltipId = 'tooltip_123456';

        const tooltip = new Tooltip(tooltipSerial, {
            'aria-describedby': tooltipId
        }, tooltipContent);

        assert.expect(1);

        creatorRenderer
            .get(true, config, areaBroker)
            .load(function() {
                const $tooltipPlaceholder = $('.tooltip-placeholder');

                tooltip.setRenderer(this);
                tooltip.body('tootlip target');

                tooltip.render($tooltipPlaceholder);
                tooltip.postRender();

                assert.ok(true);

                ready();
            }, ['_tooltip', '_container']);
    });
});
