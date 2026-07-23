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

    const INTERNAL_AUTHORING_ATTRS = [
        'data-umfi-managed-outcomes',
        'data-umfi-rp-managed',
        'data-scoring-model-rp-managed'
    ];

    const SINGLE_QUOTED_JSON_ATTRS = ['data-umfi-values', 'data-scoring-model'];

    /**
     * Escape attribute text for the chosen quote style.
     * XML parsers decode entities when reading attributes, so JSON consumers still see raw quotes/apostrophes.
     *
     * @param {string} value
     * @param {string} quoteChar
     * @returns {string}
     */
    const escapeXmlAttributeValue = function escapeXmlAttributeValue(value, quoteChar) {
        const stringValue = String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return quoteChar === "'"
            ? stringValue.replace(/'/g, '&apos;')
            : stringValue.replace(/"/g, '&quot;');
    };

    /**
     * Escape attribute text for the chosen quote style.
     * XML parsers decode entities when reading attributes, so JSON consumers still see raw quotes/apostrophes.
     *
     * @param {string} value
     * @param {string} quoteChar
     * @returns {string}
     */
    const escapeXmlAttributeValue = function escapeXmlAttributeValue(value, quoteChar) {
        const stringValue = String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return quoteChar === "'"
            ? stringValue.replace(/'/g, '&apos;')
            : stringValue.replace(/"/g, '&quot;');
    };

    /**
     * @param {string} name
     * @param {string} value
     * @returns {string}
     */
    const formatXmlAttribute = function formatXmlAttribute(name, value) {
        if (_.includes(SINGLE_QUOTED_JSON_ATTRS, name)) {
            return `${name}='${escapeXmlAttributeValue(value, "'")}'`;
        }

        return `${name}="${escapeXmlAttributeValue(value, '"')}"`;
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
        escapeXmlAttributeValue,
        formatXmlAttribute,
        prepareTextEntryRenderData,
        stripInternalAuthoringAttrsFromItemXml
    };
});
