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
define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiXmlRenderer/helper/synonymGroupResponseProcessingGenerator'
], function (_, Element, synonymGroupGenerator) {
    'use strict';

    const UMFI_ITEM_TYPE = 'umfi-closed';
    const DATA_ITEM_TYPE = 'data-item-type';
    const DATA_UMFI_VALUES = 'data-umfi-values';
    const DATA_CASE_SENSITIVE = 'data-case-sensitive';
    const DATA_ALLOW_LEXICAL_FIELDS = 'data-allow-lexical-fields-on-scoring';
    const DATA_MANAGED_OUTCOMES = 'data-umfi-managed-outcomes';
    const DATA_RP_MANAGED = 'data-umfi-rp-managed';
    const TEXT_ENTRY_QTI_CLASS = 'textEntryInteraction';
    const PRIMARY_RESPONSE_IDENTIFIER = 'RESPONSE';
    const LEXICAL_GROUP_PREFIX = 'GROUP_';
    const GROUP_OUTCOME_SUFFIX = '_FOUND';

    /**
     * @param {Object} textEntry
     * @returns {string|null}
     */
    const getTextEntryResponseIdentifier = function getTextEntryResponseIdentifier(textEntry) {
        if (!textEntry || !_.isFunction(textEntry.attr)) {
            return null;
        }

        return textEntry.attr('responseIdentifier') || null;
    };

    /**
     * @param {Object} textEntry
     * @returns {number|string|null}
     */
    const getTextEntrySerial = function getTextEntrySerial(textEntry) {
        if (!textEntry) {
            return null;
        }

        if (_.isFunction(textEntry.getSerial)) {
            return textEntry.getSerial();
        }

        return textEntry.serial;
    };

    /**
     * @param {Object[]} textEntries
     * @returns {Object[]}
     */
    const sortTextEntries = function sortTextEntries(textEntries) {
        return _.sortBy(textEntries, textEntry => {
            const responseIdentifier = getTextEntryResponseIdentifier(textEntry);

            if (responseIdentifier === PRIMARY_RESPONSE_IDENTIFIER) {
                return '0';
            }

            return `1_${String(responseIdentifier || getTextEntrySerial(textEntry)).padStart(10, '0')}`;
        });
    };

    /**
     * @param {Object} element
     * @returns {boolean}
     */
    const isTextEntryElement = function isTextEntryElement(element) {
        if (!element) {
            return false;
        }

        if (_.isFunction(element.is)) {
            return element.is(TEXT_ENTRY_QTI_CLASS);
        }

        return Element.isA(element, TEXT_ENTRY_QTI_CLASS) || element.qtiClass === TEXT_ENTRY_QTI_CLASS;
    };

    /**
     * @param {Object[]} elements
     * @returns {Object[]}
     */
    const collectTextEntries = function collectTextEntries(elements) {
        return _.filter(elements, isTextEntryElement);
    };

    /**
     * @param {Object} interaction
     * @returns {Object[]}
     */
    const getItemTextEntries = function getItemTextEntries(interaction) {
        const item = interaction && _.isFunction(interaction.getRootElement) ? interaction.getRootElement() : null;

        if (item && _.isFunction(item.getComposingElements)) {
            const textEntries = collectTextEntries(_.values(item.getComposingElements()));

            if (textEntries.length) {
                return sortTextEntries(textEntries);
            }
        }

        if (item && _.isFunction(item.getElements)) {
            const textEntries = collectTextEntries(_.values(item.getElements(TEXT_ENTRY_QTI_CLASS) || {}));

            if (textEntries.length) {
                return sortTextEntries(textEntries);
            }
        }

        if (isTextEntryElement(interaction)) {
            return [interaction];
        }

        return [];
    };

    /**
     * @param {Object[]} textEntries
     * @returns {Object|null}
     */
    const getPrimaryTextEntry = function getPrimaryTextEntry(textEntries) {
        if (!textEntries.length) {
            return null;
        }

        const responseTextEntry = _.find(
            textEntries,
            textEntry => getTextEntryResponseIdentifier(textEntry) === PRIMARY_RESPONSE_IDENTIFIER
        );

        if (responseTextEntry) {
            return responseTextEntry;
        }

        const metadataTextEntry = _.find(textEntries, textEntry => {
            if (!textEntry || !_.isFunction(textEntry.attr)) {
                return false;
            }

            return !!(textEntry.attr(DATA_ITEM_TYPE) || textEntry.attr(DATA_UMFI_VALUES));
        });

        if (metadataTextEntry) {
            return metadataTextEntry;
        }

        return sortTextEntries(textEntries)[0];
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isUmfiEnabled = function isUmfiEnabled(interaction) {
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return false;
        }

        if (primaryTextEntry.attr(DATA_ITEM_TYPE) === UMFI_ITEM_TYPE) {
            return true;
        }

        return parseDataUmfiValues(primaryTextEntry.attr(DATA_UMFI_VALUES)).length > 0;
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
            clearUmfiResponseProcessing(interaction);
            _.forEach(textEntries, textEntry => {
                textEntry.removeAttr(DATA_ITEM_TYPE);
                textEntry.removeAttr(DATA_UMFI_VALUES);
                textEntry.removeAttr(DATA_CASE_SENSITIVE);
                textEntry.removeAttr(DATA_ALLOW_LEXICAL_FIELDS);
                textEntry.removeAttr(DATA_MANAGED_OUTCOMES);
                textEntry.removeAttr(DATA_RP_MANAGED);
            });
        }
    };

    /**
     * @param {string|null|undefined} jsonString
     * @returns {string[]}
     */
    const parseJsonStringArray = function parseJsonStringArray(jsonString) {
        if (!jsonString || !_.isString(jsonString)) {
            return [];
        }

        try {
            const parsed = JSON.parse(jsonString);

            return _.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    /**
     * @param {Object} interaction
     * @returns {string[]}
     */
    const getTextEntryResponseIdentifiers = function getTextEntryResponseIdentifiers(interaction) {
        return _.chain(getItemTextEntries(interaction))
            .map(textEntry => (_.isFunction(textEntry.attr) ? textEntry.attr('responseIdentifier') : null))
            .filter(Boolean)
            .uniq()
            .value();
    };

    /**
     * @param {Object[]} groups
     * @returns {Object[]}
     */
    const getScorableLexicalGroups = function getScorableLexicalGroups(groups) {
        return _.filter(normalizeLexicalGroups(groups), group => group.synonyms.length > 0);
    };

    /**
     * @param {Object} item
     * @returns {Object|null}
     */
    const ensureItemResponseProcessing = function ensureItemResponseProcessing(item) {
        if (!item) {
            return null;
        }

        if (item.responseProcessing) {
            return item.responseProcessing;
        }

        if (_.isFunction(item.createResponseProcessing)) {
            return item.createResponseProcessing();
        }

        return null;
    };

    /**
     * @param {Object} item
     * @param {string} xml
     */
    const updateCustomResponseProcessing = function updateCustomResponseProcessing(item, xml) {
        const rp = ensureItemResponseProcessing(item);

        if (!rp || !_.isString(xml) || !xml.trim()) {
            return;
        }

        if (_.isFunction(rp.setProcessingType)) {
            rp.setProcessingType('custom', xml);
        } else {
            rp.processingType = 'custom';
            rp.xml = xml;
        }
    };

    /**
     * @param {Object} item
     * @param {string} identifier
     * @param {Object} attributes
     * @param {number|null} [defaultValue]
     * @returns {Object}
     */
    const ensureOutcomeDeclaration = function ensureOutcomeDeclaration(item, identifier, attributes, defaultValue) {
        let outcome = item.getOutcomeDeclaration(identifier);

        if (!outcome) {
            outcome = item.createOutcomeDeclaration(_.clone(attributes));
            outcome.buildIdentifier(identifier, false);
        }

        if (!_.isUndefined(defaultValue) && _.isFunction(outcome.setDefaultValue)) {
            outcome.setDefaultValue(defaultValue);
        }

        return outcome;
    };

    /**
     * @param {Object} item
     * @param {Object} primaryTextEntry
     * @param {Object[]} groups
     * @param {number} maxScore
     */
    const syncOutcomeDeclarations = function syncOutcomeDeclarations(item, primaryTextEntry, groups, maxScore) {
        const desiredGroupIds = _.map(groups, 'id');
        const previousManaged = parseJsonStringArray(primaryTextEntry.attr(DATA_MANAGED_OUTCOMES));

        _.forEach(previousManaged, id => {
            if (!_.includes(desiredGroupIds, id)) {
                item.removeOutcome(id);
            }
        });

        _.forEach(desiredGroupIds, id => {
            const groupOutcome = ensureOutcomeDeclaration(
                item,
                id,
                {
                    cardinality: 'single',
                    baseType: 'integer'
                },
                0
            );

            groupOutcome.attr('normalMinimum', 0);
            groupOutcome.attr('normalMaximum', 1);
        });

        const scoreOutcome = ensureOutcomeDeclaration(
            item,
            'SCORE',
            {
                cardinality: 'single',
                baseType: 'float'
            },
            0
        );

        scoreOutcome.attr('normalMinimum', 0);
        scoreOutcome.attr('normalMaximum', maxScore);

        ensureOutcomeDeclaration(
            item,
            'MAXSCORE',
            {
                cardinality: 'single',
                baseType: 'float'
            },
            maxScore
        );

        primaryTextEntry.attr(DATA_MANAGED_OUTCOMES, JSON.stringify(desiredGroupIds));
    };

    /**
     * @param {Object} primaryTextEntry
     */
    const stripInternalAuthoringAttrs = function stripInternalAuthoringAttrs(primaryTextEntry) {
        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.removeAttr)) {
            return;
        }

        primaryTextEntry.removeAttr(DATA_MANAGED_OUTCOMES);
        primaryTextEntry.removeAttr(DATA_RP_MANAGED);
    };

    /**
     * @param {Object} interaction
     */
    const ensureUmfiResponseTemplates = function ensureUmfiResponseTemplates(interaction) {
        if (!isUmfiEnabled(interaction)) {
            return;
        }

        _.forEach(getItemTextEntries(interaction), textEntry => {
            if (!_.isFunction(textEntry.getResponseDeclaration)) {
                return;
            }

            const response = textEntry.getResponseDeclaration();

            if (response && _.isFunction(response.setTemplate)) {
                response.setTemplate('CUSTOM');
            }
        });
    };

    /**
     * @param {Object} item
     */
    const ensurePersistedBeforeSave = function ensurePersistedBeforeSave(item) {
        const sampleInteraction = {
            getRootElement: function getRootElement() {
                return item;
            }
        };
        const textEntries = getItemTextEntries(sampleInteraction);
        const primaryTextEntry = getPrimaryTextEntry(textEntries);

        if (!primaryTextEntry) {
            return;
        }

        const config = getEvaluationConfig(sampleInteraction);

        if (!config.evaluateAsUmfi) {
            stripInternalAuthoringAttrs(primaryTextEntry);
            return;
        }

        syncResponseProcessing(sampleInteraction, config);
        stripInternalAuthoringAttrs(primaryTextEntry);
    };

    /**
     * @param {Object} interaction
     */
    const clearUmfiResponseProcessing = function clearUmfiResponseProcessing(interaction) {
        const item = interaction.getRootElement();
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);

        if (!item || !primaryTextEntry) {
            return;
        }

        if (primaryTextEntry.attr(DATA_RP_MANAGED) === 'true' || isUmfiEnabled(interaction)) {
            const rp = item.responseProcessing;

            if (rp && rp.processingType === 'custom' && _.isFunction(rp.setProcessingType)) {
                rp.setProcessingType('templateDriven');
            }

            primaryTextEntry.removeAttr(DATA_RP_MANAGED);
        }

        _.forEach(parseJsonStringArray(primaryTextEntry.attr(DATA_MANAGED_OUTCOMES)), id => {
            item.removeOutcome(id);
        });

        primaryTextEntry.removeAttr(DATA_MANAGED_OUTCOMES);
    };

    /**
     * @param {Object} interaction
     * @param {{evaluateAsUmfi?: boolean, lexicalGroups?: Object[]}} config
     */
    const syncResponseProcessing = function syncResponseProcessing(interaction, config) {
        const item = interaction && _.isFunction(interaction.getRootElement) ? interaction.getRootElement() : null;
        const primaryTextEntry = getPrimaryTextEntryForInteraction(interaction);
        const lexicalGroups =
            config && config.lexicalGroups ? normalizeLexicalGroups(config.lexicalGroups) : getLexicalGroups(interaction);
        const scorableGroups = getScorableLexicalGroups(lexicalGroups);

        if (!item || !primaryTextEntry || !isUmfiEnabled(interaction) || !scorableGroups.length) {
            return;
        }

        const responseIdentifiers = getTextEntryResponseIdentifiers(interaction);

        if (!responseIdentifiers.length) {
            return;
        }

        const rpConfig = synonymGroupGenerator.normalizeConfig({
            interactions: responseIdentifiers,
            synonymGroups: _.map(scorableGroups, group => ({
                id: group.id,
                label: group.identifier,
                synonyms: group.synonyms
            })),
            caseSensitive: isCaseSensitive(interaction)
        });

        synonymGroupGenerator.validateConfig(rpConfig);

        const rpXml = synonymGroupGenerator.generateResponseProcessing(rpConfig);
        const maxScore = synonymGroupGenerator.getMaxScore(rpConfig);

        updateCustomResponseProcessing(item, rpXml);
        ensureUmfiResponseTemplates(interaction);
        primaryTextEntry.attr(DATA_RP_MANAGED, 'true');
        syncOutcomeDeclarations(item, primaryTextEntry, scorableGroups, maxScore);
    };

    /**
     * @param {number} index
     * @returns {string}
     */
    const buildDefaultLexicalGroupIdentifier = function buildDefaultLexicalGroupIdentifier(index) {
        return `${LEXICAL_GROUP_PREFIX}${index + 1}${GROUP_OUTCOME_SUFFIX}`;
    };

    /**
     * @param {string} identifier
     * @returns {string}
     */
    const buildGroupOutcomeId = function buildGroupOutcomeId(identifier) {
        const normalized = String(identifier || '')
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();

        if (!normalized) {
            return '';
        }

        if (normalized.endsWith(GROUP_OUTCOME_SUFFIX)) {
            return normalized;
        }

        return `${normalized}${GROUP_OUTCOME_SUFFIX}`;
    };

    /**
     * @param {Array<{identifier?: string}>} [groups]
     * @returns {string}
     */
    const buildNextLexicalGroupIdentifier = function buildNextLexicalGroupIdentifier(groups) {
        const normalized = normalizeLexicalGroups(groups || []);
        const usedIdentifiers = _.map(normalized, 'identifier');
        let index = normalized.length;
        let identifier = buildDefaultLexicalGroupIdentifier(index);

        while (_.includes(usedIdentifiers, identifier)) {
            index += 1;
            identifier = buildDefaultLexicalGroupIdentifier(index);
        }

        return identifier;
    };

    /**
     * @param {string[]} values
     * @returns {string[]}
     */
    const normalizeVariantList = function normalizeVariantList(values) {
        return _.chain(values || [])
            .map(String)
            .map(value => value.trim())
            .filter(Boolean)
            .value();
    };

    /**
     * @param {string} value
     * @param {boolean} [caseSensitive=false]
     * @returns {string}
     */
    const normalizeVariantForCompare = function normalizeVariantForCompare(value, caseSensitive) {
        const trimmed = String(value || '').trim();

        return caseSensitive ? trimmed : trimmed.toLowerCase();
    };

    /**
     * @param {string[]} variants
     * @param {string} candidate
     * @param {boolean} [caseSensitive=false]
     * @returns {boolean}
     */
    const hasLexicalVariant = function hasLexicalVariant(variants, candidate, caseSensitive) {
        const needle = normalizeVariantForCompare(candidate, caseSensitive);

        if (!needle) {
            return false;
        }

        return _.some(
            variants || [],
            variant => normalizeVariantForCompare(variant, caseSensitive) === needle
        );
    };

    /**
     * @param {Array<{id?: string, group?: string, identifier?: string, label?: string, canonical?: string, synonyms?: string[], variants?: string[], collapsed?: boolean}>} groups
     * @returns {Array<{id: string, identifier: string, canonical: string, synonyms: string[], collapsed: boolean}>}
     */
    const normalizeLexicalGroups = function normalizeLexicalGroups(groups) {
        const usedIdentifiers = {};
        const usedOutcomeIds = {};

        return _.map(groups || [], (group, index) => {
            const explicitCanonical = String(group.canonical || '').trim();
            const rawSynonyms = normalizeVariantList(group.synonyms || group.variants || []);
            const synonyms = explicitCanonical
                ? _.uniq([explicitCanonical].concat(rawSynonyms))
                : rawSynonyms;
            const requestedIdentifier = String(
                group.group || group.id || group.identifier || group.groupIdentifier || group.label || ''
            ).trim();
            let identifier =
                buildGroupOutcomeId(requestedIdentifier) || buildDefaultLexicalGroupIdentifier(index);
            let identifierIndex = index;

            while (usedIdentifiers[identifier]) {
                identifierIndex += 1;
                identifier = buildDefaultLexicalGroupIdentifier(identifierIndex);
            }

            usedIdentifiers[identifier] = true;

            let id = identifier;
            let suffix = 1;
            const outcomeBase = id.replace(new RegExp(`${GROUP_OUTCOME_SUFFIX}$`), '');

            while (usedOutcomeIds[id]) {
                id = `${outcomeBase}_${suffix}${GROUP_OUTCOME_SUFFIX}`;
                suffix += 1;
            }

            usedOutcomeIds[id] = true;
            identifier = id;

            return {
                id,
                identifier,
                canonical: synonyms[0] || '',
                synonyms,
                draftVariant: !!group.draftVariant
            };
        });
    };

    /**
     * @param {*} entry
     * @returns {{identifier: string, canonical?: string, synonyms: string[]}}
     */
    const mapDataUmfiEntry = function mapDataUmfiEntry(entry) {
        if (_.isObject(entry) && !_.isArray(entry)) {
            const canonical = String(entry.canonical || '').trim();
            const variants = normalizeVariantList(entry.variants || entry.synonyms || []);
            const storedGroup = String(
                entry.group || entry.id || entry.identifier || entry.groupIdentifier || ''
            ).trim();
            const legacyLabel = _.isString(entry.label) ? entry.label.trim() : '';

            return {
                identifier: storedGroup || legacyLabel,
                canonical,
                synonyms: canonical ? _.uniq([canonical].concat(variants)) : variants
            };
        }

        const synonyms = normalizeVariantList(entry);

        return {
            identifier: '',
            canonical: synonyms[0] || '',
            synonyms
        };
    };

    /**
     * @param {string|null|undefined} jsonString
     * @returns {Array<{identifier: string, canonical: string, synonyms: string[]}>}
     */
    const parseDataUmfiValues = function parseDataUmfiValues(jsonString) {
        if (!jsonString || !_.isString(jsonString)) {
            return [];
        }

        try {
            const parsed = JSON.parse(jsonString);

            if (parsed && typeof parsed === 'object' && !_.isArray(parsed)) {
                return normalizeLexicalGroups(
                    _.map(parsed, (variants, identifier) => ({
                        identifier: String(identifier),
                        synonyms: _.isArray(variants) ? variants : []
                    }))
                );
            }

            if (_.isArray(parsed)) {
                return normalizeLexicalGroups(_.map(parsed, mapDataUmfiEntry));
            }

            return [];
        } catch (e) {
            return [];
        }
    };

    /**
     * @param {Array<{identifier?: string, synonyms: string[]}>} groups
     * @returns {string}
     */
    const serializeDataUmfiValues = function serializeDataUmfiValues(groups) {
        const payload = _.chain(normalizeLexicalGroups(groups))
            .map(group => {
                const synonyms = normalizeVariantList(group.synonyms);

                if (!synonyms.length) {
                    return null;
                }

                return {
                    group: group.id,
                    canonical: synonyms[0],
                    variants: synonyms
                };
            })
            .filter(Boolean)
            .value();

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
            clearUmfiResponseProcessing(interaction);
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

        syncResponseProcessing(interaction, {
            evaluateAsUmfi: isUmfiEnabled(interaction),
            lexicalGroups: getLexicalGroups(interaction)
        });
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
        PRIMARY_RESPONSE_IDENTIFIER,
        DATA_ITEM_TYPE,
        DATA_UMFI_VALUES,
        DATA_CASE_SENSITIVE,
        DATA_ALLOW_LEXICAL_FIELDS,
        DATA_MANAGED_OUTCOMES,
        DATA_RP_MANAGED,
        getItemTextEntries,
        getPrimaryTextEntry,
        getTextEntrySerial,
        getTextEntryResponseIdentifier,
        getTextEntryResponseIdentifiers,
        isUmfiEnabled,
        isAllowLexicalFieldsOnScoring,
        isCaseSensitive,
        getLexicalGroups,
        getEvaluationConfig,
        getScorableLexicalGroups,
        normalizeLexicalGroups,
        hasLexicalVariant,
        parseDataUmfiValues,
        serializeDataUmfiValues,
        buildDefaultLexicalGroupIdentifier,
        buildNextLexicalGroupIdentifier,
        buildGroupOutcomeId,
        LEXICAL_GROUP_PREFIX,
        GROUP_OUTCOME_SUFFIX,
        setUmfiEnabled,
        setAllowLexicalFieldsOnScoring,
        setLexicalGroups,
        setCaseSensitive,
        syncResponseProcessing,
        clearUmfiResponseProcessing,
        persistEvaluationConfig,
        stripInternalAuthoringAttrs,
        ensureUmfiResponseTemplates,
        ensurePersistedBeforeSave
    };
});
