/*
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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 *
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery'], function ($) {
    /**
     * Creates a popup relative to shape in a paper
     * @param {Raphael.Element} paper
     * @param {Raphael.Element} shape - the relative shape
     * @param {jQueryElement} $container - the svg container
     * @param {Boolean} isResponsive
     * @returns {jQueryElement} the popup
     */
    return function createShapePopups(paper, shape, $container, isResponsive) {
        const margin = 10;
        const $shape = $(shape.node);
        const $element = $('<div class="mapping-editor arrow-left-top"></div>');
        const boxOffset = $container.offset();
        const offset = $shape.offset();
        const bbox = shape.getBBox();
        let width = bbox.width;
        if (isResponsive) {
            let wfactor = paper.w / paper.width;
            width = Math.round(width / wfactor);
        }
        //style and attach the form
        $element
            .css({
                top: offset.top - boxOffset.top - margin,
                left: offset.left - boxOffset.left + width + margin
            })
            .appendTo($container);

        return $element;
    };
});
