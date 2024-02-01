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
     *
     * @param {Object} parentElement
     * @param {string} serial
     * @returns {Object}
     */
    const searchRecurse = (parentElement, serial) => {
        if (!parentElement) {
            return null;
        }
        if (parentElement.serial === serial) {
            return parentElement;
        }
        let found = null;
        _.forEach(parentElement['elements'], childElement => {
            if (childElement.serial === serial) {
                found = parentElement;
            } else if (childElement['elements']) {
                found = searchRecurse(childElement, serial);
            } else if (childElement['prompt']) {
                found = searchRecurse(childElement.prompt.bdy, serial);
            } else if (childElement['bdy']) {
                found = searchRecurse(childElement.bdy, serial);
            }
            if (found) {
                return false;
            }
        });
        return found;
    };

    /**
     * Check all figures and replace figcaption elements by markup in body
     * @param {Object} itemData
     * @param {String} serial
     * @returns {Object} element
     */
    return function checkFigureInItemData(itemData = {}, serial) {
        if (itemData.bdy) {
            return searchRecurse(itemData.bdy, serial);
        }
        return;
    };
});
