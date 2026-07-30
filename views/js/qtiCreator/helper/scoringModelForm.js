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
    'i18n',
    'ui/tooltip',
    'ui/validator/validators',
    'taoQtiItem/qtiCreator/helper/scoringModelHelper',
    'taoQtiItem/qtiCreator/widgets/helpers/featureFlags',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/scoringModelLevel'
], function ($, _, __, tooltip, validators, scoringModelHelper, featureFlags, formElement, scoringModelLevelTpl) {
    'use strict';

    const NS = '.scoringModel';
    const INCREMENTER_DATA_NS = 'ui.incrementer';
    const THRESHOLD_INPUT_SELECTOR =
        'input[name="dichotomousThreshold"], input.scoring-level-threshold';
    const THRESHOLD_ERROR_TOOLTIP_MS = 10000;

    /**
     * @param {number} max
     * @returns {string}
     */
    const getCorrectResponsesMaxExceededMessage = function getCorrectResponsesMaxExceededMessage(max) {
        return __(
            'Correct responses cannot exceed %d because this item has only %d text entry fields.'
        )
            .replace('%d', String(max))
            .replace('%d', String(max));
    };

    /**
     * @returns {string}
     */
    const getCorrectResponsesDuplicateMessage = function getCorrectResponsesDuplicateMessage() {
        return __('This Correct responses value is already used by another level.');
    };

    /**
     * Build `data-validate` for scoring-model Correct-responses threshold fields.
     * Ensures thresholds are non-empty, numeric, and do not exceed the item's text-entry
     * field count (success thresholds for dichotomous/polytomous models).
     *
     * @param {number} max
     * @returns {string}
     */
    const buildThresholdValidateAttr = function buildThresholdValidateAttr(max) {
        return `$notEmpty; $numeric; $correctResponsesMax(max=${max});`;
    };

    validators.register(
        'correctResponsesMax',
        {
            name: 'correctResponsesMax',
            message: __(
                'Correct responses cannot exceed the number of text entry fields in this item.'
            ),
            validate: function validate(value, callback, options) {
                const max = Number(options && options.max);
                const number = Number(value);

                if (!_.isFinite(number) || !_.isFinite(max)) {
                    callback(true);
                    return;
                }

                callback(number <= max);
            }
        },
        true
    );

    /**
     * Same red inline tooltip pattern as Mapping default / formElement validation.
     *
     * @param {jQuery} $input
     * @returns {Object}
     */
    const ensureErrorTooltip = function ensureErrorTooltip($input) {
        if ($input.data('$tooltip')) {
            return $input.data('$tooltip');
        }

        const formElementTooltip = tooltip.error($input, ' ', {
            trigger: 'manual'
        });

        $input.siblings('.tooltip.tooltip-red').remove();
        $input.data('$tooltip', formElementTooltip);
        $input.attr('data-has-tooltip', true);

        return formElementTooltip;
    };

    /**
     * @param {jQuery} $input
     */
    const hideCorrectResponsesMaxError = function hideCorrectResponsesMaxError($input) {
        const tip = $input.data('$tooltip');
        const timer = $input.data('$scoringModelMaxTooltipTimer');

        if (timer) {
            clearTimeout(timer);
            $input.removeData('$scoringModelMaxTooltipTimer');
        }

        if (tip && _.isFunction(tip.hide)) {
            tip.hide();
        }
    };

    /**
     * @param {jQuery} $input
     * @param {string} message
     */
    const showThresholdError = function showThresholdError($input, message) {
        const tip = ensureErrorTooltip($input);
        const previousTimer = $input.data('$scoringModelMaxTooltipTimer');

        tip.updateTitleContent(message);
        tip.show();

        if (previousTimer) {
            clearTimeout(previousTimer);
        }

        $input.data(
            '$scoringModelMaxTooltipTimer',
            setTimeout(function () {
                hideCorrectResponsesMaxError($input);
            }, THRESHOLD_ERROR_TOOLTIP_MS)
        );
    };

    /**
     * @param {jQuery} $input
     * @param {number} max
     */
    const showCorrectResponsesMaxError = function showCorrectResponsesMaxError($input, max) {
        showThresholdError($input, getCorrectResponsesMaxExceededMessage(max));
    };

    /**
     * @param {jQuery} $input
     */
    const showCorrectResponsesDuplicateError = function showCorrectResponsesDuplicateError($input) {
        showThresholdError($input, getCorrectResponsesDuplicateMessage());
    };

    /**
     * @param {jQuery} $input
     * @returns {number[]}
     */
    const getSiblingThresholdValues = function getSiblingThresholdValues($input) {
        const values = [];
        const $panel = $input.closest('.scoring-model-panel');

        $panel.find('input.scoring-level-threshold').each(function () {
            if (this === $input[0]) {
                return;
            }

            const number = Number($(this).val());

            if (_.isFinite(number)) {
                values.push(number);
            }
        });

        return values;
    };

    /**
     * @param {number} preferred
     * @param {number} max
     * @param {number[]} used
     * @returns {number|null}
     */
    const findAvailableThreshold = function findAvailableThreshold(preferred, max, used) {
        const taken = {};

        _.forEach(used, value => {
            taken[value] = true;
        });

        if (!taken[preferred] && preferred >= 0 && preferred <= max) {
            return preferred;
        }

        let candidate;

        for (candidate = preferred - 1; candidate >= 0; candidate -= 1) {
            if (!taken[candidate]) {
                return candidate;
            }
        }

        for (candidate = preferred + 1; candidate <= max; candidate += 1) {
            if (!taken[candidate]) {
                return candidate;
            }
        }

        return null;
    };

    /**
     * Clamp Correct responses to max, keep polytomous thresholds unique, show inline errors.
     *
     * @param {jQuery} $input
     * @param {number} max
     * @returns {boolean} true when the value was corrected
     */
    const enforceCorrectResponsesMax = function enforceCorrectResponsesMax($input, max) {
        const rawValue = Number($input.val());
        let corrected = false;
        let value = rawValue;

        if (!_.isFinite(value)) {
            return false;
        }

        if (value > max) {
            value = max;
            $input.val(value);
            showCorrectResponsesMaxError($input, max);
            corrected = true;
        }

        if ($input.is('input.scoring-level-threshold')) {
            const siblings = getSiblingThresholdValues($input);

            if (_.includes(siblings, value)) {
                const previous = Number($input.data('scoringModelPreviousThreshold'));
                const fallback = findAvailableThreshold(
                    _.isFinite(previous) ? previous : value,
                    max,
                    siblings
                );

                if (fallback !== null) {
                    value = fallback;
                    $input.val(value);
                }

                showCorrectResponsesDuplicateError($input);
                corrected = true;
            }
        }

        if (!corrected && value < max) {
            hideCorrectResponsesMaxError($input);
        }

        if (_.isFinite(value)) {
            $input.data('scoringModelPreviousThreshold', value);
        }

        return corrected;
    };

    /**
     * @param {Object[]} levels
     * @param {number} maxCorrectResponses
     * @returns {Object[]}
     */
    const prepareLevelsForTpl = function prepareLevelsForTpl(levels, maxCorrectResponses) {
        return _.map(levels || [], (level, index) =>
            Object.assign({}, level, {
                index,
                maxCorrectResponses
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
        const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(interaction);
        const thresholds = scoringModelHelper.ensureThresholdsForModel(
            model,
            config.thresholds,
            maxCorrectResponses
        );
        const dichotomous = thresholds[0] || {
            threshold: scoringModelHelper.DEFAULT_DICHOTOMOUS_THRESHOLD,
            score: scoringModelHelper.DEFAULT_DICHOTOMOUS_SCORE
        };
        const scoringLevels =
            model === scoringModelHelper.MODEL_POLYTOMOUS
                ? thresholds
                : scoringModelHelper.getDefaultPolytomousLevels(maxCorrectResponses);

        return {
            showScoringModel,
            scoringModel: model,
            isSimpleSum: model === scoringModelHelper.MODEL_SIMPLE_SUM,
            isDichotomous: model === scoringModelHelper.MODEL_DICHOTOMOUS,
            isPolytomous: model === scoringModelHelper.MODEL_POLYTOMOUS,
            maxCorrectResponses,
            dichotomousThreshold: dichotomous.threshold,
            dichotomousScore: dichotomous.score,
            scoringLevels: prepareLevelsForTpl(scoringLevels, maxCorrectResponses)
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
            const thresholdRaw = String($level.find('input.scoring-level-threshold').val() || '').trim();
            const scoreRaw = String($level.find('input.scoring-level-score').val() || '').trim();

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
        const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
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
            thresholds: scoringModelHelper.ensureThresholdsForModel(
                model,
                thresholds,
                maxCorrectResponses
            )
        };

        setWidgetConfig(widget, config);

        return config;
    };

    /**
     * Keep spinner max / validator max in sync with the field count.
     * Over-max typed values are clamped back to max with an inline error popup.
     *
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const applyCorrectResponsesMax = function applyCorrectResponsesMax($responseForm, widget) {
        const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
        const message = getCorrectResponsesMaxExceededMessage(maxCorrectResponses);
        const validateAttr = buildThresholdValidateAttr(maxCorrectResponses);
        const $thresholdInputs = $responseForm.find(THRESHOLD_INPUT_SELECTOR);

        // Header labels reuse .scoring-level-threshold — never treat them as validated inputs.
        $responseForm.find('.scoring-model-levels-header .scoring-level-threshold').each(function () {
            const $header = $(this);
            const tip = $header.data('$tooltip');

            if (tip && _.isFunction(tip.dispose)) {
                tip.dispose();
            }

            $header
                .removeAttr('data-validate')
                .removeAttr('data-max')
                .removeAttr('data-has-tooltip')
                .removeData('$tooltip');
            $header.siblings('.tooltip.tooltip-red').remove();
        });

        $thresholdInputs.each(function () {
            const $input = $(this);
            const incrementerOptions = $input.data(INCREMENTER_DATA_NS);
            const validatorInstance = $input.data('validator-instance');

            $input.attr('data-validate', validateAttr);
            $input.attr('data-max', maxCorrectResponses);

            if (incrementerOptions && _.isObject(incrementerOptions)) {
                incrementerOptions.max = maxCorrectResponses;
            }

            if (validatorInstance && _.isArray(validatorInstance.rules)) {
                const rule = _.find(
                    validatorInstance.rules,
                    candidate => candidate && candidate.name === 'correctResponsesMax'
                );

                if (rule) {
                    rule.options = rule.options || {};
                    rule.options.max = String(maxCorrectResponses);
                    rule.options.message = message;
                }
            }

            enforceCorrectResponsesMax($input, maxCorrectResponses);
        });
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const renderPolytomousLevels = function renderPolytomousLevels($responseForm, widget) {
        const config = getWidgetConfig(widget);
        const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
        const levels = scoringModelHelper.ensureThresholdsForModel(
            scoringModelHelper.MODEL_POLYTOMOUS,
            config.thresholds,
            maxCorrectResponses
        );
        const $list = $responseForm.find('.scoring-model-level-list');

        $list.empty();

        _.forEach(prepareLevelsForTpl(levels, maxCorrectResponses), level => {
            $list.append(scoringModelLevelTpl(level));
        });

        formElement.initWidget($list);
        applyCorrectResponsesMax($responseForm, widget);
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

        if (show) {
            applyCorrectResponsesMax($responseForm, widget);
        }
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
        unbindThresholdMaxGuards($responseForm);

        updateVisibility($responseForm, widget);

        $responseForm.on(`change${NS}`, 'input[name="evaluateAsUmfi"]', function () {
            updateVisibility($responseForm, widget, {
                evaluateAsUmfi: $(this).prop('checked')
            });
        });

        $responseForm.on(`change${NS}`, 'input[name="scoringModel"]', function () {
            const model = $(this).val();
            const previous = getWidgetConfig(widget);
            const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
            const config = {
                model,
                thresholds: scoringModelHelper.ensureThresholdsForModel(
                    model,
                    previous.thresholds,
                    maxCorrectResponses
                )
            };

            setWidgetConfig(widget, config);
            toggleModelDetails($responseForm, model);

            if (model === scoringModelHelper.MODEL_DICHOTOMOUS) {
                const level = config.thresholds[0];

                $responseForm.find('input[name="dichotomousThreshold"]').val(level.threshold);
                $responseForm.find('input[name="dichotomousScore"]').val(level.score);
                applyCorrectResponsesMax($responseForm, widget);
            }

            if (model === scoringModelHelper.MODEL_POLYTOMOUS) {
                renderPolytomousLevels($responseForm, widget);
            }
        });

        $responseForm.on(
            `focus${NS}`,
            'input.scoring-level-threshold',
            function () {
                const value = Number($(this).val());

                if (_.isFinite(value)) {
                    $(this).data('scoringModelPreviousThreshold', value);
                }
            }
        );

        $responseForm.on(
            `change${NS} keyup${NS}`,
            'input[name="dichotomousThreshold"], input[name="dichotomousScore"]',
            function () {
                const $input = $(this);

                if ($input.is(THRESHOLD_INPUT_SELECTOR)) {
                    enforceCorrectResponsesMax(
                        $input,
                        scoringModelHelper.getMaxCorrectResponses(widget.element)
                    );
                }

                syncConfigFromForm($responseForm, widget);
            }
        );

        $responseForm.on(
            `change${NS} keyup${NS}`,
            '.scoring-level-threshold, .scoring-level-score',
            function () {
                const $input = $(this);

                if (!$input.is('input')) {
                    return;
                }

                if ($input.is(THRESHOLD_INPUT_SELECTOR)) {
                    enforceCorrectResponsesMax(
                        $input,
                        scoringModelHelper.getMaxCorrectResponses(widget.element)
                    );
                }

                syncConfigFromForm($responseForm, widget);
            }
        );

        // Spinner "+" blocked at max or when next value is already used by another level.
        const onIncClickCapture = function onIncClickCapture(e) {
            const $inc = $(e.target).closest('.inc');

            if (!$inc.length || !$.contains($responseForm[0], $inc[0])) {
                return;
            }

            const $input = $inc.closest('.incrementer-ctrl').prev('input');

            if (!$input.length || !$input.is(THRESHOLD_INPUT_SELECTOR)) {
                return;
            }

            const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
            const current = Number($input.val());

            if (!_.isFinite(current)) {
                return;
            }

            if (current >= maxCorrectResponses) {
                e.preventDefault();
                e.stopPropagation();
                showCorrectResponsesMaxError($input, maxCorrectResponses);
                return;
            }

            if (
                $input.is('input.scoring-level-threshold') &&
                _.includes(getSiblingThresholdValues($input), current + 1)
            ) {
                e.preventDefault();
                e.stopPropagation();
                showCorrectResponsesDuplicateError($input);
            }
        };

        $responseForm.data('scoringModelIncClickCapture', onIncClickCapture);
        $responseForm[0].addEventListener('click', onIncClickCapture, true);

        // ArrowUp at max / duplicate: capture before incrementer applies.
        const onThresholdKeydownCapture = function onThresholdKeydownCapture(e) {
            if (e.which !== 38 && e.key !== 'ArrowUp') {
                return;
            }

            const $input = $(e.target);

            if (!$input.is(THRESHOLD_INPUT_SELECTOR)) {
                return;
            }

            const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
            const current = Number($input.val());

            if (!_.isFinite(current)) {
                return;
            }

            if (current >= maxCorrectResponses) {
                e.preventDefault();
                e.stopPropagation();
                showCorrectResponsesMaxError($input, maxCorrectResponses);
                return;
            }

            if (
                $input.is('input.scoring-level-threshold') &&
                _.includes(getSiblingThresholdValues($input), current + 1)
            ) {
                e.preventDefault();
                e.stopPropagation();
                showCorrectResponsesDuplicateError($input);
            }
        };

        $responseForm.data('scoringModelThresholdKeydownCapture', onThresholdKeydownCapture);
        $responseForm[0].addEventListener('keydown', onThresholdKeydownCapture, true);

        $responseForm.on(`click${NS}`, '[data-action="add-scoring-level"]', function (e) {
            e.preventDefault();

            const config = syncConfigFromForm($responseForm, widget);
            const maxCorrectResponses = scoringModelHelper.getMaxCorrectResponses(widget.element);
            const thresholds = scoringModelHelper.ensureThresholdsForModel(
                scoringModelHelper.MODEL_POLYTOMOUS,
                config.thresholds,
                maxCorrectResponses
            );
            const used = _.map(thresholds, 'threshold');
            const lowest = thresholds.length ? thresholds[thresholds.length - 1].threshold : 1;
            const nextThreshold = findAvailableThreshold(
                Math.max(0, lowest - 1),
                maxCorrectResponses,
                used
            );

            if (nextThreshold === null) {
                const $lastThreshold = $responseForm.find('input.scoring-level-threshold').last();

                if ($lastThreshold.length) {
                    showCorrectResponsesDuplicateError($lastThreshold);
                }

                return;
            }

            thresholds.push({
                threshold: nextThreshold,
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
            const $levels = $responseForm.find('.scoring-model-level');

            // Identify by the clicked DOM row, not data-level-index: syncConfigFromForm
            // re-sorts thresholds while the form is not re-rendered on edits, so DOM order
            // can diverge from the sorted config and an index filter would remove the wrong level.
            if ($levels.length <= 2) {
                return;
            }

            $level.remove();
            syncConfigFromForm($responseForm, widget);
            renderPolytomousLevels($responseForm, widget);
        });
    };

    /**
     * @param {jQuery} $responseForm
     */
    const unbindThresholdMaxGuards = function unbindThresholdMaxGuards($responseForm) {
        if (!$responseForm || !$responseForm.length || !$responseForm[0]) {
            return;
        }

        const onThresholdKeydownCapture = $responseForm.data('scoringModelThresholdKeydownCapture');
        const onIncClickCapture = $responseForm.data('scoringModelIncClickCapture');

        if (onThresholdKeydownCapture) {
            $responseForm[0].removeEventListener('keydown', onThresholdKeydownCapture, true);
            $responseForm.removeData('scoringModelThresholdKeydownCapture');
        }

        if (onIncClickCapture) {
            $responseForm[0].removeEventListener('click', onIncClickCapture, true);
            $responseForm.removeData('scoringModelIncClickCapture');
        }
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
            unbindThresholdMaxGuards($responseForm);
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
        readPolytomousLevelsFromForm,
        getCorrectResponsesMaxExceededMessage,
        getCorrectResponsesDuplicateMessage,
        buildThresholdValidateAttr,
        enforceCorrectResponsesMax,
        findAvailableThreshold
    };
});
