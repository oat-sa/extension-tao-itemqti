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
    'i18n',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/graphicAssociate',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/associableHotspot',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage'
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

                //controls matchMin and matchMax attributes
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
                }).on('render', function () {
                    widget.on('choiceCreated choiceDeleted', data => {
                        if (data.interaction.serial === interaction.serial) {
                            this.updateThresholds(1, _.size(interaction.getChoices()));
                        }
                    });
                });

                formElement.initWidget($choiceForm);

                //init data validation and binding
                const callbacks = formElement.getMinMaxAttributeCallbacks('matchMin', 'matchMax');
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

        widget.isValid('graphicAssociateInteraction', valid);

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
     * The question state for the graphicAssociate interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Question
     */
    const GraphicAssociateInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    GraphicAssociateInteractionStateQuestion.prototype.initForm = function initForm() {
        const widget = this.widget;
        const options = widget.options;
        const interaction = widget.element;
        const $form = widget.$form;

        /**
         * Get the maximum number of pairs regarding the number of choices: f(n) = n(n-1)/2
         * @param {Number} choices - the number of choices
         * @returns {Number} the number of possible pairs
         */
        const getMaxPairs = function getMaxPairs(choices) {
            const pairs = 0;
            if (choices > 0) {
                return Math.round((choices * (choices - 1)) / 2);
            }
            return pairs;
        };

        $form.html(
            formTpl({
                baseUrl: options.baseUrl,
                data: interaction.object.attr('data'),
                width: interaction.object.attr('width'),
                height: interaction.object.attr('height'),
                type: interaction.object.attr('type')
            })
        );

        //controls min and max association
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min: {
                fieldName: 'minAssociations',
                value: _.parseInt(interaction.attr('minAssociations')) || 0,
                helpMessage: __('The minimum number of associations that the candidate is required to make to form a valid response.')
            },
            max: {
                fieldName: 'maxAssociations',
                value: _.parseInt(interaction.attr('maxAssociations')) || 0,
                helpMessage: __('The maximum number of associations that the candidate is allowed to make.')
            },
            upperThreshold: getMaxPairs(_.size(interaction.getChoices()))
        }).on('render', function () {
            //the range is based on the number of possible associations
            widget.on('choiceCreated choiceDeleted', data => {
                if (data.interaction.serial === interaction.serial) {
                    this.updateThresholds(1, getMaxPairs(_.size(interaction.getChoices())));
                }
            });
        });

        imageSelector($form, options);

        formElement.initWidget($form);

        bgImage.setupImage(widget);

        bgImage.setChangeCallbacks(
            widget,
            formElement,
            formElement.getMinMaxAttributeCallbacks('minAssociations', 'maxAssociations')
        );
    };

    return GraphicAssociateInteractionStateQuestion;
});
