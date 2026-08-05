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
    'taoQtiItem/qtiXmlRenderer/helper/scoringModelResponseProcessingGenerator',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/synonym_group_condition',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/synonym_group_score_sum',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/outcomes/synonym_group_outcome',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/outcomes/synonym_group_score_outcomes'
], function (
    _,
    scoringModelRpGenerator,
    synonymGroupTpl,
    scoreSumTpl,
    groupOutcomeTpl,
    scoreOutcomesTpl
) {
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
     * @typedef {Object} SynonymGroupThreshold
     * @property {number} threshold
     * @property {number} score
     */

    /**
     * @typedef {Object} SynonymGroupResponseProcessingConfig
     * @property {string[]} interactions Text entry response identifiers
     * @property {SynonymGroupDefinition[]} synonymGroups Synonym groups to score holistically
     * @property {boolean} [caseSensitive=false] stringMatch case sensitivity
     * @property {string} [scoreOutcome=SCORE] Final score outcome identifier
     * @property {string} [tempScoreOutcome=TEMP_SCORE] Intermediate sum when thresholds apply
     * @property {SynonymGroupThreshold[]} [thresholds] Optional dichotomous/polytomous ladder
     */

    const DEFAULT_SCORE_OUTCOME = 'SCORE';
    const DEFAULT_TEMP_SCORE_OUTCOME = scoringModelRpGenerator.DEFAULT_TEMP_SCORE_OUTCOME;

    const resolveSynonyms = group => group.synonyms || group.variants || group.aliases || [];

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {SynonymGroupResponseProcessingConfig}
     */
    const normalizeConfig = function normalizeConfig(config) {
        const normalized = _.cloneDeep(config) || {};

        normalized.caseSensitive = normalized.caseSensitive === true;
        normalized.scoreOutcome = normalized.scoreOutcome || DEFAULT_SCORE_OUTCOME;
        normalized.tempScoreOutcome = normalized.tempScoreOutcome || DEFAULT_TEMP_SCORE_OUTCOME;
        normalized.synonymGroups = _.map(normalized.synonymGroups || [], group => ({
            id: group.id,
            label: group.label,
            synonyms: _.map(resolveSynonyms(group), String),
            maxScore: _.isUndefined(group.maxScore) ? 1 : group.maxScore
        }));
        normalized.thresholds = _.chain(normalized.thresholds || [])
            .map(entry => ({
                threshold: Number(entry.threshold),
                score: Number(entry.score)
            }))
            .filter(entry => _.isFinite(entry.threshold) && _.isFinite(entry.score))
            .sortBy(entry => -entry.threshold)
            .value();

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

        if (config.thresholds && config.thresholds.length && outcomeIds[config.tempScoreOutcome]) {
            throw new Error(
                `tempScoreOutcome "${config.tempScoreOutcome}" must not collide with a synonym group id`
            );
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
    const getGroupSumMaxScore = function getGroupSumMaxScore(config) {
        const groups = (config && config.synonymGroups) || [];

        return _.reduce(
            groups,
            (total, group) => total + (_.isUndefined(group.maxScore) ? 1 : Number(group.maxScore)),
            0
        );
    };

    /**
     * When thresholds are configured, MAXSCORE is the highest threshold score.
     * Otherwise it is the sum of group maxScore values.
     *
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {number}
     */
    const getMaxScore = function getMaxScore(config) {
        const normalized = normalizeConfig(config);

        if (normalized.thresholds.length) {
            return scoringModelRpGenerator.getMaxScore({
                interactions: normalized.interactions,
                thresholds: normalized.thresholds
            });
        }

        return getGroupSumMaxScore(normalized);
    };

    /**
     * @param {SynonymGroupResponseProcessingConfig} config
     * @returns {boolean}
     */
    const hasThresholds = function hasThresholds(config) {
        const normalized = normalizeConfig(config);

        return normalized.thresholds.length > 0;
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

        const sumTargetOutcome = normalized.thresholds.length
            ? normalized.tempScoreOutcome
            : normalized.scoreOutcome;

        rules.push(
            scoreSumTpl({
                scoreOutcome: sumTargetOutcome,
                groupOutcomeIds: _.map(normalized.synonymGroups, 'id')
            })
        );

        if (normalized.thresholds.length) {
            rules.push(
                scoringModelRpGenerator.buildThresholdRules(
                    normalized.thresholds,
                    normalized.tempScoreOutcome,
                    normalized.scoreOutcome
                )
            );
        }

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
        DEFAULT_SCORE_OUTCOME,
        DEFAULT_TEMP_SCORE_OUTCOME,
        normalizeConfig,
        validateConfig,
        buildMatches,
        getMaxScore,
        hasThresholds,
        generateResponseProcessing,
        generateOutcomeDeclarations
    };
});
