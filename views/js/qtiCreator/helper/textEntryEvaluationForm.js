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
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/lexicalFieldGroup'
], function ($, _, __, tooltip, evaluationHelper, formElement, lexicalFieldGroupTpl) {
    'use strict';

    const NS = '.textEntryEvaluation';
    const DOC_NS = '.textEntryEvaluationDoc';
    const DUPLICATE_VARIANT_MESSAGE = __('This variant already exists');

    /**
     * Draft variant inputs commit on blur. Action controls must run on mousedown
     * (before blur) and suppress that commit, otherwise the rebuild removes the
     * control before click can fire. Do not preventDefault on the guard alone —
     * that can cancel the subsequent click on <a> elements.
     */
    let suppressVariantBlurCommit = false;

    /**
     * After a pointer mousedown action, ignore the following click (including on a
     * rebuilt control under the cursor) so actions do not double-fire.
     * Cleared when that click is consumed, or as a short fallback if click never comes.
     */
    let suppressNextActionClick = false;
    let suppressNextActionClickTimer = null;

    /**
     * @param {jQuery} $input
     * @returns {Object}
     */
    const getVariantInputTooltip = function getVariantInputTooltip($input) {
        let variantTooltip = $input.data('$tooltip');

        if (!variantTooltip) {
            $input.siblings('.tooltip.tooltip-red').remove();
            variantTooltip = tooltip.error($input, ' ', {
                trigger: 'manual'
            });
            $input.data('$tooltip', variantTooltip);
            $input.attr('data-has-tooltip', true);
        }

        return variantTooltip;
    };

    /**
     * @param {jQuery} $input
     * @param {string} message
     */
    const showVariantInputError = function showVariantInputError($input, message) {
        const variantTooltip = getVariantInputTooltip($input);

        $input.addClass('error');
        variantTooltip.updateTitleContent(message);
        variantTooltip.show();
    };

    /**
     * @param {jQuery} $input
     */
    const clearVariantInputError = function clearVariantInputError($input) {
        const variantTooltip = $input.data('$tooltip');

        $input.removeClass('error');

        if (variantTooltip) {
            variantTooltip.hide();
        }
    };

    /**
     * @param {jQuery} $input
     */
    const disposeVariantInputTooltip = function disposeVariantInputTooltip($input) {
        const variantTooltip = $input.data('$tooltip');

        if (variantTooltip) {
            variantTooltip.dispose();
            $input.removeData('$tooltip');
            $input.removeAttr('data-has-tooltip');
        }

        $input.removeClass('error');
        $input.siblings('.tooltip.tooltip-red').remove();
    };

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
                function () {
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
     * Variants shown in the UI chips (canonical is edited separately and kept in JSON/RP).
     *
     * @param {string} canonical
     * @param {string[]} synonyms
     * @param {boolean} [caseSensitive=false]
     * @returns {string[]}
     */
    const getAdditionalVariants = function getAdditionalVariants(canonical, synonyms, caseSensitive) {
        const normalizedCanonical = String(canonical || '').trim();

        if (!normalizedCanonical) {
            return _.filter(synonyms || [], Boolean);
        }

        return _.filter(
            synonyms || [],
            value =>
                value &&
                !evaluationHelper.hasLexicalVariant([normalizedCanonical], value, !!caseSensitive)
        );
    };

    /**
     * @param {Object[]} groups
     * @param {Object} [widget]
     * @returns {Object[]}
     */
    const prepareGroupsForTpl = function prepareGroupsForTpl(groups, widget) {
        const textEntrySerial =
            widget && widget.element ? evaluationHelper.getTextEntrySerial(widget.element) : null;
        const caseSensitive =
            widget && widget._textEntryEvaluationConfig
                ? !!widget._textEntryEvaluationConfig.caseSensitive
                : widget && widget.element
                  ? evaluationHelper.isCaseSensitive(widget.element)
                  : false;

        return _.map(evaluationHelper.normalizeLexicalGroups(groups), (group, index) => {
            const additionalVariants = getAdditionalVariants(
                group.canonical,
                group.synonyms,
                caseSensitive
            );
            const draftVariant = !!group.draftVariant;

            return Object.assign({}, group, {
                index,
                draftVariant,
                textEntrySerial: textEntrySerial || '',
                additionalVariants,
                showVariantChips: draftVariant || additionalVariants.length > 0
            });
        });
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
    const readChipVariantsFromGroup = function readChipVariantsFromGroup($group) {
        const synonyms = [];

        $group.find('.lexical-field-variant-chip .variant-text').each(function () {
            const value = String($(this).text()).trim();
            if (value) {
                synonyms.push(value);
            }
        });

        return synonyms;
    };

    /**
     * @param {jQuery} $group
     * @param {{caseSensitive?: boolean}} [options]
     * @returns {string[]}
     */
    const readVariantsFromGroup = function readVariantsFromGroup($group, options) {
        const caseSensitive = !!(options && options.caseSensitive);
        const synonyms = readChipVariantsFromGroup($group);

        $group.find('.lexical-field-variant-input').each(function () {
            const value = String($(this).val()).trim();
            if (value && !evaluationHelper.hasLexicalVariant(synonyms, value, caseSensitive)) {
                synonyms.push(value);
            }
        });

        return synonyms;
    };

    /**
     * Build synonyms with the canonical value as the first entry.
     * Chips list only additional variants (canonical is not shown in the UI list).
     *
     * @param {jQuery} $group
     * @param {string} canonical
     * @param {{caseSensitive?: boolean}} [options]
     * @returns {string[]}
     */
    const buildSynonymsFromGroup = function buildSynonymsFromGroup($group, canonical, options) {
        const caseSensitive = !!(options && options.caseSensitive);
        const additional = readChipVariantsFromGroup($group).slice();

        $group.find('.lexical-field-variant-input').each(function () {
            const value = String($(this).val()).trim();

            if (
                value &&
                !evaluationHelper.hasLexicalVariant(additional, value, caseSensitive) &&
                !(canonical && evaluationHelper.hasLexicalVariant([canonical], value, caseSensitive))
            ) {
                additional.push(value);
            }
        });

        const filteredAdditional = additional.filter(value => {
            if (!canonical) {
                return true;
            }

            return !evaluationHelper.hasLexicalVariant([canonical], value, caseSensitive);
        });

        if (!canonical) {
            return filteredAdditional;
        }

        return [canonical].concat(filteredAdditional);
    };

    /**
     * @param {string} canonical
     * @param {string[]} chipVariants Additional variant chips only (canonical not included)
     * @param {{caseSensitive?: boolean}} [options]
     * @returns {string[]}
     */
    const mergeCanonicalIntoSynonyms = function mergeCanonicalIntoSynonyms(canonical, chipVariants, options) {
        const caseSensitive = !!(options && options.caseSensitive);
        const chips = _.isArray(chipVariants) ? chipVariants.slice() : [];
        const additional = chips.filter(value => {
            if (!canonical) {
                return true;
            }

            return !evaluationHelper.hasLexicalVariant([canonical], value, caseSensitive);
        });

        if (!canonical) {
            return additional;
        }

        return [canonical].concat(additional);
    };

    /**
     * @param {jQuery} $form
     * @param {{caseSensitive?: boolean, existingGroups?: Object[]}} [options]
     * @returns {Object[]}
     */
    const readLexicalGroupsFromForm = function readLexicalGroupsFromForm($form, options) {
        const groups = [];
        const existingGroups = (options && options.existingGroups) || [];
        const caseSensitive = !!(options && options.caseSensitive);

        $form.find('.lexical-field-group').each(function (index) {
            const $group = $(this);
            const existing = existingGroups[index] || {};
            const identifier = String(
                $group.attr('data-group-identifier') || existing.identifier || ''
            ).trim();
            const canonical = String($group.find('.lexical-field-canonical').val() || '').trim();
            const synonyms = buildSynonymsFromGroup($group, canonical, { caseSensitive });

            groups.push({
                identifier,
                canonical,
                synonyms,
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
        config.lexicalGroups = readLexicalGroupsFromForm($responseForm, {
            caseSensitive: config.caseSensitive,
            existingGroups: config.lexicalGroups
        });

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
        const focusCanonical = !!(options && options.focusCanonical);

        $groups.empty();

        _.forEach(prepareGroupsForTpl(config.lexicalGroups, widget), group => {
            $groups.append(lexicalFieldGroupTpl(group));
        });

        formElement.initWidget($responseForm.find('.lexical-field-groups'));

        if (_.isNumber(focusGroupIndex)) {
            const $group = $groups.find(`.lexical-field-group[data-group-index="${focusGroupIndex}"]`);
            const $input = focusCanonical
                ? $group.find('.lexical-field-canonical').first()
                : $group.find('.lexical-field-variant-input').first();

            if ($input.length) {
                // Defer focus so it does not cancel/alter the click that added the group.
                setTimeout(function () {
                    $input.trigger('focus');
                }, 0);
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
     * Clear the post-mousedown click suppression flag.
     */
    const clearSuppressNextActionClick = function clearSuppressNextActionClick() {
        suppressNextActionClick = false;

        if (suppressNextActionClickTimer) {
            clearTimeout(suppressNextActionClickTimer);
            suppressNextActionClickTimer = null;
        }
    };

    /**
     * Run lexical-field actions from mousedown (pointer, before blur) or click
     * (keyboard). Skip the click that follows a handled mousedown so pointer
     * actions do not double-fire. Do not clear suppression with setTimeout(0):
     * that can run before click when refresh/rebind yields to the browser.
     *
     * @param {Function} action
     * @returns {Function}
     */
    const bindPointerOrKeyboardAction = function bindPointerOrKeyboardAction(action) {
        return function (e) {
            if (e.type === 'mousedown') {
                // Primary button only; ignore right/middle click.
                if (typeof e.which === 'number' && e.which !== 0 && e.which !== 1) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                suppressVariantBlurCommit = true;
                clearSuppressNextActionClick();
                suppressNextActionClick = true;
                // Fallback if the browser never delivers click (drag-off, etc.).
                suppressNextActionClickTimer = setTimeout(clearSuppressNextActionClick, 500);
                action.call(this, e);
                return;
            }

            e.preventDefault();

            if (suppressNextActionClick) {
                clearSuppressNextActionClick();
                return;
            }

            action.call(this, e);
        };
    };

    /**
     * Rebuild lexical-field DOM after the current event stack (e.g. blur) finishes.
     * Synchronous DOM removal during blur breaks jQuery focus handling.
     *
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {Object} [options]
     */
    const scheduleLexicalFieldsRefresh = function scheduleLexicalFieldsRefresh($responseForm, widget, options) {
        if (!widget) {
            return;
        }

        if (widget._lexicalFieldsRefreshTimer) {
            clearTimeout(widget._lexicalFieldsRefreshTimer);
        }

        widget._lexicalFieldsRefreshTimer = setTimeout(function () {
            widget._lexicalFieldsRefreshTimer = null;
            refreshLexicalFields($responseForm, widget, options);
        }, 0);
    };

    /**
     * @param {Object} [widget]
     */
    const cancelScheduledLexicalFieldsRefresh = function cancelScheduledLexicalFieldsRefresh(widget) {
        if (widget && widget._lexicalFieldsRefreshTimer) {
            clearTimeout(widget._lexicalFieldsRefreshTimer);
            delete widget._lexicalFieldsRefreshTimer;
        }
    };

    /**
     * @param {Object} [widget]
     */
    const cancelDebouncedSync = function cancelDebouncedSync(widget) {
        if (widget && widget._textEntryEvaluationDebouncedSync) {
            widget._textEntryEvaluationDebouncedSync.cancel();
            delete widget._textEntryEvaluationDebouncedSync;
        }
    };

    /**
     * Commit the canonical input into config.
     * Refresh is optional: canonical is not rendered as a variant chip, so a rebuild
     * is only needed when the visible additional-variants list changes.
     *
     * @param {jQuery} $input
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {{deferRefresh?: boolean}} [options]
     */
    const commitCanonicalInput = function commitCanonicalInput($input, $responseForm, widget, options) {
        const $group = $input.closest('.lexical-field-group');
        const groupIndex = parseInt($group.data('group-index'), 10);
        const config = getConfig(widget);

        if (_.isNaN(groupIndex) || !config.lexicalGroups[groupIndex]) {
            return;
        }

        const previousGroup = config.lexicalGroups[groupIndex];
        const previousAdditional = getAdditionalVariants(
            previousGroup.canonical,
            previousGroup.synonyms,
            config.caseSensitive
        );
        const canonical = String($input.val() || '').trim();
        const synonyms = buildSynonymsFromGroup($group, canonical, {
            caseSensitive: config.caseSensitive
        });
        const identifier =
            String($group.attr('data-group-identifier') || previousGroup.identifier || '').trim() ||
            evaluationHelper.buildNextLexicalGroupIdentifier(config.lexicalGroups);
        const draftVariant = $group.find('.lexical-field-variant-input').length > 0;
        const nextAdditional = getAdditionalVariants(canonical, synonyms, config.caseSensitive);
        const needsRefresh =
            draftVariant !== !!previousGroup.draftVariant || !_.isEqual(previousAdditional, nextAdditional);

        config.lexicalGroups[groupIndex].identifier = identifier;
        config.lexicalGroups[groupIndex].canonical = canonical;
        config.lexicalGroups[groupIndex].synonyms = synonyms;
        config.lexicalGroups[groupIndex].draftVariant = draftVariant;

        setConfig(widget, config);

        if (!needsRefresh) {
            return;
        }

        if (options && options.deferRefresh) {
            scheduleLexicalFieldsRefresh($responseForm, widget);
            return;
        }

        refreshLexicalFields($responseForm, widget);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     * @param {{skipInitialRender?: boolean}} [options]
     */
    const bindEvents = function bindEvents($responseForm, widget, options) {
        const interaction = widget.element;
        const skipInitialRender = !!(options && options.skipInitialRender);
        const debouncedSyncCanonical = _.debounce(function () {
            syncConfigFromForm($responseForm, widget);
        }, 300);

        cancelDebouncedSync(widget);
        widget._textEntryEvaluationDebouncedSync = debouncedSyncCanonical;

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

        $responseForm.on(`input${NS}`, '.lexical-field-canonical', debouncedSyncCanonical);

        $responseForm.on(`keydown${NS}`, '.lexical-field-canonical', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                commitCanonicalInput($(this), $responseForm, widget);
            }
        });

        $responseForm.on(`blur${NS}`, '.lexical-field-canonical', function (e) {
            if (suppressVariantBlurCommit) {
                return;
            }

            const related = e.relatedTarget || document.activeElement;
            if (
                related &&
                $(related).closest(
                    '[data-action="add-lexical-field"], [data-action="add-variant"], [data-action="remove-variant"], [data-action="remove-lexical-field"]'
                ).length
            ) {
                return;
            }

            commitCanonicalInput($(this), $responseForm, widget, { deferRefresh: true });
        });

        $responseForm.on(`mousedown${NS}`, '[data-action="add-lexical-field"]', function () {
            // Only guard blur commits; the add button is outside the rebuilt
            // groups container, so the action itself must run on click only.
            // Running add on both mousedown and click doubles groups once a
            // canonical field is focused (first add often cancels click via focus()).
            suppressVariantBlurCommit = true;
        });

        $responseForm.on(`click${NS}`, '[data-action="add-lexical-field"]', function (e) {
            e.preventDefault();

            if (widget._addingLexicalField) {
                return;
            }

            widget._addingLexicalField = true;

            try {
                syncConfigFromForm($responseForm, widget);
                const config = getConfig(widget);
                const identifier = evaluationHelper.buildNextLexicalGroupIdentifier(
                    config.lexicalGroups
                );

                // Newest lexical group appears at the top of the list.
                config.lexicalGroups.unshift({
                    identifier,
                    canonical: '',
                    synonyms: [],
                    draftVariant: false
                });
                setConfig(widget, config);
                refreshLexicalFields($responseForm, widget, {
                    focusGroupIndex: 0,
                    focusCanonical: true
                });
            } finally {
                setTimeout(function () {
                    widget._addingLexicalField = false;
                }, 0);
            }
        });

        $responseForm.on(
            `mousedown${NS} click${NS}`,
            '[data-action="remove-lexical-field"]',
            bindPointerOrKeyboardAction(function () {
                syncConfigFromForm($responseForm, widget);
                const index = parseInt($(this).closest('.lexical-field-group').data('group-index'), 10);
                const config = getConfig(widget);

                if (_.isNaN(index)) {
                    return;
                }

                config.lexicalGroups.splice(index, 1);
                setConfig(widget, config);
                refreshLexicalFields($responseForm, widget);
            })
        );

        $responseForm.on(
            `mousedown${NS} click${NS}`,
            '[data-action="add-variant"]',
            bindPointerOrKeyboardAction(function () {
                syncConfigFromForm($responseForm, widget);
                const $group = $(this).closest('.lexical-field-group');
                const index = parseInt($group.data('group-index'), 10);
                const config = getConfig(widget);

                if (_.isNaN(index) || !config.lexicalGroups[index]) {
                    return;
                }

                // Commit any draft text already read by syncConfigFromForm, then open
                // a fresh empty draft so "Add variant" works while editing.
                config.lexicalGroups[index].draftVariant = true;
                setConfig(widget, config);
                refreshLexicalFields($responseForm, widget, {
                    focusGroupIndex: index
                });
            })
        );

        $responseForm.on(
            `mousedown${NS} click${NS}`,
            '[data-action="remove-variant"]',
            bindPointerOrKeyboardAction(function () {
                syncConfigFromForm($responseForm, widget);
                const $chip = $(this).closest('.lexical-field-variant-chip');
                const $group = $(this).closest('.lexical-field-group');
                const groupIndex = parseInt($group.data('group-index'), 10);
                const variantIndex = parseInt($chip.data('variant-index'), 10);
                const config = getConfig(widget);

                if (_.isNaN(groupIndex) || _.isNaN(variantIndex) || !config.lexicalGroups[groupIndex]) {
                    return;
                }

                const group = config.lexicalGroups[groupIndex];
                const canonical = String(
                    $group.find('.lexical-field-canonical').val() || group.canonical || ''
                ).trim();
                const additional = getAdditionalVariants(canonical, group.synonyms, config.caseSensitive);

                if (!additional[variantIndex]) {
                    return;
                }

                additional.splice(variantIndex, 1);
                group.canonical = canonical;
                group.synonyms = mergeCanonicalIntoSynonyms(canonical, additional, {
                    caseSensitive: config.caseSensitive
                });
                group.draftVariant = false;
                setConfig(widget, config);
                refreshLexicalFields($responseForm, widget);
            })
        );

        const commitVariantInput = function commitVariantInput($input, options) {
            const $group = $input.closest('.lexical-field-group');
            const groupIndex = parseInt($group.data('group-index'), 10);
            const config = getConfig(widget);
            const value = String($input.val()).trim();
            const chipVariants = readChipVariantsFromGroup($group);
            const canonical = String(
                $group.find('.lexical-field-canonical').val() ||
                    (config.lexicalGroups[groupIndex] && config.lexicalGroups[groupIndex].canonical) ||
                    ''
            ).trim();

            if (!config.lexicalGroups[groupIndex]) {
                return;
            }

            const identifier =
                String(
                    $group.attr('data-group-identifier') || config.lexicalGroups[groupIndex].identifier || ''
                ).trim() || evaluationHelper.buildNextLexicalGroupIdentifier(config.lexicalGroups);

            config.lexicalGroups[groupIndex].identifier = identifier;
            config.lexicalGroups[groupIndex].canonical = canonical;

            if (
                value &&
                (evaluationHelper.hasLexicalVariant(chipVariants, value, config.caseSensitive) ||
                    evaluationHelper.hasLexicalVariant([canonical], value, config.caseSensitive))
            ) {
                showVariantInputError($input, DUPLICATE_VARIANT_MESSAGE);
                config.lexicalGroups[groupIndex].synonyms = mergeCanonicalIntoSynonyms(canonical, chipVariants, {
                    caseSensitive: config.caseSensitive
                });
                config.lexicalGroups[groupIndex].draftVariant = true;
                setConfig(widget, config);
                return;
            }

            disposeVariantInputTooltip($input);
            config.lexicalGroups[groupIndex].synonyms = buildSynonymsFromGroup($group, canonical, {
                caseSensitive: config.caseSensitive
            });
            config.lexicalGroups[groupIndex].draftVariant = false;
            setConfig(widget, config);

            if (options && options.deferRefresh) {
                scheduleLexicalFieldsRefresh($responseForm, widget);
                return;
            }

            refreshLexicalFields($responseForm, widget);
        };

        $responseForm.on(`input${NS}`, '.lexical-field-variant-input', function () {
            clearVariantInputError($(this));
        });

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

            commitVariantInput($(this), { deferRefresh: true });
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
        cancelDebouncedSync(widget);
        cancelScheduledLexicalFieldsRefresh(widget);
        $responseForm.off(NS);
        $responseForm.off(DOC_NS);
        $(document).off(`mouseup${DOC_NS}`);
        suppressVariantBlurCommit = false;
        clearSuppressNextActionClick();

        if (widget) {
            delete widget._textEntryEvaluationConfig;
            delete widget._addingLexicalField;
        }
    };

    return {
        getTplData,
        bindEvents,
        unbindEvents,
        syncConfigFromForm,
        flushOpenForms,
        readChipVariantsFromGroup,
        readVariantsFromGroup,
        readLexicalGroupsFromForm,
        mergeCanonicalIntoSynonyms,
        getAdditionalVariants
    };
});
