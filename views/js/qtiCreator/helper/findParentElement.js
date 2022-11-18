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
 * Copyright (c) 2021-2022 (original work) Open Assessment Technologies SA;
 */

define(['lodash'], function (_) {
    'use strict';

    /**
     * Check all figures and replace figcaption element by markup in body in one Element
     * @param {Object} element
     * @param {string} serial
     * @returns {Object}
     */
    function checkFigureInElement(element = {}, serial) {
        let parent = null;
        _.forEach(element['elements'], childElement => {
            if (childElement.qtiClass === 'img' && childElement.serial === serial) {
                parent = element;
            } else {
                parent = checkFigureInElement(childElement, serial);
            }
        });
        if (parent) {
            return parent;
        }
        if (element.body) {
            return checkFigureInElement(element.body, serial);
        }
        if (element.prompt) {
            return checkFigureInElement(element.prompt, serial);
        }
        return;
    }

    /**
     * Check all figures and replace figcaption elements by markup in body
     * @param {Object} itemData
     * @param {String} serial
     * @returns {Object} element
     */
    return function checkFigureInItemData(itemData = {}, serial) {
        if (itemData.bdy) {
            return checkFigureInElement(itemData.bdy, serial);
        }
        return;
    };
});
