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
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/lexicalFieldGroup'
], function ($, _, evaluationHelper, formElement, lexicalFieldGroupTpl) {
    'use strict';

    const NS = '.textEntryEvaluation';
    const DOC_NS = '.textEntryEvaluationDoc';

    /**
     * Action links inside a lexical field group can steal focus from the draft
     * variant input. Blur fires before click and rebuilds the DOM, so the click
     * never reaches the original link. Suppress blur-commit while such a click is
     * in progress.
     */
    let suppressVariantBlurCommit = false;

    /**
     * @param {jQuery} $responseForm
     */
    const bindVariantBlurGuard = function bindVariantBlurGuard($responseForm) {
        $(document)
            .off(`mouseup${DOC_NS}`)
            .on(`mouseup${DOC_NS}`, () => {
                suppressVariantBlurCommit = false;
            });

        $responseForm
            .off(`mousedown${DOC_NS}`)
            .on(
                `mousedown${DOC_NS}`,
                '[data-action="add-variant"], [data-action="add-lexical-field"], [data-action="remove-variant"], [data-action="remove-lexical-field"]',
                function (e) {
                    e.preventDefault();
                    suppressVariantBlurCommit = true;
                }
            );
    };

    /**
     * @param {Object} widget
     * @returns {Object}
     */
    const getConfig = function getConfig(widget) {
        if (!widget._textEntryEvaluationConfig) {
            widget._textEntryEvaluationConfig = evaluationHelper.getEvaluationConfig(widget.element);
        }

        return widget._textEntryEvaluationConfig;
    };

    /**
     * @param {Object} widget
     * @param {Object} config
     */
    const setConfig = function setConfig(widget, config) {
        widget._textEntryEvaluationConfig = config;
        evaluationHelper.persistEvaluationConfig(widget.element, config);
    };

    /**
     * @param {Object[]} groups
     * @returns {Object[]}
     */
    const prepareGroupsForTpl = function prepareGroupsForTpl(groups, widget) {
        const textEntrySerial =
            widget && widget.element ? evaluationHelper.getTextEntrySerial(widget.element) : null;

        return _.map(evaluationHelper.normalizeLexicalGroups(groups), (group, index) =>
            Object.assign({}, group, {
                index,
                draftVariant: !!group.draftVariant,
                textEntrySerial: textEntrySerial || ''
            })
        );
    };

    /**
     * @param {Object} interaction
     * @returns {Object}
     */
    const getTplData = function getTplData(interaction) {
        const config = evaluationHelper.getEvaluationConfig(interaction);

        return {
            evaluateAsUmfi: config.evaluateAsUmfi,
            allowLexicalFieldsOnScoring: config.allowLexicalFieldsOnScoring,
            lexicalGroups: prepareGroupsForTpl(config.lexicalGroups, interaction)
        };
    };

    /**
     * @param {jQuery} $responseForm
     * @param {boolean} expanded
     */
    const toggleDetails = function toggleDetails($responseForm, expanded) {
        $responseForm.find('.text-entry-evaluation-expanded').toggleClass('hidden', !expanded);
    };

    /**
     * @param {jQuery} $group
     * @returns {string[]}
     */
    const readVariantsFromGroup = function readVariantsFromGroup($group) {
        const synonyms = [];

        $group.find('.lexical-field-variant-chip .variant-text').each(function () {
            const value = String($(this).text()).trim();
            if (value) {
                synonyms.push(value);
            }
        });

        $group.find('.lexical-field-variant-input').each(function () {
            const value = String($(this).val()).trim();
            if (value) {
                synonyms.push(value);
            }
        });

        return synonyms;
    };

    /**
     * @param {jQuery} $form
     * @returns {Object[]}
     */
    const readLexicalGroupsFromForm = function readLexicalGroupsFromForm($form) {
        const groups = [];

        $form.find('.lexical-field-group').each(function () {
            const $group = $(this);

            groups.push({
                identifier: String($group.find('.lexical-field-identifier').val() || '').trim(),
                synonyms: readVariantsFromGroup($group),
                draftVariant: $group.find('.lexical-field-variant-input').length > 0
            });
        });

        return groups;
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const syncConfigFromForm = function syncConfigFromForm($responseForm, widget) {
        const config = getConfig(widget);
        const $evaluateAsUmfi = $responseForm.find('input[name="evaluateAsUmfi"]');

        if ($evaluateAsUmfi.length) {
            config.evaluateAsUmfi = $evaluateAsUmfi.prop('checked');
        }

        config.allowLexicalFieldsOnScoring = $responseForm
            .find('input[name="allowLexicalFieldsOnScoring"]')
            .prop('checked');
        config.lexicalGroups = readLexicalGroupsFromForm($responseForm);

        setConfig(widget, config);
    };

    /**
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
        const textEntries = evaluationHelper.getItemTextEntries(sampleInteraction);

        _.forEach(textEntries, textEntry => {
            const widget = textEntry.data && textEntry.data('widget');

            if (!widget || !widget.$responseForm || !widget.$responseForm.find('.text-entry-evaluation-panel').length) {
                return;
            }

            delete widget._textEntryEvaluationConfig;
            syncConfigFromForm(widget.$responseForm, widget);
        });
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {Object} [options]
     */
    const renderLexicalFieldGroups = function renderLexicalFieldGroups($responseForm, widget, options) {
        const config = getConfig(widget);
        const $groups = $responseForm.find('.lexical-field-groups');
        const focusGroupIndex = options && options.focusGroupIndex;

        $groups.empty();

        _.forEach(prepareGroupsForTpl(config.lexicalGroups, widget), group => {
            $groups.append(lexicalFieldGroupTpl(group));
        });

        formElement.initWidget($responseForm.find('.lexical-field-groups'));

        if (_.isNumber(focusGroupIndex)) {
            const $input = $groups
                .find(`.lexical-field-group[data-group-index="${focusGroupIndex}"] .lexical-field-variant-input`)
                .first();

            if ($input.length) {
                $input.trigger('focus');
            }
        }
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {Object} [options]
     */
    const refreshLexicalFields = function refreshLexicalFields($responseForm, widget, options) {
        renderLexicalFieldGroups($responseForm, widget, options);
        bindEvents($responseForm, widget, { skipInitialRender: true });
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {{skipInitialRender?: boolean}} [options]
     */
    const bindEvents = function bindEvents($responseForm, widget, options) {
        const interaction = widget.element;
        const skipInitialRender = !!(options && options.skipInitialRender);

        $responseForm.off(NS);
        bindVariantBlurGuard($responseForm);

        $responseForm.on(`change${NS}`, 'input[name="evaluateAsUmfi"]', function () {
            const enabled = $(this).prop('checked');
            const config = getConfig(widget);

            config.evaluateAsUmfi = enabled;

            if (!enabled) {
                config.allowLexicalFieldsOnScoring = false;
                config.lexicalGroups = [];
                $responseForm.find('input[name="allowLexicalFieldsOnScoring"]').prop('checked', false);
            }

            setConfig(widget, config);
            toggleDetails($responseForm, enabled);
            refreshLexicalFields($responseForm, widget);
        });

        $responseForm.on(`change${NS}`, 'input[name="allowLexicalFieldsOnScoring"]', function () {
            syncConfigFromForm($responseForm, widget);
        });

        $responseForm.on(
            `input${NS}`,
            '.lexical-field-identifier',
            _.debounce(function () {
                syncConfigFromForm($responseForm, widget);
            }, 300)
        );

        $responseForm.on(`click${NS}`, '[data-action="add-lexical-field"]', function (e) {
            e.preventDefault();
            syncConfigFromForm($responseForm, widget);
            const config = getConfig(widget);

            config.lexicalGroups.push({
                identifier: '',
                synonyms: [],
                draftVariant: true
            });
            setConfig(widget, config);
            refreshLexicalFields($responseForm, widget, {
                focusGroupIndex: config.lexicalGroups.length - 1
            });
        });

        $responseForm.on(`click${NS}`, '[data-action="remove-lexical-field"]', function (e) {
            e.preventDefault();
            syncConfigFromForm($responseForm, widget);
            const index = parseInt($(this).closest('.lexical-field-group').data('group-index'), 10);
            const config = getConfig(widget);

            config.lexicalGroups.splice(index, 1);
            setConfig(widget, config);
            refreshLexicalFields($responseForm, widget);
        });

        $responseForm.on(`click${NS}`, '[data-action="add-variant"]', function (e) {
            e.preventDefault();
            syncConfigFromForm($responseForm, widget);
            const $group = $(this).closest('.lexical-field-group');
            const index = parseInt($group.data('group-index'), 10);
            const config = getConfig(widget);

            if (!config.lexicalGroups[index]) {
                return;
            }

            const $existingDraftInput = $group.find('.lexical-field-variant-input').first();

            if (config.lexicalGroups[index].draftVariant && $existingDraftInput.length) {
                $existingDraftInput.trigger('focus');
                return;
            }

            config.lexicalGroups[index].draftVariant = true;
            setConfig(widget, config);
            refreshLexicalFields($responseForm, widget, {
                focusGroupIndex: index
            });
        });

        $responseForm.on(`click${NS}`, '[data-action="remove-variant"]', function (e) {
            e.preventDefault();
            syncConfigFromForm($responseForm, widget);
            const $chip = $(this).closest('.lexical-field-variant-chip');
            const $group = $(this).closest('.lexical-field-group');
            const groupIndex = parseInt($group.data('group-index'), 10);
            const variantIndex = parseInt($chip.data('variant-index'), 10);
            const config = getConfig(widget);

            if (config.lexicalGroups[groupIndex] && config.lexicalGroups[groupIndex].synonyms[variantIndex]) {
                config.lexicalGroups[groupIndex].synonyms.splice(variantIndex, 1);
                config.lexicalGroups[groupIndex].draftVariant = false;
                setConfig(widget, config);
                refreshLexicalFields($responseForm, widget);
            }
        });

        const commitVariantInput = function commitVariantInput($input) {
            const $group = $input.closest('.lexical-field-group');
            const groupIndex = parseInt($group.data('group-index'), 10);
            const config = getConfig(widget);
            const value = String($input.val()).trim();

            if (!config.lexicalGroups[groupIndex]) {
                return;
            }

            config.lexicalGroups[groupIndex].identifier = String(
                $group.find('.lexical-field-identifier').val() || ''
            ).trim();
            config.lexicalGroups[groupIndex].synonyms = readVariantsFromGroup($group);
            config.lexicalGroups[groupIndex].draftVariant = !value;
            setConfig(widget, config);

            if (value) {
                refreshLexicalFields($responseForm, widget);
            }
        };

        $responseForm.on(`keydown${NS}`, '.lexical-field-variant-input', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                commitVariantInput($(this));
            }
        });

        $responseForm.on(`blur${NS}`, '.lexical-field-variant-input', function () {
            if (suppressVariantBlurCommit) {
                return;
            }

            commitVariantInput($(this));
        });

        if (!skipInitialRender && evaluationHelper.isUmfiEnabled(interaction)) {
            renderLexicalFieldGroups($responseForm, widget);
        }
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} [widget]
     */
    const unbindEvents = function unbindEvents($responseForm, widget) {
        $responseForm.off(NS);
        $responseForm.off(DOC_NS);
        $(document).off(`mouseup${DOC_NS}`);
        suppressVariantBlurCommit = false;

        if (widget) {
            delete widget._textEntryEvaluationConfig;
        }
    };

    return {
        getTplData,
        bindEvents,
        unbindEvents,
        syncConfigFromForm,
        flushOpenForms,
        readVariantsFromGroup,
        readLexicalGroupsFromForm
    };
});
