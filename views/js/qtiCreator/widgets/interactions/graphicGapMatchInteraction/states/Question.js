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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',

    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/graphicGapMatch',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/associableHotspot',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/gapImg',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/gapText',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/graphicGapMatch.adder',

    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/resourceManager',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextInteractionSupport',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextTileLayout',
    'ui/mediasizer'
], function (
    $,
    _,
    __,
    GraphicHelper,
    stateFactory,
    Question,
    shapeEditor,
    imageSelector,
    formElement,
    identifierHelper,
    minMaxComponentFactory,
    formTpl,
    choiceFormTpl,
    gapImgFormTpl,
    gapTextFormTpl,
    mediaTlbTpl,
    graphicGapMatchAdderTpl,
    panel,
    resourceManager,
    bgImage,
    ensureGapTextSupport,
    gapTextTileLayout
) {
    'use strict';

    var GraphicGapMatchInteractionStateQuestion;

    /**
     * Apply size changes manually to mediasizer's target.
     *
     * @param {Object} params
     * @param {number} factor
     * @param {number} naturalHeight
     * @param {number} naturalWidth
     */
    function applyMediasizerValues(params, factor, naturalHeight, naturalWidth) {
        factor = factor || 1;

        let width = params.width;
        let height = params.height;

        if (!width || !height) {
            width = naturalWidth;
            height = naturalHeight;
        }

        // The mediasizer target maintains a height and width (i.e. attributes)
        // but is displayed according to a factor (i.e. styles). This matches
        // the behavior of hotspots.
        // This is because resize events utilize factor to adjust images, thus,
        // the target's dimensions need to be maintained.
        params.$target
            .css({
                width: width * factor,
                height: height * factor
            })
            .attr('width', width)
            .attr('height', height);
    }

    /**
     * Question State initialization: set up side bar, editors and shape factory
     */
    function initQuestionState() {
        var $choiceForm, $formChoicePanel, $formInteractionPanel;
        var $left, $top, $width, $height;

        var widget = this.widget;
        var interaction = widget.element;
        var options = widget.options;
        var paper = interaction.paper;

        const GAP_TEXT_MAX_CHARS = gapTextTileLayout.GAP_TEXT_MAX_CHARS;

        ensureGapTextSupport(interaction);

        function centerGapTextLabelInTile($gapTextBox) {
            gapTextTileLayout.syncGapTextTileSize($gapTextBox);
        }

        var gapImgSelectorOptions = _.clone(options);
        gapImgSelectorOptions.title = gapImgSelectorOptions.title
            ? gapImgSelectorOptions.title
            : __('Please select a choice picture for your interaction from the resource manager. \
                  You can add new files from your computer with the button "Add file(s)".');

        if (!paper) {
            return;
        }

        $choiceForm = widget.choiceForm;
        $formInteractionPanel = $('#item-editor-interaction-property-bar');
        $formChoicePanel = $('#item-editor-choice-property-bar');

        //instantiate the shape editor, attach it to the widget to retrieve it during the exit phase
        widget._editor = shapeEditor(widget, {
            shapeCreated: function (shape, type) {
                var newChoice = interaction.createChoice({
                    shape: type === 'path' ? 'poly' : type,
                    coords: GraphicHelper.qtiCoords(shape)
                });

                //link the shape to the choice
                shape.id = newChoice.serial;
            },
            shapeRemoved: function (id) {
                interaction.removeChoice(id);
            },
            enterHandling: function (shape) {
                enterChoiceForm(shape.id);
            },
            quitHandling: function () {
                leaveChoiceForm();
            },
            shapeChange: function (shape) {
                var bbox;
                var choice = interaction.getChoice(shape.id);
                if (choice) {
                    choice.attr('coords', GraphicHelper.qtiCoords(shape));

                    if ($left && $left.length) {
                        bbox = shape.getBBox();
                        $left.val(parseInt(bbox.x, 10));
                        $top.val(parseInt(bbox.y, 10));
                        $width.val(parseInt(bbox.width, 10));
                        $height.val(parseInt(bbox.height, 10));
                    }
                }
            }
        });

        //and create an instance
        widget._editor.create();

        _.forEach(interaction.getGapImgs(), setUpGapImg);
        _.forEach(interaction.getGapTexts(), setUpGapText);

        createGapAddOption();

        // stop the question mode on resize to keep the coordinate system coherent,
        // even in responsive (the side bar behaves weirdly)
        $(window).on('resize.changestate', function () {
            widget.changeState('sleep');
        });

        /**
         * Create the 'add option' control with image / text gap menu
         */
        function createGapAddOption() {
            const $gapList = $('ul.source', widget.$original);
            const $flyoutHost = $gapList.closest('.image-editor.solid');
            const $positionHost = $flyoutHost.length ? $flyoutHost : widget.$container;
            const $addOption =
                $('<li class="empty add-option" aria-haspopup="menu" aria-expanded="false">' +
                    '<div><span class="icon-add"></span></div>' +
                    '</li>');
            const $menuFlyout = $(
                '<div class="graphic-gap-add-options-flyout" aria-hidden="true">' +
                    graphicGapMatchAdderTpl() +
                    '</div>'
            );

            widget.$container.find('.graphic-gap-add-options-flyout').remove();
            widget.$container.off('click.gapAddOption');

            /**
             * Position flyout on the image editor host, centered on the add-option trigger.
             */
            function positionGapAddMenu() {
                const $trigger = $gapList.find('li.add-option.empty').first();

                if (!$trigger.length || !$positionHost.length) {
                    return;
                }

                const triggerRect = $trigger[0].getBoundingClientRect();
                const hostRect = $positionHost[0].getBoundingClientRect();
                const gapRaw = window
                    .getComputedStyle($menuFlyout[0])
                    .getPropertyValue('--ggm-add-menu-trigger-gap')
                    .trim();
                const gapParsed = parseFloat(gapRaw);
                const gapAboveTrigger = Number.isFinite(gapParsed) ? gapParsed : 8;
                const flyoutWidth = $menuFlyout.outerWidth() || 144;
                const flyoutHeight = $menuFlyout.outerHeight() || 80;
                const hostScrollTop = $positionHost.scrollTop();
                const hostScrollLeft = $positionHost.scrollLeft();
                const triggerTop = triggerRect.top - hostRect.top + hostScrollTop;
                const triggerLeft = triggerRect.left - hostRect.left + hostScrollLeft;
                const topAboveTrigger = triggerTop - flyoutHeight - gapAboveTrigger;
                const topBelowTrigger = triggerTop + triggerRect.height + gapAboveTrigger;
                const minTop = hostScrollTop;
                const maxTop = hostScrollTop + Math.max($positionHost.innerHeight() - flyoutHeight, 0);
                const minLeft = hostScrollLeft;
                const maxLeft = hostScrollLeft + Math.max($positionHost.innerWidth() - flyoutWidth, 0);
                let top = topAboveTrigger;

                if (top < minTop && topBelowTrigger <= maxTop) {
                    top = topBelowTrigger;
                }

                top = Math.min(Math.max(top, minTop), maxTop);

                const centeredLeft = triggerLeft + triggerRect.width / 2 - flyoutWidth / 2;
                const left = Math.min(Math.max(centeredLeft, minLeft), maxLeft);

                $menuFlyout.css({
                    top,
                    left,
                    right: '',
                    bottom: ''
                });
            }

            function hideGapAddMenu() {
                $menuFlyout.removeClass('is-visible').attr('aria-hidden', 'true');
                $addOption.attr('aria-expanded', 'false');
                $gapList.removeClass('graphic-gap-add-menu-open');
                $(document).off('click.graphicGapAddOption');
            }

            function showGapAddMenu() {
                $gapList.addClass('graphic-gap-add-menu-open');
                $menuFlyout.addClass('is-visible').attr('aria-hidden', 'false');
                positionGapAddMenu();
                window.requestAnimationFrame(positionGapAddMenu);
                $addOption.attr('aria-expanded', 'true');

                setTimeout(function () {
                    $(document).on('click.graphicGapAddOption', function (e) {
                        if ($(e.target).closest('.graphic-gap-add-options-flyout', widget.$container).length) {
                            return;
                        }
                        if ($(e.target).closest('ul.source > li.add-option.empty', widget.$container).length) {
                            return;
                        }
                        hideGapAddMenu();
                    });
                }, 0);
            }

            widget.$container.on('click.gapAddOption', 'ul.source > li.add-option.empty', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if ($menuFlyout.hasClass('is-visible')) {
                    hideGapAddMenu();
                } else {
                    showGapAddMenu();
                }
            });

            widget.$container.on(
                'click.gapAddOption',
                '.graphic-gap-add-options-flyout [data-role=add-gap-img]',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    hideGapAddMenu();

                    const $addBtn = $gapList.find('li.add-option.empty');
                    let gapImgObj = interaction.createGapImg({});
                    gapImgObj.object.removeAttr('type');

                    $addBtn.off('selected.upload').on('selected.upload', function (e, args) {
                        $addBtn.off('selected.upload');

                        const size = args.size;
                        let height, width;

                        if (size) {
                            height = args.size.height;
                            width = args.size.width;
                        }

                        gapImgObj.object.attr('data', args.selected.file);
                        gapImgObj.object.attr('type', args.selected.mime);
                        gapImgObj.object.attr('width', width);
                        gapImgObj.object.attr('height', height);
                        setUpGapImg(gapImgObj);
                    });
                    resourceManager($addBtn, gapImgSelectorOptions);
                }
            );

            widget.$container.on(
                'click.gapAddOption',
                '.graphic-gap-add-options-flyout [data-role=add-gap-text]',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    hideGapAddMenu();
                    unbindMinMaxThresholdListeners();
                    setUpGapText(interaction.createGapText(), { autoFocus: true });
                }
            );

            $(window).on('resize.graphicGapAddOption', positionGapAddMenu);

            $positionHost.append($menuFlyout);
            $addOption.appendTo($gapList);
        }

        function getGapTextPlainLabel(gapText) {
            return gapTextTileLayout.getPlainLabelFromGapText(gapText);
        }

        function normalizeGapTextTileLabel(label) {
            return gapTextTileLayout.normalizeGapTextTileLabel(label);
        }

        function finishGapTextEditing($gapTextBox) {
            if (!$gapTextBox.hasClass('active')) {
                return;
            }

            syncGapTextLabelFromInline($gapTextBox);
            $gapTextBox.removeClass('active');
            leaveChoiceForm();
        }

        function updateGapTextTileLabel($gapTextBox, label) {
            gapTextTileLayout.mountGapTextTileLabel($gapTextBox, label);
            $gapTextBox.find('.gap-text-label').prop('readonly', false);

            requestAnimationFrame(function () {
                centerGapTextLabelInTile($gapTextBox);
            });
        }

        /**
         * Inline label editing on the gap text tile (kept in sync with the side panel).
         *
         * @param {jQuery} $gapTextBox
         * @param {String} serial
         */
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

                gapText.body(value || '');

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
                window.setTimeout(function () {
                    if (!$gapTextBox.find('.gap-text-label').is(':focus')) {
                        finishGapTextEditing($gapTextBox);
                    }
                }, 0);
            });
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

        function setGapTextPlainLabel(gapText, label) {
            let normalizedLabel = label || '';

            if (normalizedLabel.length > GAP_TEXT_MAX_CHARS) {
                normalizedLabel = normalizedLabel.slice(0, GAP_TEXT_MAX_CHARS);
            }

            gapText.body(normalizedLabel);

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

        /**
         * Insert and setup the gap text choice
         *
         * @param {Object} gapTextObj
         * @param {Object} [options]
         * @param {Boolean} [options.autoFocus]
         */
        function setUpGapText(gapTextObj, options) {
            unbindMinMaxThresholdListeners();

            const $gapList = $('ul.source', widget.$original),
                $addOption = $gapList.find('li.add-option.empty'),
                $deleteBtn = $(mediaTlbTpl());
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

            $('.active', $gapList).removeClass('active');
            $gapTextBox.addClass('active');
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
                    finishGapTextEditing($gapTextBox);
                } else {
                    $('.active', $gapList).removeClass('active');
                    $gapTextBox.addClass('active');
                    enterGapTextForm(gapTextObj.serial);
                    $gapTextBox.find('.gap-text-label').focus();
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

        /**
         * Insert and setup the gap image
         *
         * @param {Object} gapImgObj
         */
        function setUpGapImg(gapImgObj) {
            const $gapList = $('ul.source', widget.$original),
                $addOption = $gapList.find('li.add-option.empty'),
                $deleteBtn = $(mediaTlbTpl());
            let $gapImgBox = $(`[data-serial="${gapImgObj.serial}"]`, $gapList);

            if (!$gapImgBox.length) {
                $gapImgBox = $(gapImgObj.render()).insertBefore($addOption);
            }

            $deleteBtn
                .appendTo($gapImgBox)
                .show()
                .click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $gapImgBox.remove();
                    interaction.removeGapImg(gapImgObj);
                });

            enterGapImgForm(gapImgObj.serial);

            $gapImgBox.off('click.gapImg').on('click.gapImg', function (e) {
                if ($(e.target).closest('.mini-tlb').length) {
                    return;
                }
                if ($gapImgBox.hasClass('active')) {
                    $gapImgBox.removeClass('active');
                    leaveChoiceForm();
                } else {
                    $('.active', $gapList).removeClass('active');
                    $gapImgBox.addClass('active');
                    enterGapImgForm(gapImgObj.serial);
                }
            });
        }

        /**
         * Set up the choice form
         *
         * @private
         * @param {String} serial - the choice serial
         */
        function enterChoiceForm(serial) {
            var choice = interaction.getChoice(serial);
            var element, bbox, callbacks;

            if (choice) {
                syncGapTextLabelFromForm();
                unbindMinMaxThresholdListeners();

                //get shape bounding box
                element = interaction.paper.getById(serial);
                bbox = element.getBBox();

                $choiceForm.empty().html(
                    choiceFormTpl({
                        identifier: choice.id(),
                        fixed: choice.attr('fixed'),
                        serial: serial,
                        x: parseInt(bbox.x, 10),
                        y: parseInt(bbox.y, 10),
                        width: parseInt(bbox.width, 10),
                        height: parseInt(bbox.height, 10)
                    })
                );

                //controls match min/max for the choices (the shapes)
                minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                    min: {
                        fieldName: 'matchMin',
                        value: _.parseInt(choice.attr('matchMin')) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max: {
                        fieldName: 'matchMax',
                        value: _.parseInt(choice.attr('matchMax')) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold: _.size(interaction.getChoices())
                })
                    .on('render', function () {
                        var self = this;

                        //the range matches the number of choices
                        widget.on('choiceCreated.minMaxThresholds choiceDeleted.minMaxThresholds', function (data) {
                            if (data.interaction.serial === interaction.serial && self.is('rendered')) {
                                self.updateThresholds(1, _.size(interaction.getChoices()));
                            }
                        });
                        // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                        widget.infinityMatchMax('hotspot', choice);
                    })
                    .on('change', function () {
                        // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                        widget.infinityMatchMax('hotspot', choice);
                    });

                formElement.initWidget($choiceForm);

                //init data validation and binding
                callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
                callbacks.identifier = identifierHelper.updateChoiceIdentifier;
                callbacks.fixed = formElement.getAttributeChangeCallback();

                formElement.setChangeCallbacks($choiceForm, choice, callbacks);

                $formChoicePanel.show();
                panel.openSections($formChoicePanel.children('section'));
                panel.closeSections($formInteractionPanel.children('section'));

                //change the nodes bound to the position fields
                $left = $('input[name=x]', $choiceForm);
                $top = $('input[name=y]', $choiceForm);
                $width = $('input[name=width]', $choiceForm);
                $height = $('input[name=height]', $choiceForm);
            }
        }

        /**
         * Leave the choice form
         * @private
         */
        function unbindMinMaxThresholdListeners() {
            const stateName = widget.getCurrentState().name;
            const eventSuffix = `.qti-widget.${widget.serial}.${stateName}`;

            $(document).off(`choiceCreated.minMaxThresholds${eventSuffix}`);
            $(document).off(`choiceDeleted.minMaxThresholds${eventSuffix}`);
        }

        function leaveChoiceForm() {
            syncGapTextLabelFromForm();
            widget._editingGapTextSerial = null;
            unbindMinMaxThresholdListeners();

            if ($formChoicePanel.css('display') !== 'none') {
                panel.openSections($formInteractionPanel.children('section'));
                $formChoicePanel.hide();
                $choiceForm.empty();
            }
        }

        /**
         * Set up the gapImg form
         * @private
         * @param {String} serial - the gapImg serial
         */
        function enterGapImgForm(serial) {
            let callbacks,
                gapImg = interaction.getGapImg(serial),
                initMediasizer,
                $gapImgBox,
                $gapImgElem,
                $mediaSizer;

            if (gapImg) {
                syncGapTextLabelFromForm();
                unbindMinMaxThresholdListeners();

                $choiceForm.empty().html(
                    gapImgFormTpl({
                        identifier: gapImg.id(),
                        fixed: gapImg.attr('fixed'),
                        serial: serial,
                        baseUrl: options.baseUrl,
                        data: gapImg.object.attr('data'),
                        width: gapImg.object.attr('width'),
                        height: gapImg.object.attr('height'),
                        type: gapImg.object.attr('type')
                    })
                );

                //controls the match min/max for the gap images
                minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                    min: {
                        fieldName: 'matchMin',
                        value: _.parseInt(gapImg.attr('matchMin')) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max: {
                        fieldName: 'matchMax',
                        value: _.parseInt(gapImg.attr('matchMax')) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold: _.size(interaction.getChoices())
                })
                    .on('render', function () {
                        var self = this;

                        //the range is matching the number of choices (not the number of gap img)
                        widget.on('choiceCreated.minMaxThresholds choiceDeleted.minMaxThresholds', function (data) {
                            if (data.interaction.serial === interaction.serial && self.is('rendered')) {
                                self.updateThresholds(1, _.size(interaction.getChoices()));
                            }
                        });
                        // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                        widget.infinityMatchMax('gapImg', gapImg);
                    })
                    .on('change', function () {
                        // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                        widget.infinityMatchMax('gapImg', gapImg);
                    });

                // <li/> that will contain the image
                $gapImgBox = $(`li[data-serial="${gapImg.serial}"]`);

                $gapImgElem = $gapImgBox.find('img');

                //init media sizer
                $mediaSizer = $choiceForm.find('.media-sizer-panel').on('create.mediasizer', function (e, params) {
                    // On creation, mediasizer uses style properties to set
                    // width and height, but our image needs to use the
                    // it's attributes to set and resize properly.
                    params.width = $gapImgElem.attr('width');
                    params.height = $gapImgElem.attr('height');
                    applyMediasizerValues(
                        params,
                        widget.$original.data('factor'),
                        $gapImgElem.get(0).naturalHeight,
                        $gapImgElem.get(0).naturalWidth
                    );
                });

                initMediasizer = function () {
                    // Hack to manually set mediasizer to use gapImg's height
                    // and width attributes (instead of it's style properties).
                    $gapImgElem.width($gapImgElem.attr('width'));
                    $gapImgElem.height($gapImgElem.attr('height'));

                    $mediaSizer.empty().mediasizer({
                        target: $gapImgElem,
                        showResponsiveToggle: false,
                        showSync: false,
                        responsive: false,
                        parentSelector: $gapImgBox,
                        // needs to be done on.sizechange.mediasizer to take in account the scale factor
                        applyToMedium: false,
                        maxWidth: interaction.object.attr('width')
                    });
                };

                // Wait for image to load before initializing mediasizer
                if ($gapImgElem.get(0) && $gapImgElem.get(0).complete) {
                    initMediasizer();
                } else {
                    $gapImgElem.one('load', initMediasizer);
                }

                imageSelector($choiceForm, gapImgSelectorOptions);

                formElement.initWidget($choiceForm);

                // bind callbacks to ms
                // init data validation and binding
                callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
                callbacks.identifier = identifierHelper.updateChoiceIdentifier;
                callbacks.fixed = formElement.getAttributeChangeCallback();
                callbacks.data = function (element, value) {
                    gapImg.object.attr('data', value);
                    setUpGapImg(gapImg);
                };

                // callbacks
                $mediaSizer.on('sizechange.mediasizer', function (e, params) {
                    applyMediasizerValues(
                        params,
                        widget.$original.data('factor'),
                        $gapImgElem.get(0).naturalHeight,
                        $gapImgElem.get(0).naturalWidth
                    );

                    gapImg.object.attr('width', params.width);
                    gapImg.object.attr('height', params.height);
                });

                callbacks.type = function (element, value) {
                    if (!value || value === '') {
                        interaction.object.removeAttr('type');
                    } else {
                        gapImg.object.attr('type', value);
                    }
                };
                formElement.setChangeCallbacks($choiceForm, gapImg, callbacks);

                $formChoicePanel.show();
                panel.openSections($formChoicePanel.children('section'));
                panel.closeSections($formInteractionPanel.children('section'));

                if (typeof window.scroll === 'function') {
                    window.scroll(0, $choiceForm.offset().top);
                }
            }
        }

        /**
         * Set up the gapText form
         * @private
         * @param {String} serial - the gapText serial
         */
        function enterGapTextForm(serial) {
            let callbacks,
                gapText = interaction.getGapText(serial);

            if (gapText) {
                syncGapTextLabelFromForm();
                unbindMinMaxThresholdListeners();

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
                        var self = this;

                        widget.on('choiceCreated.minMaxThresholds choiceDeleted.minMaxThresholds', function (data) {
                            if (data.interaction.serial === interaction.serial && self.is('rendered')) {
                                self.updateThresholds(1, _.size(interaction.getChoices()));
                            }
                        });
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

                const $tileLabel = $(`[data-serial="${serial}"] .gap-text-label`, $('ul.source', widget.$original));

                if ($tileLabel.length) {
                    $tileLabel.focus();
                } else {
                    $choiceForm.find('[name=gapTextLabel]').focus();

                    if (typeof window.scroll === 'function') {
                        window.scroll(0, $choiceForm.offset().top);
                    }
                }
            }
        }
    }

    /**
     * Exit the question state, leave the room cleaned up
     */
    function exitQuestionState() {
        var widget = this.widget;
        var interaction = widget.element;
        var paper = interaction.paper;

        ensureGapTextSupport(interaction);

        var hasGapChoices =
            !_.isEmpty(interaction.getGapImgs()) || !_.isEmpty(interaction.getGapTexts());
        var valid = !!interaction.object.attr('data') && !_.isEmpty(interaction.choices) && hasGapChoices;

        widget.isValid(
            'graphicGapMatchInteraction',
            valid,
            __(
                'A graphic gap match interaction requires a background image, at least one hotspot, and at least one gap choice (image or text).'
            )
        );

        if (!paper) {
            return;
        }

        $(window).off('resize.changestate');
        $(document).off('click.graphicGapAddOption');

        if (widget._editor) {
            widget._editor.destroy();
        }

        widget.$container.off('click.gapAddOption');
        $('.graphic-gap-add-options-flyout', widget.$container).remove();
        $('ul.source', widget.$original).removeClass('graphic-gap-add-menu-open');
        $(window).off('resize.graphicGapAddOption');

        //remove gapImg placeholder
        $('ul.source .empty', widget.$original).remove();

        //restore gap choice appearance
        widget.$container.find('.qti-gapImg, .qti-gapText').removeClass('active').find('.mini-tlb').remove();
        gapTextTileLayout.syncAllGapTextTilesInList($('ul.source', widget.$original));
        $('.image-editor.solid, .block-listing.source', widget.$container).css('min-width', 0);
    }

    /**
     * The question state for the graphicGapMatch interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Question
     */
    GraphicGapMatchInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    GraphicGapMatchInteractionStateQuestion.prototype.initForm = function () {
        var widget = this.widget;
        var options = widget.options;
        var interaction = widget.element;
        var $form = widget.$form;
        var $interaction = widget.$container.find('.qti-interaction');
        var getPosition = function getPosition(className) {
            var match = (className || '').match(/(?:^|\s)qti-choices-(top|bottom|left|right)(?:\s|$)/);

            return match ? match[1] : 'left';
        };
        var normalizeClass = function normalizeClass(className, position) {
            var classes = (className || '').split(/\s+/).filter(Boolean).filter(function (c) {
                return !/^qti-choices-\S+$/.test(c);
            });

            classes.push('qti-choices-' + position);

            return classes.join(' ');
        };
        var applyPosition = function applyPosition(position) {
            var className = normalizeClass(interaction.attr('class'), position);

            interaction.attr('class', className);
            $interaction.attr('class', normalizeClass($interaction.attr('class'), position));
        };
        var position = getPosition(interaction.attr('class'));

        applyPosition(position);

        $form.html(
            formTpl({
                baseUrl: options.baseUrl,
                data: interaction.object.attr('data'),
                width: interaction.object.attr('width'),
                height: interaction.object.attr('height'),
                type: interaction.object.attr('type'),
                position: position
            })
        );

        imageSelector($form, options);

        formElement.initWidget($form);

        bgImage.setupImage(widget);

        bgImage.setChangeCallbacks(widget, formElement, {
            position: function (interaction, value) {
                applyPosition(value);
            }
        });
    };

    return GraphicGapMatchInteractionStateQuestion;
});
