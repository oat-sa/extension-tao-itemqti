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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['lodash'], function (_) {
    'use strict';

    const UMFI_ITEM_TYPE = 'umfi-closed';
    const DATA_ITEM_TYPE = 'data-item-type';
    const DATA_UMFI_VALUES = 'data-umfi-values';
    const DATA_CASE_SENSITIVE = 'data-case-sensitive';
    const DATA_ALLOW_LEXICAL_FIELDS = 'data-allow-lexical-fields-on-scoring';
    const TEXT_ENTRY_QTI_CLASS = 'textEntryInteraction';

    /**
     * @param {Object} interaction
     * @returns {Object[]}
     */
    const getItemTextEntries = function getItemTextEntries(interaction) {
        const item = interaction.getRootElement();

        if (!item || !_.isFunction(item.getElements)) {
            return [interaction];
        }

        return _.values(item.getElements(TEXT_ENTRY_QTI_CLASS));
    };

    /**
     * @param {Object[]} textEntries
     * @returns {Object|null}
     */
    const getPrimaryTextEntry = function getPrimaryTextEntry(textEntries) {
        return textEntries.length ? textEntries[0] : null;
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isUmfiEnabled = function isUmfiEnabled(interaction) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        return !!(primaryTextEntry && primaryTextEntry.attr(DATA_ITEM_TYPE) === UMFI_ITEM_TYPE);
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isAllowLexicalFieldsOnScoring = function isAllowLexicalFieldsOnScoring(interaction) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        return !!(primaryTextEntry && primaryTextEntry.attr(DATA_ALLOW_LEXICAL_FIELDS) === 'true');
    };

    /**
     * @param {Object} interaction
     * @param {boolean} enabled
     */
    const setUmfiEnabled = function setUmfiEnabled(interaction, enabled) {
        const textEntries = getItemTextEntries(interaction);
        const primaryTextEntry = getPrimaryTextEntry(textEntries);

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        if (enabled) {
            primaryTextEntry.attr(DATA_ITEM_TYPE, UMFI_ITEM_TYPE);

            if (!primaryTextEntry.attr(DATA_UMFI_VALUES)) {
                primaryTextEntry.attr(DATA_UMFI_VALUES, '[]');
            }

            if (!primaryTextEntry.attr(DATA_CASE_SENSITIVE)) {
                primaryTextEntry.attr(DATA_CASE_SENSITIVE, 'false');
            }
        } else {
            _.forEach(textEntries, textEntry => {
                textEntry.removeAttr(DATA_ITEM_TYPE);
                textEntry.removeAttr(DATA_UMFI_VALUES);
                textEntry.removeAttr(DATA_CASE_SENSITIVE);
                textEntry.removeAttr(DATA_ALLOW_LEXICAL_FIELDS);
            });
        }
    };

    /**
     * @param {string} label
     * @param {number} index
     * @returns {string}
     */
    const buildGroupOutcomeId = function buildGroupOutcomeId(label, index) {
        const normalized = String(label || '')
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();

        if (normalized) {
            return `${normalized}_FOUND`;
        }

        return `GROUP_${index}_FOUND`;
    };

    /**
     * @param {Array<{label?: string, synonyms: string[], collapsed?: boolean}>} groups
     * @returns {Array<{id: string, label: string, synonyms: string[], collapsed: boolean}>}
     */
    const normalizeLexicalGroups = function normalizeLexicalGroups(groups) {
        return _.map(groups || [], (group, index) => {
            const synonyms = _.chain(group.synonyms || group.variants || [])
                .map(String)
                .map(value => value.trim())
                .filter(Boolean)
                .value();
            const label = String(group.label || synonyms[0] || `Group ${index + 1}`).trim();

            return {
                id: group.id || buildGroupOutcomeId(label, index),
                label,
                synonyms,
                draftVariant: !!group.draftVariant
            };
        });
    };

    /**
     * @param {string|null|undefined} jsonString
     * @returns {Array<{label: string, synonyms: string[]}>}
     */
    const parseDataUmfiValues = function parseDataUmfiValues(jsonString) {
        if (!jsonString || !_.isString(jsonString)) {
            return [];
        }

        try {
            const parsed = JSON.parse(jsonString);

            if (!_.isArray(parsed)) {
                return [];
            }

            return normalizeLexicalGroups(
                _.map(parsed, (variants, index) => ({
                    label: _.isArray(variants) ? String(variants[0] || `Group ${index + 1}`) : `Group ${index + 1}`,
                    synonyms: _.isArray(variants) ? variants : []
                }))
            );
        } catch (e) {
            return [];
        }
    };

    /**
     * @param {Array<{label?: string, synonyms: string[]}>} groups
     * @returns {string}
     */
    const serializeDataUmfiValues = function serializeDataUmfiValues(groups) {
        const payload = _.map(normalizeLexicalGroups(groups), group =>
            _.chain(group.synonyms)
                .map(value => String(value).trim())
                .filter(Boolean)
                .value()
        ).filter(variants => variants.length);

        return JSON.stringify(payload);
    };

    /**
     * @param {Object} interaction
     * @returns {Object|null}
     */
    const getPrimaryTextEntryForInteraction = function getPrimaryTextEntryForInteraction(interaction) {
        return getPrimaryTextEntry(getItemTextEntries(interaction));
    };

    /**
     * @param {Object} interaction
     * @returns {Array<{id: string, label: string, synonyms: string[], collapsed: boolean}>}
     */
    const getLexicalGroups = function getLexicalGroups(interaction) {
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        if (!primaryTextEntry) {
            return [];
        }

        return parseDataUmfiValues(primaryTextEntry.attr(DATA_UMFI_VALUES));
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isCaseSensitive = function isCaseSensitive(interaction) {
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        return !!(primaryTextEntry && primaryTextEntry.attr(DATA_CASE_SENSITIVE) === 'true');
    };

    /**
     * @param {Object} interaction
     * @param {Array<{label?: string, synonyms: string[], collapsed?: boolean}>} groups
     */
    const setLexicalGroups = function setLexicalGroups(interaction, groups) {
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        primaryTextEntry.attr(DATA_UMFI_VALUES, serializeDataUmfiValues(groups));
    };

    /**
     * @param {Object} interaction
     * @param {boolean} enabled
     */
    const setCaseSensitive = function setCaseSensitive(interaction, enabled) {
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        if (enabled) {
            primaryTextEntry.attr(DATA_CASE_SENSITIVE, 'true');
        } else {
            primaryTextEntry.attr(DATA_CASE_SENSITIVE, 'false');
        }
    };

    /**
     * @param {Object} interaction
     * @returns {{evaluateAsUmfi: boolean, allowLexicalFieldsOnScoring: boolean, caseSensitive: boolean, lexicalGroups: Object[]}}
     */
    const getEvaluationConfig = function getEvaluationConfig(interaction) {
        return {
            evaluateAsUmfi: isUmfiEnabled(interaction),
            allowLexicalFieldsOnScoring: isAllowLexicalFieldsOnScoring(interaction),
            caseSensitive: isCaseSensitive(interaction),
            lexicalGroups: getLexicalGroups(interaction)
        };
    };

    /**
     * @param {Object} interaction
     * @param {{evaluateAsUmfi?: boolean, allowLexicalFieldsOnScoring?: boolean, caseSensitive?: boolean, lexicalGroups?: Object[]}} config
     */
    const persistEvaluationConfig = function persistEvaluationConfig(interaction, config) {
        if (config.evaluateAsUmfi === false) {
            setUmfiEnabled(interaction, false);
            return;
        }

        if (config.evaluateAsUmfi === true) {
            setUmfiEnabled(interaction, true);
        }

        if (!_.isUndefined(config.lexicalGroups)) {
            setLexicalGroups(interaction, config.lexicalGroups);
        }

        if (!_.isUndefined(config.caseSensitive)) {
            setCaseSensitive(interaction, config.caseSensitive);
        }

        if (!_.isUndefined(config.allowLexicalFieldsOnScoring)) {
            setAllowLexicalFieldsOnScoring(interaction, config.allowLexicalFieldsOnScoring);
        }
    };

    /**
     * @param {Object} interaction
     * @param {boolean} enabled
     */
    const setAllowLexicalFieldsOnScoring = function setAllowLexicalFieldsOnScoring(interaction, enabled) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        if (enabled) {
            primaryTextEntry.attr(DATA_ALLOW_LEXICAL_FIELDS, 'true');
        } else {
            primaryTextEntry.removeAttr(DATA_ALLOW_LEXICAL_FIELDS);
        }
    };

    return {
        UMFI_ITEM_TYPE,
        DATA_ITEM_TYPE,
        DATA_UMFI_VALUES,
        DATA_CASE_SENSITIVE,
        DATA_ALLOW_LEXICAL_FIELDS,
        getItemTextEntries,
        isUmfiEnabled,
        isAllowLexicalFieldsOnScoring,
        isCaseSensitive,
        getLexicalGroups,
        getEvaluationConfig,
        normalizeLexicalGroups,
        parseDataUmfiValues,
        serializeDataUmfiValues,
        buildGroupOutcomeId,
        setUmfiEnabled,
        setAllowLexicalFieldsOnScoring,
        setLexicalGroups,
        setCaseSensitive,
        persistEvaluationConfig
    };
});
