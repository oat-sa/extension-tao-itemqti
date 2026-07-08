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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['lodash'], function (_) {
    'use strict';

    const INTERNAL_AUTHORING_ATTRS = ['data-umfi-managed-outcomes', 'data-umfi-rp-managed'];

    const SINGLE_QUOTED_JSON_ATTRS = ['data-umfi-values'];

    /**
     * @param {string} name
     * @param {string} value
     * @returns {string}
     */
    const formatXmlAttribute = function formatXmlAttribute(name, value) {
        const stringValue = String(value);

        if (_.includes(SINGLE_QUOTED_JSON_ATTRS, name)) {
            return `${name}='${stringValue}'`;
        }

        return `${name}="${stringValue}"`;
    };

    /**
     * @param {Object} attributes
     * @returns {{attributesMarkup: string}}
     */
    const prepareTextEntryRenderData = function prepareTextEntryRenderData(attributes) {
        const markupParts = [];

        _.forEach(attributes || {}, (value, name) => {
            if (_.includes(INTERNAL_AUTHORING_ATTRS, name)) {
                return;
            }

            if (_.isUndefined(value) || value === null) {
                return;
            }

            markupParts.push(formatXmlAttribute(name, value));
        });

        return {
            attributesMarkup: markupParts.join(' ')
        };
    };

    /**
     * @param {string} xml
     * @returns {string}
     */
    const stripInternalAuthoringAttrsFromItemXml = function stripInternalAuthoringAttrsFromItemXml(xml) {
        if (!xml || typeof xml !== 'string') {
            return xml;
        }

        return xml.replace(/(<textEntryInteraction\b)([^>]*)(\/?>)/gi, function (match, openTag, attrs, close) {
            let cleanedAttrs = attrs;

            _.forEach(INTERNAL_AUTHORING_ATTRS, attributeName => {
                cleanedAttrs = cleanedAttrs.replace(
                    new RegExp(`\\s${attributeName}=(?:"[^"]*"|'[^']*')`, 'gi'),
                    ''
                );
            });

            return openTag + cleanedAttrs + close;
        });
    };

    return {
        INTERNAL_AUTHORING_ATTRS,
        SINGLE_QUOTED_JSON_ATTRS,
        formatXmlAttribute,
        prepareTextEntryRenderData,
        stripInternalAuthoringAttrsFromItemXml
    };
});
