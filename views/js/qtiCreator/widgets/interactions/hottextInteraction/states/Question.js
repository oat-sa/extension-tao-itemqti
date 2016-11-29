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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hottext',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create'
], function(
    $,
    _,
    stateFactory,
    Question,
    htmlEditor,
    gridContentHelper,
    formElement,
    interactionFormElement,
    selectionWrapper,
    formTpl,
    toolbarTpl,
    hottextTpl
){
    'use strict';

    var HottextInteractionStateQuestion = stateFactory.extend(Question, function(){
        this.buildEditor();
    }, function(){
        this.destroyEditor();
    });

    HottextInteractionStateQuestion.prototype.buildEditor = function(){

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

            //create editor
            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent : false,
                change : gridContentHelper.getChangeCallbackForBlockStatic(container),
                data : {
                    container : container,
                    widget : _widget
                }
            });
        }
    };

    HottextInteractionStateQuestion.prototype.destroyEditor = function(){
        var $container = this.widget.$container,
            $flowContainer = $container.find('.qti-flow-container');

        //search and destroy the editor
        htmlEditor.destroyEditor($flowContainer);

        //remove toolbar
        $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]').remove();
    };

    /**
     *
     */
    HottextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            callbacks;

        $form.html(formTpl({
            maxChoices : interaction.attr('maxChoices'),
            minChoices : interaction.attr('minChoices'),
            choicesCount : _.size(interaction.getChoices())
        }));

        formElement.initWidget($form);

        callbacks = formElement.getMinMaxAttributeCallbacks($form, 'minChoices', 'maxChoices');
        formElement.setChangeCallbacks($form, interaction, callbacks);
        interactionFormElement.syncMaxChoices(_widget);
    };

    /**
     *
     */
    HottextInteractionStateQuestion.prototype.initTextWrapper = function(){
        console.log('initTextWrapper');
/*
        var widget = this.widget,
            interaction = widget.element,
            $editable = widget.$container.find('.qti-flow-container [data-html-editable]'),
            gapModel = this.getGapModel(),
            $gapTlb = $(gapModel.toolbarTpl()).show();

        $gapTlb.on('mousedown', function(e){
            var $wrapper = $gapTlb.parent(),
                $initialContent = $wrapper.clone();

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
                gapModel.afterCreate(widget, newGapWidget, $initialContent);
            });

        }).on('mouseup', function(e){
            e.stopPropagation();//prevent rewrapping
        });

        //init text wrapper:
        $editable.on('editorready.wrapper', function(){
            textWrapper.create($(this));
        }).on('wrapped.wrapper', function(e, $wrapper){
            // if wrapped text already contains a toolbar, then we move it inside the selection to prevent overlapping toolbars
            if ($wrapper.find('.mini-tlb').length > 0) {
                $gapTlb.addClass('tlb-inside');
            } else {
                $gapTlb.removeClass('tlb-inside');
            }
            $wrapper.append($gapTlb);
        }).on('beforeunwrap.wrapper', function(){
            $gapTlb.detach();
            // console.log('unwrapping');
            // widget.$container = null;
            // widget = widget.refresh();
            // $editable = widget.$container.find('.qti-flow-container [data-html-editable]');
            // textWrapper.create($editable);
        });
        */
    };

    HottextInteractionStateQuestion.prototype.getGapModel = function(){

        return {
            toolbarTpl : hottextTpl,
            qtiClass : 'hottext',
            afterCreate : function(interactionWidget, newHottextWidget, $initialContent){
                var allowedInlineStaticElts = ['math'], // todo: try more !
                    $inlineStaticWidgets,
                    interaction = interactionWidget.element,
                    newHottextElt = newHottextWidget.element,
                    newHottextBody;

                // look for nested inlineStatic elements
                $inlineStaticWidgets = $initialContent.find(
                    allowedInlineStaticElts
                        .map(function(qtiClass) {
                            return '.widget-' + qtiClass;
                        })
                        .join(',')
                );

                // update elements hierarchy
                if($inlineStaticWidgets && $inlineStaticWidgets.length > 0) {
                    $inlineStaticWidgets.each(function() {
                        var serial = $(this).data('serial'),
                            elt = interaction.getElement(serial),
                            eltWidget = elt.data('widget');

                        // move element from interaction to hottext element
                        interaction.removeElement(elt);
                        newHottextElt.setElement(elt);

                        // destroy the widget and replace it with a placeholder that will be used for rendering
                        $(this).replaceWith(elt.placeholder());
                        eltWidget.destroy();
                    });
                }
                // strip everything that hasn't been replaced and that is not pure text
                newHottextBody = _.escape($initialContent.text());

                if (newHottextBody.trim() !== '') { // todo: check if we lost any check like this before creating elements
                    // update model and render it
                    newHottextElt.body(newHottextBody);
                    newHottextElt.render(newHottextElt.getContainer());
                    newHottextElt.postRender();

                    // recreate editing widget
                    newHottextWidget.destroy();
                    newHottextWidget = newHottextElt.data('widget');
                    newHottextWidget.changeState('choice');
                }
            }
        };
    };

    return HottextInteractionStateQuestion;
});
