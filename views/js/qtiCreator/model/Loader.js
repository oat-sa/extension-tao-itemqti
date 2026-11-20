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
/**
 * AUT-4762: creator-side workaround for standalone and nested object fallback loading.
 * Remove after adopting an upstream Loader fix that preserves fallback as XML strings.
 */
define(['taoQtiItem/qtiItem/core/Loader'], function (Loader) {
    'use strict';

    function fallbackXml(fallback) {
        if (!fallback || typeof fallback === 'string') {
            return fallback || '';
        }
        if (fallback.qtiClass !== 'object') {
            throw new Error('Cannot load unsupported object fallback');
        }
        const node = document.implementation.createDocument(null, 'object').documentElement;
        Object.entries(fallback.attributes || {}).forEach(([name, value]) => node.setAttribute(name, value));
        const openingTag = new XMLSerializer().serializeToString(node).slice(0, -2);
        return `${openingTag}>${fallbackXml(fallback._alt)}</object>`;
    }

    return Loader.extend({
        loadElementData(element, data) {
            this._super(element, data);
            if (element.is('object')) {
                this.loadObjectData(element, Object.assign({}, data, { attributes: element.getAttributes() }));
            }
            return element;
        },
        loadObjectData(object, data) {
            if (data._alt && data._alt.qtiClass === 'object') {
                data = Object.assign({}, data, { _alt: fallbackXml(data._alt) });
            }
            this._super(object, data);
        }
    });
});
