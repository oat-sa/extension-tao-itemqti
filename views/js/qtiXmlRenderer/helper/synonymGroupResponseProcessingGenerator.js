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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/synonym_group_condition',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/synonym_group_score_sum',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/outcomes/synonym_group_outcome',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/outcomes/synonym_group_score_outcomes'
], function (_, synonymGroupTpl, scoreSumTpl, groupOutcomeTpl, scoreOutcomesTpl) {
    'use strict';

    /**
     * Authoring-time definition of a synonym group (not a native QTI construct).
     * Compiled into responseProcessing stringMatch rules and intermediate outcomes.
     *
     * @typedef {Object} SynonymGroupDefinition
     * @property {string} id Outcome identifier for the group flag (e.g. GERMANY_FOUND)
     * @property {string} [label] Display label for authoring (not serialized to QTI)
     * @property {string[]} synonyms Accepted equivalent text values for this group
     * @property {string[]} [variants] Alias of synonyms (deprecated name, kept for compatibility)
     * @property {string[]} [aliases] Alias of synonyms (deprecated name, kept for compatibility)
     * @property {number} [maxScore=1] Maximum score contributed by this group
     */

    /**
     * @typedef {Object} SynonymGroupResponseProcessingConfig
     * @property {string[]} interactions Text entry response identifiers
     * @property {SynonymGroupDefinition[]} synonymGroups Synonym groups to score holistically
     * @property {boolean} [caseSensitive=false] stringMatch case sensitivity
     * @property {string} [scoreOutcome=SCORE] Final score outcome identifier
     */

    const DEFAULT_SCORE_OUTCOME = 'SCORE';

    const resolveSynonyms = group => group.synonyms || group.variants || group.aliases || [];

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {SynonymGroupResponseProcessingConfig}
     */
    const normalizeConfig = function normalizeConfig(config) {
        const normalized = _.cloneDeep(config);

        normalized.caseSensitive = normalized.caseSensitive === true;
        normalized.scoreOutcome = normalized.scoreOutcome || DEFAULT_SCORE_OUTCOME;
        normalized.synonymGroups = _.map(normalized.synonymGroups, group => ({
            id: group.id,
            label: group.label,
            synonyms: _.map(resolveSynonyms(group), String),
            maxScore: _.isUndefined(group.maxScore) ? 1 : group.maxScore
        }));

        return normalized;
    };

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     */
    const validateConfig = function validateConfig(config) {
        if (!config || !_.isObject(config)) {
            throw new TypeError('Synonym group response processing config must be an object');
        }

        if (!_.isArray(config.interactions) || !config.interactions.length) {
            throw new Error('Synonym group response processing requires at least one interaction identifier');
        }

        if (!_.isArray(config.synonymGroups) || !config.synonymGroups.length) {
            throw new Error('Synonym group response processing requires at least one synonym group');
        }

        const outcomeIds = {};

        _.forEach(config.synonymGroups, (group, index) => {
            if (!group.id || !_.isString(group.id)) {
                throw new Error(`Synonym group at index ${index} requires a string id`);
            }

            if (outcomeIds[group.id]) {
                throw new Error(`Duplicate synonym group outcome identifier: ${group.id}`);
            }

            outcomeIds[group.id] = true;

            if (!_.isArray(group.synonyms) || !group.synonyms.length) {
                throw new Error(`Synonym group "${group.id}" requires at least one synonym`);
            }

            if (!_.isFinite(group.maxScore) || group.maxScore < 0) {
                throw new Error(`Synonym group "${group.id}" requires a non-negative maxScore`);
            }
        });

        if (outcomeIds[config.scoreOutcome]) {
            throw new Error(`scoreOutcome "${config.scoreOutcome}" must not collide with a synonym group id`);
        }
    };

    /**
     * @param {string[]} interactions
     * @param {string[]} synonyms
     * @param {boolean} caseSensitive
     * @returns {Array<{responseIdentifier: string, synonym: string, caseSensitive: string}>}
     */
    const buildMatches = function buildMatches(interactions, synonyms, caseSensitive) {
        const caseSensitiveAttr = caseSensitive ? 'true' : 'false';
        const matches = [];

        _.forEach(interactions, responseIdentifier => {
            _.forEach(synonyms, synonym => {
                matches.push({
                    responseIdentifier,
                    synonym,
                    caseSensitive: caseSensitiveAttr
                });
            });
        });

        return matches;
    };

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {number}
     */
    const getMaxScore = function getMaxScore(config) {
        return _.reduce(
            config.synonymGroups,
            (total, group) => total + (_.isUndefined(group.maxScore) ? 1 : group.maxScore),
            0
        );
    };

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {string}
     */
    const generateResponseProcessing = function generateResponseProcessing(config) {
        const normalized = normalizeConfig(config);

        validateConfig(normalized);

        const rules = _.map(normalized.synonymGroups, group =>
            synonymGroupTpl({
                outcomeId: group.id,
                maxScore: group.maxScore,
                matches: buildMatches(normalized.interactions, group.synonyms, normalized.caseSensitive)
            })
        );

        rules.push(
            scoreSumTpl({
                scoreOutcome: normalized.scoreOutcome,
                groupOutcomeIds: _.map(normalized.synonymGroups, 'id')
            })
        );

        return `<responseProcessing>\n${rules.join('\n')}\n</responseProcessing>`;
    };

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {string} outcomeDeclaration XML for synonym group flags, SCORE and MAXSCORE
     */
    const generateOutcomeDeclarations = function generateOutcomeDeclarations(config) {
        const normalized = normalizeConfig(config);

        validateConfig(normalized);

        const groupOutcomes = _.map(normalized.synonymGroups, group =>
            groupOutcomeTpl({ identifier: group.id })
        );

        groupOutcomes.push(
            scoreOutcomesTpl({
                scoreOutcome: normalized.scoreOutcome,
                maxScore: getMaxScore(normalized)
            })
        );

        return groupOutcomes.join('\n');
    };

    return {
        normalizeConfig,
        validateConfig,
        buildMatches,
        getMaxScore,
        generateResponseProcessing,
        generateOutcomeDeclarations
    };
});
