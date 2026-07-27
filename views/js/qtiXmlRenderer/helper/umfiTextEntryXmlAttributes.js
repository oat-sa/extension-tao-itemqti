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

    // Public feature attrs that must live on the first textEntryInteraction in itemBody order.
    const FEATURE_DATA_ATTRS = [
        'data-item-type',
        'data-umfi-values',
        'data-case-sensitive',
        'data-allow-lexical-fields-on-scoring',
        'data-scoring-model'
    ];

    /**
     * Match textEntryInteraction start tags without consuming the self-close slash
     * after empty attrs like placeholderText=""/>.
     * Groups: 1=open, 2=attrs, 3=close
     */
    const TEXT_ENTRY_TAG_RE =
        /(<textEntryInteraction\b)((?:\s+[\w:.-]+(?:=(?:"[^"]*"|'[^']*'))?)*)(\s*\/?>)/gi;

    /**
     * @param {string} attrs
     * @param {string} name
     * @returns {string|null} full `name="value"` / `name='value'` assignment, or null
     */
    const extractAttributeAssignment = function extractAttributeAssignment(attrs, name) {
        const match = String(attrs || '').match(
            new RegExp(`(?:^|\\s)(${name}=(?:"[^"]*"|'[^']*'))`, 'i')
        );

        return match ? match[1] : null;
    };

    /**
     * @param {string} attrs
     * @param {string} name
     * @returns {string}
     */
    const removeAttributeAssignment = function removeAttributeAssignment(attrs, name) {
        return String(attrs || '').replace(new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, 'gi'), '');
    };

    /**
     * Move feature data-* onto the first <textEntryInteraction> in document order.
     * Guarantees saved XML matches "first interaction in block" even if the model
     * still has attrs stuck on a later TEI (e.g. after insert-before).
     *
     * @param {string} xml
     * @returns {string}
     */
    const relocateFeatureDataAttrsToFirstTextEntry = function relocateFeatureDataAttrsToFirstTextEntry(xml) {
        if (!xml || typeof xml !== 'string') {
            return xml;
        }

        const teiRe = new RegExp(TEXT_ENTRY_TAG_RE.source, 'gi');
        const matches = [];
        let match;

        while ((match = teiRe.exec(xml)) !== null) {
            matches.push({
                full: match[0],
                open: match[1],
                attrs: match[2],
                close: match[3],
                index: match.index
            });
        }

        if (!matches.length) {
            return xml;
        }

        const collected = {};

        _.forEach(matches, tei => {
            _.forEach(FEATURE_DATA_ATTRS, name => {
                if (collected[name]) {
                    return;
                }

                const assignment = extractAttributeAssignment(tei.attrs, name);

                if (assignment) {
                    collected[name] = assignment;
                }
            });
        });

        if (!_.size(collected)) {
            return xml;
        }

        const extras = _.map(FEATURE_DATA_ATTRS, name => collected[name]).filter(Boolean);
        let result = '';
        let lastIndex = 0;

        _.forEach(matches, (tei, index) => {
            result += xml.substring(lastIndex, tei.index);

            let attrs = tei.attrs;

            _.forEach(FEATURE_DATA_ATTRS, name => {
                attrs = removeAttributeAssignment(attrs, name);
            });

            attrs = attrs.replace(/\s+$/, '');

            if (index === 0) {
                attrs = `${attrs} ${extras.join(' ')}`;
            }

            if (attrs && attrs.charAt(0) !== ' ') {
                attrs = ` ${attrs}`;
            }

            result += tei.open + attrs + tei.close;
            lastIndex = tei.index + tei.full.length;
        });

        result += xml.substring(lastIndex);

        return result;
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

        return xml.replace(new RegExp(TEXT_ENTRY_TAG_RE.source, 'gi'), function (match, openTag, attrs, close) {
            let cleanedAttrs = attrs;

            _.forEach(INTERNAL_AUTHORING_ATTRS, attributeName => {
                cleanedAttrs = removeAttributeAssignment(cleanedAttrs, attributeName);
            });

            return openTag + cleanedAttrs + close;
        });
    };

    return {
        INTERNAL_AUTHORING_ATTRS,
        FEATURE_DATA_ATTRS,
        SINGLE_QUOTED_JSON_ATTRS,
        escapeXmlAttributeValue,
        formatXmlAttribute,
        prepareTextEntryRenderData,
        relocateFeatureDataAttrsToFirstTextEntry,
        stripInternalAuthoringAttrsFromItemXml
    };
});
