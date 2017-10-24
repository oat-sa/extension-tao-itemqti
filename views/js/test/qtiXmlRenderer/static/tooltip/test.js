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
    'taoQtiItem/qtiItem/core/Tooltip',
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function(Tooltip, xmlRenderer) {
    'use strict';

    QUnit.module('XML Renderer');

    QUnit.asyncTest('Render to XML', function(assert) {
        var renderer = xmlRenderer
            .get()
            .load(function() {
                var tooltipTarget   = 'my <i>target</i>',
                    tooltipContent  = 'my tooltip <strong>content</strong>',
                    tooltipSerial   = '_tooltip_4568613547893',
                    tooltipId       = '_tooltip_ID',
                    attributes      = {
                        'aria-describedby': tooltipId,
                        'data-role': 'tooltip-target'
                    },

                    tooltip = new Tooltip(tooltipSerial, attributes, tooltipContent),

                    expectedXml =
                        '<span data-role="tooltip-target" aria-describedby="' + tooltipId + '">' + tooltipTarget + '</span>' +
                        '<span data-role="tooltip-content" aria-hidden="true" id="' + tooltipId + '">' + tooltipContent + '</span>';

                tooltip.body(tooltipTarget);
                tooltip.setRenderer(renderer);

                assert.equal(tooltip.render(), expectedXml, 'rendered XML is correct');
                QUnit.start();

            }, ['_tooltip', '_container']);
    });
});