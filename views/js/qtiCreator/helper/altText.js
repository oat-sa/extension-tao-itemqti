/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 Open Assessment Technologies SA;
 */
define(['lodash'], function (_) {
    'use strict';

    const maxLength = 200;

    function truncate(value, element) {
        const characters = Array.from(value);
        if (characters.length > maxLength) {
            if (element) {
                element.data('altTextTruncatedFrom', characters.length);
            }
            return characters.slice(0, maxLength).join('');
        }
        return value;
    }

    function isSupported(element) {
        return element.is('img') ||
            (element.is('object') && /^video\//.test(element.attr('type')) && typeof element.description === 'function');
    }

    function getElements(item) {
        const elements = item.getComposingElements();
        const readOnly = new Set();
        _.forEach(elements, element => {
            if (element.is('include')) {
                _.forEach(element.getComposingElements(), child => readOnly.add(child.getSerial()));
            }
        });
        return _.filter(elements, element => !readOnly.has(element.getSerial()) && isSupported(element));
    }

    return {
        maxLength,
        truncate,
        getTarget(element) {
            if (isSupported(element)) {
                return element;
            }
            if (element.is('figure')) {
                return _.find(element.getBody().elements, child => child.is('img'));
            }
            if (element.object && isSupported(element.object)) {
                return element.object;
            }
            return null;
        },
        normalize(item) {
            let count = 0;
            const elements = getElements(item);
            elements.forEach(element => {
                const image = element.is('img');
                const value = image ? element.attr('alt') : element.description();
                if (typeof value === 'string') {
                    const limited = truncate(value, element);
                    if (limited !== value) {
                        if (image) {
                            element.attr('alt', limited);
                        } else {
                            element.description(limited);
                        }
                        count++;
                    }
                }
            });
            if (count) {
                item.data('altTextTruncated', elements.filter(element => element.data('altTextTruncatedFrom')).length);
            }
            return count;
        },
        clear(item) {
            item.removeData('altTextTruncated');
            getElements(item).forEach(element => element.removeData('altTextTruncatedFrom'));
        }
    };
});
