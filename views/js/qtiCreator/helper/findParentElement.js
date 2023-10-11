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

define([], function () {
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
        return (parentElement, serial) => {
            for (const childElement of parentElement['elements']) {
                if (childElement.serial === serial) {
                    return parentElement;
                }
                const foundInChildElements = childElement['elements'] && searchRecurse(childElement, serial);
                if (foundInChildElements) {
                    return foundInChildElements;
                }
                const foundInPrompt = childElement['prompt'] && searchRecurse(childElement.prompt.bdy, serial);
                if (foundInPrompt) {
                    return foundInPrompt;
                }
                const foundInBody = childElement['bdy'] && searchRecurse(childElement.bdy, serial);
                if (foundInBody) {
                    return foundInBody;
                }
            }
            return null;
        };
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
