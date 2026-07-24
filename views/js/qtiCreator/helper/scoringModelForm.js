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
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/scoringModelHelper',
    'taoQtiItem/qtiCreator/widgets/helpers/featureFlags',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/scoringModelLevel'
], function ($, _, scoringModelHelper, featureFlags, formElement, scoringModelLevelTpl) {
    'use strict';

    const NS = '.scoringModel';

    /**
     * @param {Object[]} levels
     * @returns {Object[]}
     */
    const prepareLevelsForTpl = function prepareLevelsForTpl(levels) {
        return _.map(levels || [], (level, index) =>
            Object.assign({}, level, {
                index
            })
        );
    };

    /**
     * @param {Object} interaction
     * @returns {Object}
     */
    const getTplData = function getTplData(interaction) {
        const showScoringModel =
            featureFlags.isMultiFieldScoringAvailable() &&
            scoringModelHelper.shouldShowScoringModel(interaction);
        const config = scoringModelHelper.getScoringModelConfig(interaction);
        const model = config.model;
        const thresholds = scoringModelHelper.ensureThresholdsForModel(model, config.thresholds);
        const dichotomous = thresholds[0] || {
            threshold: scoringModelHelper.DEFAULT_DICHOTOMOUS_THRESHOLD,
            score: scoringModelHelper.DEFAULT_DICHOTOMOUS_SCORE
        };

        return {
            showScoringModel,
            scoringModel: model,
            isSimpleSum: model === scoringModelHelper.MODEL_SIMPLE_SUM,
            isDichotomous: model === scoringModelHelper.MODEL_DICHOTOMOUS,
            isPolytomous: model === scoringModelHelper.MODEL_POLYTOMOUS,
            dichotomousThreshold: dichotomous.threshold,
            dichotomousScore: dichotomous.score,
            scoringLevels: prepareLevelsForTpl(
                model === scoringModelHelper.MODEL_POLYTOMOUS ? thresholds : scoringModelHelper.DEFAULT_POLYTOMOUS_LEVELS
            )
        };
    };

    /**
     * @param {Object} widget
     * @returns {{model: string, thresholds: Object[]}}
     */
    const getWidgetConfig = function getWidgetConfig(widget) {
        if (!widget._scoringModelConfig) {
            widget._scoringModelConfig = scoringModelHelper.getScoringModelConfig(widget.element);
        }

        return widget._scoringModelConfig;
    };

    /**
     * @param {Object} widget
     * @param {{model: string, thresholds: Object[]}} config
     */
    const setWidgetConfig = function setWidgetConfig(widget, config) {
        widget._scoringModelConfig = config;
        scoringModelHelper.persistScoringModelConfig(widget.element, config);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {string} model
     */
    const toggleModelDetails = function toggleModelDetails($responseForm, model) {
        $responseForm
            .find('.scoring-model-simple-sum')
            .toggleClass('hidden', model !== scoringModelHelper.MODEL_SIMPLE_SUM);
        $responseForm
            .find('.scoring-model-dichotomous')
            .toggleClass('hidden', model !== scoringModelHelper.MODEL_DICHOTOMOUS);
        $responseForm
            .find('.scoring-model-polytomous')
            .toggleClass('hidden', model !== scoringModelHelper.MODEL_POLYTOMOUS);
    };

    /**
     * @param {jQuery} $responseForm
     * @returns {Object[]}
     */
    const readPolytomousLevelsFromForm = function readPolytomousLevelsFromForm($responseForm) {
        const levels = [];

        $responseForm.find('.scoring-model-level').each(function () {
            const $level = $(this);
            const thresholdRaw = String($level.find('.scoring-level-threshold').val() || '').trim();
            const scoreRaw = String($level.find('.scoring-level-score').val() || '').trim();

            if (!thresholdRaw.length || !scoreRaw.length) {
                return;
            }

            const threshold = Number(thresholdRaw);
            const score = Number(scoreRaw);

            if (_.isFinite(threshold) && _.isFinite(score)) {
                levels.push({ threshold, score });
            }
        });

        return scoringModelHelper.normalizeThresholds(levels);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @returns {{model: string, thresholds: Object[]}}
     */
    const syncConfigFromForm = function syncConfigFromForm($responseForm, widget) {
        const model =
            $responseForm.find('input[name="scoringModel"]:checked').val() ||
            scoringModelHelper.MODEL_SIMPLE_SUM;
        let thresholds = [];

        if (model === scoringModelHelper.MODEL_DICHOTOMOUS) {
            thresholds = [
                {
                    threshold: Number($responseForm.find('input[name="dichotomousThreshold"]').val()),
                    score: Number($responseForm.find('input[name="dichotomousScore"]').val())
                }
            ];
        } else if (model === scoringModelHelper.MODEL_POLYTOMOUS) {
            thresholds = readPolytomousLevelsFromForm($responseForm);
        }

        const config = {
            model,
            thresholds: scoringModelHelper.ensureThresholdsForModel(model, thresholds)
        };

        setWidgetConfig(widget, config);

        return config;
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const renderPolytomousLevels = function renderPolytomousLevels($responseForm, widget) {
        const config = getWidgetConfig(widget);
        const levels = scoringModelHelper.ensureThresholdsForModel(
            scoringModelHelper.MODEL_POLYTOMOUS,
            config.thresholds
        );
        const $list = $responseForm.find('.scoring-model-level-list');

        $list.empty();

        _.forEach(prepareLevelsForTpl(levels), level => {
            $list.append(scoringModelLevelTpl(level));
        });

        formElement.initWidget($list);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {{evaluateAsUmfi?: boolean, responseTemplate?: string}} [options]
     */
    const updateVisibility = function updateVisibility($responseForm, widget, options) {
        const $evaluateAsUmfi = $responseForm.find('input[name="evaluateAsUmfi"]');
        const $responseTemplate = $responseForm.find('select[name="template"]');
        const visibilityOptions = Object.assign({}, options || {});

        if (typeof visibilityOptions.evaluateAsUmfi !== 'boolean' && $evaluateAsUmfi.length) {
            visibilityOptions.evaluateAsUmfi = $evaluateAsUmfi.prop('checked');
        }

        if (!visibilityOptions.responseTemplate && $responseTemplate.length) {
            visibilityOptions.responseTemplate = $responseTemplate.val();
        }

        const show = scoringModelHelper.shouldShowScoringModel(widget.element, visibilityOptions);

        $responseForm.find('.scoring-model-panel, .scoring-model-separator').toggleClass('hidden', !show);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const bindEvents = function bindEvents($responseForm, widget) {
        if (!$responseForm || !$responseForm.length || !$responseForm.find('.scoring-model-panel').length) {
            return;
        }

        $responseForm.off(NS);

        updateVisibility($responseForm, widget);

        $responseForm.on(`change${NS}`, 'input[name="evaluateAsUmfi"]', function () {
            updateVisibility($responseForm, widget, {
                evaluateAsUmfi: $(this).prop('checked')
            });
        });

        $responseForm.on(`change${NS}`, 'input[name="scoringModel"]', function () {
            const model = $(this).val();
            const previous = getWidgetConfig(widget);
            const config = {
                model,
                thresholds: scoringModelHelper.ensureThresholdsForModel(model, previous.thresholds)
            };

            setWidgetConfig(widget, config);
            toggleModelDetails($responseForm, model);

            if (model === scoringModelHelper.MODEL_DICHOTOMOUS) {
                const level = config.thresholds[0];

                $responseForm.find('input[name="dichotomousThreshold"]').val(level.threshold);
                $responseForm.find('input[name="dichotomousScore"]').val(level.score);
            }

            if (model === scoringModelHelper.MODEL_POLYTOMOUS) {
                renderPolytomousLevels($responseForm, widget);
            }
        });

        $responseForm.on(
            `change${NS} keyup${NS}`,
            'input[name="dichotomousThreshold"], input[name="dichotomousScore"]',
            function () {
                syncConfigFromForm($responseForm, widget);
            }
        );

        $responseForm.on(
            `change${NS} keyup${NS}`,
            '.scoring-level-threshold, .scoring-level-score',
            function () {
                syncConfigFromForm($responseForm, widget);
            }
        );

        $responseForm.on(`click${NS}`, '[data-action="add-scoring-level"]', function (e) {
            e.preventDefault();

            const config = syncConfigFromForm($responseForm, widget);
            const thresholds = scoringModelHelper.ensureThresholdsForModel(
                scoringModelHelper.MODEL_POLYTOMOUS,
                config.thresholds
            );
            const lowest = thresholds.length ? thresholds[thresholds.length - 1].threshold : 1;

            thresholds.push({
                threshold: Math.max(0, lowest - 1),
                score: 0
            });

            setWidgetConfig(widget, {
                model: scoringModelHelper.MODEL_POLYTOMOUS,
                thresholds
            });
            renderPolytomousLevels($responseForm, widget);
        });

        $responseForm.on(`click${NS}`, '[data-action="remove-scoring-level"]', function (e) {
            e.preventDefault();

            const $level = $(this).closest('.scoring-model-level');
            const index = Number($level.data('level-index'));
            const config = syncConfigFromForm($responseForm, widget);
            let thresholds = scoringModelHelper.ensureThresholdsForModel(
                scoringModelHelper.MODEL_POLYTOMOUS,
                config.thresholds
            );

            if (thresholds.length <= 2) {
                return;
            }

            thresholds = _.filter(thresholds, (level, levelIndex) => levelIndex !== index);

            setWidgetConfig(widget, {
                model: scoringModelHelper.MODEL_POLYTOMOUS,
                thresholds
            });
            renderPolytomousLevels($responseForm, widget);
        });
    };

    /**
     * Flush open scoring-model form state into the item model before save.
     *
     * @param {Object} item
     */
    const flushOpenForms = function flushOpenForms(item) {
        if (!item) {
            return;
        }

        const sampleInteraction = {
            getRootElement: function getRootElement() {
                return item;
            }
        };
        const textEntries = scoringModelHelper.getItemTextEntries(sampleInteraction);

        _.forEach(textEntries, textEntry => {
            const widget = textEntry.data && textEntry.data('widget');

            if (!widget || !widget.$responseForm || !widget.$responseForm.find('.scoring-model-panel').length) {
                return;
            }

            delete widget._scoringModelConfig;
            syncConfigFromForm(widget.$responseForm, widget);
        });
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} [widget]
     */
    const unbindEvents = function unbindEvents($responseForm, widget) {
        if ($responseForm && $responseForm.length) {
            $responseForm.off(NS);
        }

        if (widget) {
            delete widget._scoringModelConfig;
        }
    };

    return {
        getTplData,
        bindEvents,
        unbindEvents,
        syncConfigFromForm,
        updateVisibility,
        flushOpenForms,
        readPolytomousLevelsFromForm
    };
});
