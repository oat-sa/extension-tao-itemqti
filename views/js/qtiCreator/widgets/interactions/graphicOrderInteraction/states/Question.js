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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/graphicOrder',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/hotspot',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage'
], function (
    $,
    _,
    GraphicHelper,
    stateFactory,
    Question,
    shapeEditor,
    imageSelector,
    formElement,
    minMaxComponentFactory,
    identifierHelper,
    formTpl,
    choiceFormTpl,
    panel,
    bgImage
) {
    'use strict';

    /**
     * Question State initialization: set up side bar, editors and shae factory
     */
    function initQuestionState() {
        const widget = this.widget;
        const interaction = widget.element;
        const paper = interaction.paper;

        const $choiceForm = widget.choiceForm;
        const $formInteractionPanel = $('#item-editor-interaction-property-bar');
        const $formChoicePanel = $('#item-editor-choice-property-bar');

        let $left, $top, $width, $height;

        if (!paper) {
            return;
        }

        //instantiate the shape editor, attach it to the widget to retrieve it during the exit phase
        widget._editor = shapeEditor(widget, {
            shapeCreated: function (shape, type) {
                const newChoice = interaction.createChoice({
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
                const choice = interaction.getChoice(shape.id);
                if (choice) {
                    choice.attr('coords', GraphicHelper.qtiCoords(shape, paper, interaction.object.attr('width')));

                    if ($left && $left.length) {
                        const bbox = shape.getBBox();
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

        //we need to stop the question mode on resize, to keep the coordinate system coherent,
        //even in responsive (the side bar introduce a biais)
        $(window).on('resize.changestate', function () {
            widget.changeState('sleep');
        });

        widget.on('attributeChange', function (data) {
            if (data.key === 'maxChoices') {
                widget.renderOrderList();
            }
        });
        /**
         * Set up the choice form
         * @private
         * @param {String} serial - the choice serial
         */
        function enterChoiceForm(serial) {
            const choice = interaction.getChoice(serial);
            if (choice) {
                //get shape bounding box
                const element = interaction.paper.getById(serial);
                const bbox = element.getBBox();

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

                formElement.initWidget($choiceForm);

                //init data validation and binding
                formElement.setChangeCallbacks($choiceForm, choice, {
                    identifier: identifierHelper.updateChoiceIdentifier,
                    fixed: formElement.getAttributeChangeCallback()
                });

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
        function leaveChoiceForm() {
            if ($formChoicePanel.css('display') !== 'none') {
                panel.openSections($formInteractionPanel.children('section'));
                $formChoicePanel.hide();
                $choiceForm.empty();
            }
        }
    }

    /**
     * Exit the question state, leave the room cleaned up
     */
    function exitQuestionState() {
        const widget = this.widget;
        const interaction = widget.element;
        const paper = interaction.paper;
        const valid = !!interaction.object.attr('data') && !_.isEmpty(interaction.choices);

        widget.isValid('graphicOrderInteraction', valid);

        if (!paper) {
            return;
        }

        $(window).off('resize.changestate');

        if (widget._editor) {
            widget._editor.destroy();
        }
        $('.image-editor.solid, .block-listing.source', this.widget.$container).css('min-width', 0);
    }

    /**
     * The question state for the graphicOrder interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/Question
     */
    const GraphicOrderInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    GraphicOrderInteractionStateQuestion.prototype.initForm = function () {
        const widget = this.widget;
        const options = widget.options;
        const interaction = widget.element;
        const $form = widget.$form;

        $form.html(
            formTpl({
                baseUrl: options.baseUrl,
                data: interaction.object.attr('data'),
                width: interaction.object.attr('width'),
                height: interaction.object.attr('height'),
                type: interaction.object.attr('type')
            })
        );

        //controls min and max choices
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min: { value: _.parseInt(interaction.attr('minChoices')) || 0 },
            max: { value: _.parseInt(interaction.attr('maxChoices')) || 0 },
            upperThreshold: _.size(interaction.getChoices())
        }).on('render', function () {
            widget.on('choiceCreated choiceDeleted', data => {
                if (data.interaction.serial === interaction.serial) {
                    this.updateThresholds(1, _.size(interaction.getChoices()));
                }
            });
        });

        imageSelector($form, options);

        formElement.initWidget($form);

        bgImage.setupImage(widget);

        //init data change callbacks
        bgImage.setChangeCallbacks(
            widget,
            formElement,
            formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', { updateCardinality: false })
        );
    };

    return GraphicOrderInteractionStateQuestion;
});
