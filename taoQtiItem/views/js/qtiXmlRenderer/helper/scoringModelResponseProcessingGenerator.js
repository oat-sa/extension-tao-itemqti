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

    const DEFAULT_TEMP_SCORE_OUTCOME = 'TEMP_SCORE';
    const DEFAULT_SCORE_OUTCOME = 'SCORE';

    /**
     * @typedef {Object} ScoringModelThreshold
     * @property {number} threshold
     * @property {number} score
     */

    /**
     * @typedef {Object} ScoringModelResponseProcessingConfig
     * @property {string[]} interactions Response declaration identifiers
     * @property {ScoringModelThreshold[]} thresholds Sorted by threshold desc
     * @property {string} [tempScoreOutcome=TEMP_SCORE]
     * @property {string} [scoreOutcome=SCORE]
     */

    /**
     * @param {ScoringModelResponseProcessingConfig} config
     * @returns {ScoringModelResponseProcessingConfig}
     */
    const normalizeConfig = function normalizeConfig(config) {
        const normalized = _.cloneDeep(config) || {};

        normalized.interactions = _.filter(normalized.interactions || [], _.isString);
        normalized.thresholds = _.chain(normalized.thresholds || [])
            .map(entry => ({
                threshold: Number(entry.threshold),
                score: Number(entry.score)
            }))
            .filter(entry => _.isFinite(entry.threshold) && _.isFinite(entry.score))
            .sortBy(entry => -entry.threshold)
            .value();
        normalized.tempScoreOutcome = normalized.tempScoreOutcome || DEFAULT_TEMP_SCORE_OUTCOME;
        normalized.scoreOutcome = normalized.scoreOutcome || DEFAULT_SCORE_OUTCOME;

        return normalized;
    };

    /**
     * @param {ScoringModelResponseProcessingConfig} config
     */
    const validateConfig = function validateConfig(config) {
        if (!config || !_.isObject(config)) {
            throw new TypeError('Scoring model response processing config must be an object');
        }

        if (!_.isArray(config.interactions) || !config.interactions.length) {
            throw new Error('Scoring model response processing requires at least one interaction identifier');
        }

        if (!_.isArray(config.thresholds) || !config.thresholds.length) {
            throw new Error('Scoring model response processing requires at least one threshold');
        }
    };

    /**
     * @param {ScoringModelResponseProcessingConfig} config
     * @returns {number}
     */
    const getMaxScore = function getMaxScore(config) {
        const normalized = normalizeConfig(config);

        if (!normalized.thresholds.length) {
            return 0;
        }

        return Math.max.apply(
            null,
            _.map(normalized.thresholds, 'score').concat([0])
        );
    };

    /**
     * @param {string} responseIdentifier
     * @param {string} tempScoreOutcome
     * @returns {string}
     */
    const buildMapToTempRule = function buildMapToTempRule(responseIdentifier, tempScoreOutcome) {
        return [
            '<responseCondition>',
            '    <responseIf>',
            '        <not>',
            '            <isNull>',
            `                <variable identifier="${responseIdentifier}" />`,
            '            </isNull>',
            '        </not>',
            `        <setOutcomeValue identifier="${tempScoreOutcome}">`,
            '            <sum>',
            `                <variable identifier="${tempScoreOutcome}" />`,
            `                <mapResponse identifier="${responseIdentifier}" />`,
            '            </sum>',
            '        </setOutcomeValue>',
            '    </responseIf>',
            '</responseCondition>'
        ].join('\n');
    };

    /**
     * @param {ScoringModelThreshold[]} thresholds
     * @param {string} tempScoreOutcome
     * @param {string} scoreOutcome
     * @returns {string}
     */
    const buildThresholdRules = function buildThresholdRules(thresholds, tempScoreOutcome, scoreOutcome) {
        const lines = ['<responseCondition>'];

        _.forEach(thresholds, (entry, index) => {
            const tag = index === 0 ? 'responseIf' : 'responseElseIf';

            lines.push(`    <${tag}>`);
            lines.push('        <gte>');
            lines.push(`            <variable identifier="${tempScoreOutcome}" />`);
            lines.push(`            <baseValue baseType="float">${entry.threshold}</baseValue>`);
            lines.push('        </gte>');
            lines.push(`        <setOutcomeValue identifier="${scoreOutcome}">`);
            lines.push(`            <baseValue baseType="float">${entry.score}</baseValue>`);
            lines.push('        </setOutcomeValue>');
            lines.push(`    </${tag}>`);
        });

        lines.push('    <responseElse>');
        lines.push(`        <setOutcomeValue identifier="${scoreOutcome}">`);
        lines.push('            <baseValue baseType="float">0</baseValue>');
        lines.push('        </setOutcomeValue>');
        lines.push('    </responseElse>');
        lines.push('</responseCondition>');

        return lines.join('\n');
    };

    /**
     * @param {ScoringModelResponseProcessingConfig} config
     * @returns {string}
     */
    const generateResponseProcessing = function generateResponseProcessing(config) {
        const normalized = normalizeConfig(config);

        validateConfig(normalized);

        const mapRules = _.map(normalized.interactions, responseIdentifier =>
            buildMapToTempRule(responseIdentifier, normalized.tempScoreOutcome)
        );
        const thresholdRules = buildThresholdRules(
            normalized.thresholds,
            normalized.tempScoreOutcome,
            normalized.scoreOutcome
        );

        return `<responseProcessing>\n${mapRules.concat(thresholdRules).join('\n')}\n</responseProcessing>`;
    };

    return {
        DEFAULT_TEMP_SCORE_OUTCOME,
        DEFAULT_SCORE_OUTCOME,
        normalizeConfig,
        validateConfig,
        getMaxScore,
        buildMapToTempRule,
        buildThresholdRules,
        generateResponseProcessing
    };
});
