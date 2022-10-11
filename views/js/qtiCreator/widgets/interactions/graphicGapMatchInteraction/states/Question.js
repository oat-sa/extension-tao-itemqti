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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
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
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',

    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/resourceManager',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage',
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
    resourceManager,
    bgImage
) {
    "use strict";

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

        createGapImgAddOption();

        // stop the question mode on resize to keep the coordinate system coherent,
        // even in responsive (the side bar behaves weirdly)
        $(window).on('resize.changestate', function () {
            widget.changeState('sleep');
        });



        /**
         * Create the 'add option' button
         */
        function createGapImgAddOption() {
            const $gapList = $('ul.source', widget.$original);
            const $addOption =
                $('<li class="empty add-option">' +
                    '<div><span class="icon-add"></span></div>' +
                    '</li>');

            $addOption.on('click', function () {
                let gapImgObj = interaction.createGapImg({});
                gapImgObj.object.removeAttr('type');

                // on successful upload
                $addOption.on('selected.upload', function (e, args) {

                    $addOption.off('selected.upload');

                    const size = args.size;
                    let height,
                        width;

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
                resourceManager($addOption, gapImgSelectorOptions);

            });
            $addOption.appendTo($gapList);
        }


        /**
         * Insert and setup the gap image
         *
         * @param gapImgObj
         */
        function setUpGapImg(gapImgObj) {

            const $gapList = $('ul.source', widget.$original),
                $addOption = $('.empty', $gapList),
                $deleteBtn = $(mediaTlbTpl());
            let $gapImgBox = $(`[data-serial="${gapImgObj.serial}"]`, $gapList);

            if (!$gapImgBox.length) {
                $gapImgBox = $(gapImgObj.render()).insertBefore($addOption);
            }

            //manage gap deletion
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

            $gapImgBox.off('click').on('click', function () {
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
                    min : {
                        fieldName:   'matchMin',
                        value:       _.parseInt(choice.attr('matchMin')) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max : {
                        fieldName:   'matchMax',
                        value:       _.parseInt(choice.attr('matchMax')) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold :  _.size(interaction.getChoices()),
                }).on('render', function(){
                    var self = this;

                    //the range matches the number of choices
                    widget.on('choiceCreated choiceDeleted', function(data){
                        if(data.interaction.serial === interaction.serial){
                            self.updateThresholds(1, _.size(interaction.getChoices()));
                        }
                    });
                    // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                    widget.infinityMatchMax('hotspot', choice);
                }).on('change', function () {
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
        function leaveChoiceForm() {
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

                $choiceForm.empty().html(gapImgFormTpl({
                    identifier: gapImg.id(),
                    fixed: gapImg.attr('fixed'),
                    serial: serial,
                    baseUrl: options.baseUrl,
                    data: gapImg.object.attr('data'),
                    width: gapImg.object.attr('width'),
                    height: gapImg.object.attr('height'),
                    type: gapImg.object.attr('type')
                }));

                //controls the match min/max for the gap images
                minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                    min : {
                        fieldName:   'matchMin',
                        value:       _.parseInt(gapImg.attr('matchMin')) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max : {
                        fieldName:   'matchMax',
                        value:       _.parseInt(gapImg.attr('matchMax')) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold :  _.size(interaction.getChoices()),
                }).on('render', function(){
                    var self = this;

                    //the range is matching the number of choices (not the number of gap img)
                    widget.on('choiceCreated choiceDeleted', function(data){
                        if(data.interaction.serial === interaction.serial){
                            self.updateThresholds(1, _.size(interaction.getChoices()));
                        }
                    });
                    // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                    widget.infinityMatchMax('gapImg', gapImg);
                }).on('change', function () {
                    // display warning message in case matchMax is set to 0 (infinite) and pair is higher that 0
                    widget.infinityMatchMax('gapImg', gapImg);
                });

                // <li/> that will contain the image
                $gapImgBox = $(`li[data-serial="${  gapImg.serial  }"]`);

                $gapImgElem = $gapImgBox.find('img');

                //init media sizer
                $mediaSizer = $choiceForm.find('.media-sizer-panel')
                    .on('create.mediasizer', function(e, params) {
                        // On creation, mediasizer uses style properties to set
                        // width and height, but our image needs to use the
                        // it's attributes to set and resize properly.
                        params.width = $gapImgElem.attr('width');
                        params.height = $gapImgElem.attr('height');
                        applyMediasizerValues(params, widget.$original.data('factor'), $gapImgElem.get(0).naturalHeight, $gapImgElem.get(0).naturalWidth);
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
                $mediaSizer.on('sizechange.mediasizer', function(e, params) {
                    applyMediasizerValues(params, widget.$original.data('factor'), $gapImgElem.get(0).naturalHeight, $gapImgElem.get(0).naturalWidth);

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
     * Exit the question state, leave the room cleaned up
     */
    function exitQuestionState() {
        var widget = this.widget;
        var interaction = widget.element;
        var paper = interaction.paper;
        var valid = !!interaction.object.attr('data') && !_.isEmpty(interaction.choices);

        widget.isValid('graphicGapMatchInteraction', valid);

        if (!paper) {
            return;
        }


        $(window).off('resize.changestate');

        if (widget._editor) {
            widget._editor.destroy();
        }

        //remove gapImg placeholder
        $('ul.source .empty', widget.$original).remove();

        //restore gapImg appearance
        widget.$container.find('.qti-gapImg').removeClass('active')
            .find('.mini-tlb').remove();
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

        $form.html(formTpl({
            baseUrl: options.baseUrl,
            data: interaction.object.attr('data'),
            width: interaction.object.attr('width'),
            height: interaction.object.attr('height'),
            type: interaction.object.attr('type')
        }));

        imageSelector($form, options);

        formElement.initWidget($form);

        bgImage.setupImage(widget);

        bgImage.setChangeCallbacks(
            widget,
            formElement
        );
    };

    return GraphicGapMatchInteractionStateQuestion;
});
