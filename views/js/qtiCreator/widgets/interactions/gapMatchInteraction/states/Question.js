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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/textWrapper',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger'
], function(
    $,
    _,
    stateFactory,
    Question,
    htmlEditor,
    gridContentHelper,
    formElement,
    htmlContentHelper,
    textWrapper,
    formTpl,
    gapTpl,
    toolbarTpl
){
    'use strict';

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function(){
        this.buildEditor();
        //ensure that the cardinality of the interaction response is consistent with thte number of gaps
        this.syncCardinality();
        this.preventSingleChoiceDeletion();

    }, function(){

        this.destroyTextWrapper();
        this.destroyEditor();

        this.widget.offEvents('question');
    });

    GapMatchInteractionStateQuestion.prototype.buildEditor = function(){

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
            self.initTextWrapper();

            //hack : prevent ckeditor from removing empty spans
            $container.find('.gapmatch-content').html('...');

            //create editor
            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent : false,
                change : gridContentHelper.getChangeCallbackForBlockStatic(container),
                data : {
                    container : container,
                    widget : _widget
                }
            });

            //restore gaps
            $container.find('.gapmatch-content').empty();
        }
    };

    GapMatchInteractionStateQuestion.prototype.destroyEditor = function(){

        var $container = this.widget.$container,
            $flowContainer = $container.find('.qti-flow-container');

        //hack : prevent ckeditor from removing empty spans
        $container.find('.gapmatch-content').html('...');

        //search and destroy the editor
        htmlEditor.destroyEditor($flowContainer);

        //restore gaps
        $container.find('.gapmatch-content').empty();

        //remove toolbar
        $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]').remove();
    };

    GapMatchInteractionStateQuestion.prototype.initTextWrapper = function(){

        var widget = this.widget,
            interaction = widget.element,
            $editable = widget.$container.find('.qti-flow-container [data-html-editable]'),
            gapModel = this.getGapModel(),
            $gapTlb = $(gapModel.toolbarTpl()).show();

        $gapTlb.on('mousedown', function(e){
            var $wrapper = $gapTlb.parent(),
                text = $wrapper.text().trim();

            e.stopPropagation();//prevent rewrapping

            //detach it from the DOM for another usage in the next future
            $gapTlb.detach();

            //create gap:
            $wrapper
                .removeAttr('id')
                .addClass('widget-box')
                .attr('data-new', true)
                .attr('data-qti-class', gapModel.qtiClass);

            textWrapper.destroy($editable);

            htmlContentHelper.createElements(interaction.getBody(), $editable, htmlEditor.getData($editable), function(newGapWidget){

                newGapWidget.changeState('question');
                textWrapper.create($editable);
                gapModel.afterCreate(widget, newGapWidget, _.escape(text));
            });

        }).on('mouseup', function(e){
            e.stopPropagation();//prevent rewrapping
        });

        //init text wrapper:
        $editable.on('editorready.wrapper', function(){
            textWrapper.create($(this));
        }).on('wrapped.wrapper', function(e, $wrapper){
            $wrapper.append($gapTlb);
        }).on('beforeunwrap.wrapper', function(){
            $gapTlb.detach();
        });
    };

    GapMatchInteractionStateQuestion.prototype.destroyTextWrapper = function(){

        //destroy text wrapper:
        var $editable = this.widget.$container.find('.qti-flow-container [data-html-editable]');
        textWrapper.destroy($editable);
        $editable.off('.wrapper');

    };

    GapMatchInteractionStateQuestion.prototype.getGapModel = function(){

        return {
            toolbarTpl : gapTpl,
            qtiClass : 'gap',
            afterCreate : function afterCreate(interactionWidget, newGapWidget, text){
                var choice,
                    choiceWidget;

                //after the gap is created, delete it
                choice = interactionWidget.element.createChoice(text);
                interactionWidget.$container.find('.choice-area .add-option').before(choice.render());
                choice.postRender();
                choiceWidget = choice.data('widget');
                choiceWidget.changeState('question');
                newGapWidget.changeState('choice');
            }
        };
    };

    // ===============================================================

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
            shuffle : !!interaction.attr('shuffle')
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

            _.each(interaction.getChoices(), function(choice){
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
