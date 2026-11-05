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
 * Graphic gap match interaction — Question (authoring) state.
 *
 * Responsibilities in this module:
 * - Raphael shape editor for associable hotspots (drop targets on the background image)
 * - Gap choices in ul.source: gapImg (image) and gapText (label), with choice property panel
 * - Interaction-level form (background image, choice bay position)
 *
 * Gap text tiles, add-choice flyout, and gap-text form logic live in sibling helpers under
 * ../helpers/; this file wires them into the state lifecycle.
 *
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
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',

    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextInteractionSupport',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextTileLayout',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapAddOptionControl',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapTextQuestionAuthoring',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/minMaxThresholdListeners',
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
    mediaTlbTpl,
    panel,
    bgImage,
    ensureGapTextSupport,
    gapTextTileLayout,
    gapAddOptionControl,
    createGapTextQuestionAuthoring,
    minMaxThresholdListeners
) {
    'use strict';

    var GraphicGapMatchInteractionStateQuestion;

    /**
     * Apply mediasizer dimensions to the gap choice image in the source list.
     * Writes the chosen pixel width and height to the img width/height attributes (stored on the QTI object).
     * Sets CSS width and height to those values multiplied by factor so the preview matches the scaled canvas.
     *
     * @param {Object} params - mediasizer event data ($target, width, height)
     * @param {number} factor - interaction preview scale (same as for associable hotspots)
     * @param {number} naturalHeight - used when params.height is missing
     * @param {number} naturalWidth - used when params.width is missing
     */
    function applyMediasizerValues(params, factor, naturalHeight, naturalWidth) {
        factor = factor || 1;

        let width = params.width;
        let height = params.height;

        if (!width || !height) {
            width = naturalWidth;
            height = naturalHeight;
        }

        // Resize handlers scale by factor: keep QTI width/height on attributes, apply factor only in CSS (same as hotspots).
        params.$target
            .css({
                width: width * factor,
                height: height * factor
            })
            .attr('width', width)
            .attr('height', height);
    }

    /**
     * Enter Question state: shape editor, existing gap choices, add control, choice property forms.
     */
    function initQuestionState() {
        var $choiceForm, $formChoicePanel, $formInteractionPanel;
        var $left, $top, $width, $height;

        var widget = this.widget;
        var interaction = widget.element;
        var options = widget.options;
        var paper = interaction.paper;
        var gapTextAuthoring;

        // Creator model exposes gapText; bundled qtiItem core may not — shim before any getGapTexts calls.
        ensureGapTextSupport(interaction);

        var gapImgSelectorOptions = _.clone(options);
        gapImgSelectorOptions.title = gapImgSelectorOptions.title
            ? gapImgSelectorOptions.title
            : __('Please select a choice picture for your interaction from the resource manager. \
                  You can add new files from your computer with the button "Add file(s)".');

        // Graphic widget not rendered yet (e.g. missing background); nothing to edit on canvas.
        if (!paper) {
            return;
        }

        $choiceForm = widget.choiceForm;
        $formInteractionPanel = $('#item-editor-interaction-property-bar');
        $formChoicePanel = $('#item-editor-choice-property-bar');

        /** Drop widget listeners that update matchMin/matchMax upper bound when hotspots are added/removed. */
        function unbindMinMaxThresholdListeners() {
            minMaxThresholdListeners.unbind(widget);
        }

        /** Close choice property panel and persist pending gap text label edits. */
        function leaveChoiceForm() {
            gapTextAuthoring.syncGapTextLabelFromForm();
            gapTextAuthoring.clearEditingSerial();
            unbindMinMaxThresholdListeners();

            if ($formChoicePanel.css('display') !== 'none') {
                panel.openSections($formInteractionPanel.children('section'));
                $formChoicePanel.hide();
                $choiceForm.empty();
            }
        }

        gapTextAuthoring = createGapTextQuestionAuthoring({
            widget,
            interaction,
            $choiceForm,
            $formChoicePanel,
            $formInteractionPanel,
            leaveChoiceForm,
            unbindMinMaxThresholdListeners
        });

        // Shape editor draws hotspots on interaction.paper; shape.id is set to the new choice serial in shapeCreated.
        widget._editor = shapeEditor(widget, {
            shapeCreated: function (shape, type) {
                var newChoice = interaction.createChoice({
                    shape: type === 'path' ? 'poly' : type,
                    coords: GraphicHelper.qtiCoords(shape)
                });

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

                    // While hotspot form is open, keep x/y/width/height fields in sync with canvas drag/resize.
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

        widget._editor.create();

        // Re-bind UI for choices loaded from item XML (each setUp* opens that choice's property form last-wins).
        _.forEach(interaction.getGapImgs(), setUpGapImg);
        _.forEach(interaction.getGapTexts(), gapTextAuthoring.setUpGapText);
        gapTextTileLayout.syncAllGapTextTilesInList($('ul.source', widget.$original));

        // "+" in source list: flyout to add gapImg (resource manager) or gapText (see gapAddOptionControl.js).
        gapAddOptionControl.install({
            widget,
            interaction,
            gapImgSelectorOptions,
            setUpGapImg,
            onBeforeAddGapText: unbindMinMaxThresholdListeners,
            setUpGapText: gapTextAuthoring.setUpGapText
        });

        // Window resize breaks hotspot coordinate sync; leave Question via Sleep and re-enter cleanly.
        $(window).on('resize.changestate', function () {
            widget.changeState('sleep');
        });

        /**
         * Render or refresh a gapImg tile in ul.source, wire delete, and show its property form.
         *
         * @param {Object} gapImgObj
         */
        function setUpGapImg(gapImgObj) {
            const $gapList = $('ul.source', widget.$original),
                $addOption = $gapList.find('li.add-option.empty'),
                $deleteBtn = $(mediaTlbTpl());
            let $gapImgBox = $(`[data-serial="${gapImgObj.serial}"]`, $gapList);

            // New choices sit before the persistent "add option" row at the end of the list.
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
         * Associable hotspot selected on canvas — show geometry + matchMin/matchMax in choice property panel.
         *
         * @private
         * @param {String} serial - associableHotspot serial (also the id of the matching shape on interaction.paper)
         */
        function enterChoiceForm(serial) {
            var choice = interaction.getChoice(serial);
            var element, bbox, callbacks;

            if (choice) {
                // Switching choice type: flush gap text label before replacing choice form HTML.
                gapTextAuthoring.syncGapTextLabelFromForm();
                unbindMinMaxThresholdListeners();

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

                        // upperThreshold = number of hotspots; changes when author draws or deletes shapes.
                        minMaxThresholdListeners.bindChoiceCountThresholds(self, widget, interaction);
                        widget.infinityMatchMax('hotspot', choice);
                    })
                    .on('change', function () {
                        widget.infinityMatchMax('hotspot', choice);
                    });

                formElement.initWidget($choiceForm);

                callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
                callbacks.identifier = identifierHelper.updateChoiceIdentifier;
                callbacks.fixed = formElement.getAttributeChangeCallback();

                formElement.setChangeCallbacks($choiceForm, choice, callbacks);

                $formChoicePanel.show();
                panel.openSections($formChoicePanel.children('section'));
                panel.closeSections($formInteractionPanel.children('section'));

                // Bound for shapeChange so dragging/resizing updates the form without re-entering.
                $left = $('input[name=x]', $choiceForm);
                $top = $('input[name=y]', $choiceForm);
                $width = $('input[name=width]', $choiceForm);
                $height = $('input[name=height]', $choiceForm);
            }
        }

        /**
         * Gap image selected in source bay — image picker, mediasizer, matchMin/matchMax in choice panel.
         *
         * @private
         * @param {String} serial - gapImg serial
         */
        function enterGapImgForm(serial) {
            let callbacks,
                gapImg = interaction.getGapImg(serial),
                initMediasizer,
                $gapImgBox,
                $gapImgElem,
                $mediaSizer;

            if (gapImg) {
                gapTextAuthoring.syncGapTextLabelFromForm();
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

                // matchMin/matchMax refer to associations with hotspots; upper bound is hotspot count, not gap count.
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

                        minMaxThresholdListeners.bindChoiceCountThresholds(self, widget, interaction);
                        // Warn when matchMax is 0 (unlimited) and scoring pairs assume a finite cap.
                        widget.infinityMatchMax('gapImg', gapImg);
                    })
                    .on('change', function () {
                        widget.infinityMatchMax('gapImg', gapImg);
                    });

                $gapImgBox = $(`li[data-serial="${gapImg.serial}"]`);

                $gapImgElem = $gapImgBox.find('img');

                // Mediasizer targets the preview img in ul.source, not the form thumbnail (applyToMedium: false).
                $mediaSizer = $choiceForm.find('.media-sizer-panel').on('create.mediasizer', function (e, params) {
                    // On init, mediasizer reads CSS size; QTI logical size is on width/height attributes (TAO-3263).
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
                    // Align jQuery layout dimensions with QTI attributes before mediasizer reads the target.
                    $gapImgElem.width($gapImgElem.attr('width'));
                    $gapImgElem.height($gapImgElem.attr('height'));

                    $mediaSizer.empty().mediasizer({
                        target: $gapImgElem,
                        showResponsiveToggle: false,
                        showSync: false,
                        responsive: false,
                        parentSelector: $gapImgBox,
                        applyToMedium: false,
                        maxWidth: interaction.object.attr('width')
                    });
                };

                // Mediasizer needs natural dimensions; wait for the choice image to load if necessary.
                if ($gapImgElem.get(0) && $gapImgElem.get(0).complete) {
                    initMediasizer();
                } else {
                    $gapImgElem.one('load', initMediasizer);
                }

                imageSelector($choiceForm, gapImgSelectorOptions);

                formElement.initWidget($choiceForm);

                callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
                callbacks.identifier = identifierHelper.updateChoiceIdentifier;
                callbacks.fixed = formElement.getAttributeChangeCallback();
                callbacks.data = function (element, value) {
                    gapImg.object.attr('data', value);
                    // Re-render source tile after resource manager picks a new file.
                    setUpGapImg(gapImg);
                };

                $mediaSizer.on('sizechange.mediasizer', function (e, params) {
                    applyMediasizerValues(
                        params,
                        widget.$original.data('factor'),
                        $gapImgElem.get(0).naturalHeight,
                        $gapImgElem.get(0).naturalWidth
                    );

                    // Persist logical size on the QTI object nested under gapImg (export / reload).
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
    }

    /**
     * Leave Question state: validate interaction, tear down editors/handlers, reset source bay for Sleep/Preview.
     */
    function exitQuestionState() {
        var widget = this.widget;
        var interaction = widget.element;
        var paper = interaction.paper;

        ensureGapTextSupport(interaction);

        // Valid item: background image, at least one hotspot, at least one draggable gap (image or text).
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
        minMaxThresholdListeners.unbind(widget);

        if (widget._editor) {
            widget._editor.destroy();
        }

        gapAddOptionControl.teardown(widget);

        // Remove authoring-only "+" row; preview states render the source list without it.
        $('ul.source .empty', widget.$original).remove();

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
     * Required override for InteractionStateQuestion: runs on Question state enter before widget.$form is shown.
     * Renders graphicGapMatch formTpl into widget.$form and binds background image + choice-bay position fields.
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
            var classes = (className || '')
                .split(/\s+/)
                .filter(Boolean)
                .filter(function (c) {
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
                const $gapList = $('ul.source', widget.$original);

                applyPosition(value);
                // Bay position changes available width; recalculate gapText tile sizes (see gapTextTileLayout.js).
                $gapList.find('li.qti-gapText').removeClass('active gap-text-tile-expanded');
                gapTextTileLayout.syncAllGapTextTilesInList($gapList);
            }
        });
    };

    return GraphicGapMatchInteractionStateQuestion;
});
