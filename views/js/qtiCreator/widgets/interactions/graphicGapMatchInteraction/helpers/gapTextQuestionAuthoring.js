/**
 * Gap text choices in graphic gap match Question state: tiles, inline labels, property panel sync.
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/gapText',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextTileLayout',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/minMaxThresholdListeners'
], function (
    $,
    _,
    __,
    mediaTlbTpl,
    gapTextFormTpl,
    panel,
    formElement,
    identifierHelper,
    minMaxComponentFactory,
    gapTextTileLayout,
    minMaxThresholdListeners
) {
    'use strict';

    /**
     * @param {Object} config
     * @param {Object} config.widget
     * @param {Object} config.interaction
     * @param {jQuery} config.$choiceForm
     * @param {jQuery} config.$formChoicePanel
     * @param {jQuery} config.$formInteractionPanel
     * @param {Function} config.leaveChoiceForm
     * @param {Function} config.unbindMinMaxThresholdListeners
     */
    function createGapTextQuestionAuthoring(config) {
        const widget = config.widget;
        const interaction = config.interaction;
        const $choiceForm = config.$choiceForm;
        const $formChoicePanel = config.$formChoicePanel;
        const $formInteractionPanel = config.$formInteractionPanel;
        const GAP_TEXT_MAX_CHARS = gapTextTileLayout.GAP_TEXT_MAX_CHARS;

        function centerGapTextLabelInTile($gapTextBox) {
            gapTextTileLayout.syncGapTextTileSize($gapTextBox);
        }

        function getGapTextPlainLabel(gapText) {
            return gapTextTileLayout.getPlainLabelFromGapText(gapText);
        }

        function updateGapTextTileLabel($gapTextBox, label) {
            gapTextTileLayout.mountGapTextTileLabel($gapTextBox, label);
            $gapTextBox.find('.gap-text-label').prop('readonly', false);

            requestAnimationFrame(function () {
                centerGapTextLabelInTile($gapTextBox);
            });
        }

        function setGapTextPlainLabel(gapText, label) {
            let normalizedLabel = label || '';

            if (normalizedLabel.length > GAP_TEXT_MAX_CHARS) {
                normalizedLabel = normalizedLabel.slice(0, GAP_TEXT_MAX_CHARS);
            }

            gapText.body(_.escape(normalizedLabel));

            const $gapTextBox = $(`[data-serial="${gapText.serial}"]`, $('ul.source', widget.$original));

            if ($gapTextBox.length) {
                const $inlineLabel = $gapTextBox.find('.gap-text-label');

                if ($inlineLabel.length && $inlineLabel.is('input, textarea')) {
                    if ($inlineLabel.val() !== normalizedLabel) {
                        $inlineLabel.val(normalizedLabel);
                    }
                    if (document.activeElement !== $inlineLabel[0]) {
                        centerGapTextLabelInTile($gapTextBox);
                    }
                } else {
                    updateGapTextTileLabel($gapTextBox, normalizedLabel);
                }
            }
        }

        function syncGapTextLabelFromInline($gapTextBox) {
            const serial = $gapTextBox.attr('data-serial');
            const gapText = serial ? interaction.getGapText(serial) : null;
            const $inlineLabel = $gapTextBox.find('.gap-text-label');

            if (!gapText || !$inlineLabel.length) {
                return;
            }

            const value = $inlineLabel.val() || '';

            setGapTextPlainLabel(gapText, value);

            if (widget._editingGapTextSerial === serial) {
                const $labelInput = $choiceForm.find('[name=gapTextLabel]');

                if ($labelInput.length) {
                    $labelInput.val(value);
                }
            }
        }

        function syncGapTextLabelFromForm() {
            const serial = widget._editingGapTextSerial;
            const $gapTextBox = serial
                ? $(`[data-serial="${serial}"]`, $('ul.source', widget.$original))
                : $();
            const $inlineLabel = $gapTextBox.find('.gap-text-label');

            if (serial && $inlineLabel.length) {
                syncGapTextLabelFromInline($gapTextBox);
                return;
            }

            const $labelInput = $choiceForm.find('[name=gapTextLabel]');

            if (!serial || !$labelInput.length) {
                return;
            }

            const gapText = interaction.getGapText(serial);

            if (gapText) {
                setGapTextPlainLabel(gapText, $labelInput.val());
            }
        }

        function clearEditingSerial() {
            widget._editingGapTextSerial = null;
        }

        function enterGapTextForm(serial) {
            let callbacks;
            const gapText = interaction.getGapText(serial);

            if (!gapText) {
                return;
            }

            syncGapTextLabelFromForm();
            config.unbindMinMaxThresholdListeners();

            widget._editingGapTextSerial = serial;

            $choiceForm.empty().html(
                gapTextFormTpl({
                    identifier: gapText.id(),
                    serial: serial,
                    label: getGapTextPlainLabel(gapText)
                })
            );
            $choiceForm.append(
                '<div class="panel min-max-panel"><h3>' +
                    __('Max. number of matches') +
                    ' </h3></div>' +
                    '<div class="response-matchmax-info gapText hidden"><p class="feedback-info">' +
                    __(
                        'The MAXSCORE of this item is removed because the current interaction settings allow an infinite value to the score.'
                    ) +
                    '</p></div>'
            );

            minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                min: {
                    fieldName: 'matchMin',
                    value: _.parseInt(gapText.attr('matchMin')) || 0,
                    helpMessage: __(
                        'The minimum number of choices this choice must be associated with to form a valid response.'
                    )
                },
                max: {
                    fieldName: 'matchMax',
                    value: _.parseInt(gapText.attr('matchMax')) || 0,
                    helpMessage: __('The maximum number of choices this choice may be associated with.')
                },
                upperThreshold: _.size(interaction.getChoices())
            })
                .on('render', function () {
                    const self = this;

                    minMaxThresholdListeners.bindChoiceCountThresholds(self, widget, interaction);
                    widget.infinityMatchMax('gapText', gapText);
                })
                .on('change', function () {
                    widget.infinityMatchMax('gapText', gapText);
                });

            formElement.initWidget($choiceForm);

            callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
            callbacks.identifier = identifierHelper.updateChoiceIdentifier;
            formElement.setChangeCallbacks($choiceForm, gapText, callbacks);

            $choiceForm.find('[name=gapTextLabel]').on('change input blur', function () {
                setGapTextPlainLabel(gapText, $(this).val());
            });

            $formChoicePanel.show();
            panel.openSections($formChoicePanel.children('section'));
            panel.closeSections($formInteractionPanel.children('section'));

            if (typeof window.scroll === 'function') {
                window.scroll(0, $choiceForm.offset().top);
            }
        }

        function bindGapTextInlineLabel($gapTextBox, serial) {
            if ($gapTextBox.data('gapTextInlineBound')) {
                return;
            }

            $gapTextBox.data('gapTextInlineBound', true);

            $gapTextBox.on('click.gapTextInline mousedown.gapTextInline', '.gap-text-label', function (e) {
                e.stopPropagation();
            });

            $gapTextBox.on('focus.gapTextInline', '.gap-text-label', function () {
                if (!$gapTextBox.hasClass('active')) {
                    $('.active', $('ul.source', widget.$original)).removeClass('active');
                    $gapTextBox.addClass('active');
                    enterGapTextForm(serial);
                }

                centerGapTextLabelInTile($gapTextBox);
            });

            $gapTextBox.on('input.gapTextInline change.gapTextInline', '.gap-text-label', function () {
                const gapText = interaction.getGapText(serial);
                let value = $(this).val();

                if (!gapText) {
                    return;
                }

                value = (value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                if (value.length > GAP_TEXT_MAX_CHARS) {
                    value = value.slice(0, GAP_TEXT_MAX_CHARS);
                    $(this).val(value);
                }

                setGapTextPlainLabel(gapText, value);

                if (widget._editingGapTextSerial === serial) {
                    $choiceForm.find('[name=gapTextLabel]').val(value);
                }

                centerGapTextLabelInTile($gapTextBox);
            });

            $gapTextBox.on('paste.gapTextInline', '.gap-text-label', function () {
                const $textarea = $(this);

                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(function () {
                        centerGapTextLabelInTile($gapTextBox);
                        $textarea.trigger('input');
                    });
                });
            });

            $gapTextBox.on('keydown.gapTextInline', '.gap-text-label', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    $(this).blur();
                }
            });

            $gapTextBox.on('blur.gapTextInline', '.gap-text-label', function () {
                centerGapTextLabelInTile($gapTextBox);
                syncGapTextLabelFromInline($gapTextBox);
            });
        }

        function setUpGapText(gapTextObj, options) {
            config.unbindMinMaxThresholdListeners();

            const $gapList = $('ul.source', widget.$original);
            const $addOption = $gapList.find('li.add-option.empty');
            const $deleteBtn = $(mediaTlbTpl());
            let $gapTextBox = $gapList.find(`[data-serial="${gapTextObj.serial}"]`);

            if (!$gapTextBox.length) {
                const $placeholder = $('<li/>');

                $placeholder.insertBefore($addOption);
                gapTextObj.render({}, $placeholder);
                $gapTextBox = $gapList.find(`[data-serial="${gapTextObj.serial}"]`);
            }

            $gapTextBox.addClass('qti-gapImg qti-gapText selectable');
            updateGapTextTileLabel($gapTextBox, getGapTextPlainLabel(gapTextObj));
            bindGapTextInlineLabel($gapTextBox, gapTextObj.serial);

            enterGapTextForm(gapTextObj.serial);

            $deleteBtn
                .appendTo($gapTextBox)
                .show()
                .click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $gapTextBox.remove();
                    interaction.removeGapText(gapTextObj);
                });

            $gapTextBox.off('click.gapText').on('click.gapText', function (e) {
                if ($(e.target).closest('.mini-tlb').length || $(e.target).closest('.gap-text-label').length) {
                    return;
                }

                if ($gapTextBox.hasClass('active')) {
                    $gapTextBox.removeClass('active');
                    config.leaveChoiceForm();
                } else {
                    $('.active', $gapList).removeClass('active');
                    $gapTextBox.addClass('active');
                    enterGapTextForm(gapTextObj.serial);
                }
            });

            if (options && options.autoFocus) {
                window.requestAnimationFrame(function () {
                    centerGapTextLabelInTile($gapTextBox);
                    const $textarea = $gapTextBox.find('.gap-text-label');
                    const textareaEl = $textarea[0];

                    if (textareaEl) {
                        $textarea.focus();
                        textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
                    }
                });
            }
        }

        return {
            setUpGapText,
            syncGapTextLabelFromForm,
            clearEditingSerial
        };
    }

    return createGapTextQuestionAuthoring;
});
