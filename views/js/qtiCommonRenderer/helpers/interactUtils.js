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
 * Helpers for interact library
 *
 * @author Christope Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/mouseEvent'
], function($, _, triggerMouseEvent) {
    'use strict';

    var interactHelper = {

        /**
         * triggers an interact 'tap' event
         * @param {HtmlElement|jQueryElement} element
         * @param {Function} cb callback
         * @param {int} delay in milliseconds before firing the callback
         */
        tapOn: function tapOn(element, cb, delay) {
            var domElement,
                eventOptions = {
                    bubbles: true
                };
            if (element) {
                domElement = (element instanceof $) ? element.get(0) : element;

                triggerMouseEvent(domElement, 'mousedown', eventOptions);
                triggerMouseEvent(domElement, 'mouseup', eventOptions);

                if (cb) {
                    _.delay(cb, delay || 0);
                }
            }
        },

        // todo make this jQuery independant
        /**
         * This should be bound to the onmove event of a draggable element
         * @param {HtmlElement|jQueryElement} element
         */
        moveElement: function moveElement(element, dx, dy) {
            var x = (parseFloat($target.attr('data-x')) || 0) + dx,
                y = (parseFloat($target.attr('data-y')) || 0) + dy,
                transform = 'translate(' + x + 'px, ' + y + 'px)';

            $target.css("webkitTransform", transform);
            $target.css("transform", transform);

            $target.attr('data-x', x);
            $target.attr('data-y', y);
        }

    };

    return interactHelper;
});
