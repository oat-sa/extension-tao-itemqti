/**
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/feedback',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
    'taoQtiItem/qtiCreator/model/choices/GapText',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'services/features'
], function(
    $,
    _,
    __,
    feedback,
    stateFactory,
    Question,
    htmlEditor,
    gridContentHelper,
    formElement,
    htmlContentHelper,
    selectionWrapper,
    Choice,
    formTpl,
    newGapTpl,
    toolbarTpl,
    features
){
    'use strict';

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function init(){
        this.buildEditor();
        //ensure that the cardinality of the interaction response is consistent with thte number of gaps
        this.syncCardinality();
        this.preventSingleChoiceDeletion();

    }, function exit(){
        this.destroyEditor();
        this.widget.offEvents('question');
    });

    GapMatchInteractionStateQuestion.prototype.buildEditor = function buildEditor(){

        var self = this,
            _widget = this.widget,
            container = _widget.element.getBody(),
            $container = _widget.$container,
            $editableContainer = $container.find('.qti-flow-container'),
            $bodyTlb;

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){
            $bodyTlb = $(toolbarTpl({
                serial : _widget.serial,
                state : 'question'
            }));

            //add toolbar once only:
            $editableContainer.append($bodyTlb);
            $bodyTlb.show();

            //init text wrapper
            self.initGapCreator();

            //hack : prevent ckeditor from removing empty spans
            $container.find('.gapmatch-content').html('...');

            //create editor
            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent : false,
                change : gridContentHelper.getChangeCallbackForBlockStatic(container),
                data : {
                    container : container,
                    widget : _widget
                },
                qtiInclude: false,
                flushDeletingWidgetsOnDestroy: true
            });

            //restore gaps
            $container.find('.gapmatch-content').empty();
        }
    };

    GapMatchInteractionStateQuestion.prototype.destroyEditor = function destroyEditor(){

        var $container = this.widget.$container,
            $flowContainer = $container.find('.qti-flow-container'),
            $editable = $container.find('.qti-flow-container [data-html-editable]');

        //hack : prevent ckeditor from removing empty spans
        $container.find('.gapmatch-content').html('...');

        //search and destroy the editor
        htmlEditor.destroyEditor($flowContainer);

        //restore gaps
        $container.find('.gapmatch-content').empty();

        //remove toolbar
        $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]').remove();

        //remove listeners
        $editable.off('gapcreator');
    };

    GapMatchInteractionStateQuestion.prototype.initGapCreator = function initGapCreator(){

        var self = this,
            interactionWidget   = this.widget,

            $editable           = interactionWidget.$container.find('.qti-flow-container [data-html-editable]'),
            $flowContainer      = interactionWidget.$container.find('.qti-flow-container'),
            $toolbar            = $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]'),
            $newGapBtn          = $(newGapTpl()),
            $newGap             = $('<span>', {
                class: 'widget-box',
                'data-new': true,
                'data-qti-class': 'gap'
            }),

            wrapper = selectionWrapper({
                $container: $editable,
                allowQtiElements: false
            });

        $toolbar.append($newGapBtn);
        $newGapBtn.hide();

        $editable
            .on('mouseup.gapcreator', function() {
                if (wrapper.canWrap()) {
                    $newGapBtn.show();
                } else {
                    $newGapBtn.hide();
                }
            })
            .on('blur.gapcreator', function() {
                $newGapBtn.hide();
            });

        $newGapBtn.on('mousedown.gapcreator', function() {
            $newGapBtn.hide();
            if (wrapper.wrapWith($newGap)) {
                self.createChoiceFromSelection($newGap);
                self.replaceSelectionWithGap();
            } else {
                feedback().error(__('Cannot create gap from this selection. Please check that you do not have partially selected elements.'));
            }
        });
    };

    GapMatchInteractionStateQuestion.prototype.createChoiceFromSelection = function createChoiceFromSelection($newChoiceContent) {
        var interactionWidget = this.widget,
            interaction = interactionWidget.element,

            $addChoiceBtn = interactionWidget.$container.find('.choice-area .add-option'),

            $nestedWidgets,
            nestedElts,

            newChoiceElt,
            newChoiceBody,
            newChoiceWidget,

            serial,

            qtiEltsRegexp = /{{(\w+?)}}/gm;

        // look for nested elements by searching for their widgets in the markup
        $nestedWidgets = $newChoiceContent.find('[class^="widget-"],[class*=" widget-"]');

        // Create the new choice body: we replace any widget in the markup by its element placeholder
        if($nestedWidgets && $nestedWidgets.length > 0) {
            $nestedWidgets.each(function() {
                var eltSerial = $(this).data('serial'),
                    elt = interaction.getElement(eltSerial),
                    eltWidget = elt.data('widget');

                $(this).replaceWith(elt.placeholder());
                eltWidget.destroy();
            });
        }

        newChoiceBody = $newChoiceContent.html();
        newChoiceElt = interaction.createChoice(newChoiceBody);

        // update interaction model:
        // the nested elements are moved from the interaction body to the new choice body
        while ((nestedElts = qtiEltsRegexp.exec(newChoiceBody)) !== null) {
            serial = nestedElts[1];
            newChoiceElt.setElement(interaction.getElement(serial));
            interaction.removeElement(serial);
        }

        // Finally we render the new choice as the last choice in the list and rebuild its widget in the correct state
        $addChoiceBtn.before(newChoiceElt.render());

        newChoiceElt.postRender();
        newChoiceWidget = newChoiceElt.data('widget');
        newChoiceWidget.changeState('choice');

    };

    GapMatchInteractionStateQuestion.prototype.replaceSelectionWithGap = function replaceSelectionWithGap() {
        var interactionWidget = this.widget,
            interaction = interactionWidget.element,

            $editable = interactionWidget.$container.find('.qti-flow-container [data-html-editable]'),
            newGapElt;

        htmlContentHelper.createElements(interaction.getBody(), $editable, htmlEditor.getData($editable), function (newGapWidget) {

            // update model and render it inline
            newGapElt = newGapWidget.element;
            newGapElt.render(newGapElt.getContainer());
            newGapElt.postRender();

            interaction.setElement(newGapElt);

            // recreate editing widget
            newGapWidget.destroy();
            newGapWidget = newGapElt.data('widget');
            newGapWidget.changeState('choice');
        });
    };

    GapMatchInteractionStateQuestion.prototype.syncCardinality = function(){

        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration();

        var updateCardinality = function(data){

            var cardinality,
                choice = data.element || data.choice;

            if(choice.qtiClass === 'gap'){
                cardinality = _.size(interaction.getGaps()) === 1 ? 'single' : 'multiple';
                response.attr('cardinality', cardinality);
            }
        };

        this.widget
            .on('elementCreated', updateCardinality)
            .on('deleted', updateCardinality);
    };

    GapMatchInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/gapMatch/property/shuffle')
            }
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, interaction, {
            shuffle : formElement.getAttributeChangeCallback()
        });

    };

    GapMatchInteractionStateQuestion.prototype.preventSingleChoiceDeletion = function(){

        var interaction = this.widget.element,
            $container = this.widget.$container;

        var _toggleDeleteButtonVisibility = function(){

            var choiceCount = 0,
                $deleteButtons = $container.find('.choice-area .qti-choice [data-role=delete]');

            _.forEach(interaction.getChoices(), function(choice){
                if(!choice.data('deleting')){
                    choiceCount++;
                }
            });

            if(choiceCount <= 1){
                $deleteButtons.hide();
            }else{
                $deleteButtons.show();
            }
        };

        _toggleDeleteButtonVisibility();

        this.widget
            .on('deleted', _toggleDeleteButtonVisibility)
            .on('choiceCreated', _toggleDeleteButtonVisibility);

        this.widget.afterStateInit(function(e, element, state){
            if(state.name === 'deleting' && element.is('gapText')){
                _toggleDeleteButtonVisibility();
            }
        }, 'question');

        this.widget.afterStateExit(function(e, element, state){
            if(state.name === 'deleting' && element.is('gapText')){
                _toggleDeleteButtonVisibility();
            }
        }, 'question');

    };

    return GapMatchInteractionStateQuestion;
});
