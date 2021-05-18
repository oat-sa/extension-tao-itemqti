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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery'
], function ($) {
    'use strict';

    /**
     * Sets a placeholder on an element
     * @param {jQuery|String|HTMLElement} el
     * @param {String} value
     * @returns {jQuery}
     */
    function setPlaceholder(el, value) {
        if (typeof value !== 'undefined') {
            value = '' + value;
        } else {
            value = '';
        }
        return $(el).attr('placeholder', value);
    }

    /**
     * Gets the response declaration from a widget
     * @param {Widget} widget
     * @returns {Object}
     */
    function getResponseDeclaration(widget) {
        var interaction = widget.element;
        return interaction && interaction.getResponseDeclaration();
    }

    return {
        /**
         * Sets a score placeholder
         * @param {Widget} widget
         * @param {String} value
         */
        score: function score(widget, value) {
            var response = getResponseDeclaration(widget);

            if (response && typeof value === 'undefined') {
                value = response.getMappingAttribute('defaultValue');
            }

            if (widget && widget.$container) {
                setPlaceholder(widget.$container.find('.score'), value);
            }
        }
    };
});
