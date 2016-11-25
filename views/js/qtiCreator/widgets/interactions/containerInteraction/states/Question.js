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
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/textWrapper',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger'
], function(_, $, stateFactory, Question, htmlEditor, gridContentHelper, htmlContentHelper, textWrapper, toolbarTpl){

    'use strict';

    var ContainerInteractionStateQuestion = stateFactory.extend(Question, function(){

        this.buildEditor();

    }, function(){

        this.destroyTextWrapper();
        this.destroyEditor();
    });

    ContainerInteractionStateQuestion.prototype.buildEditor = function(){

        var _this = this,
            _widget = this.widget,
            container = _widget.element.getBody(),
            $container = _widget.$container,
            $editableContainer = $container.find('.qti-flow-container');

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            var $bodyTlb = $(toolbarTpl({
                serial : _widget.serial,
                state : 'question'
            }));

            //add toolbar once only:
            $editableContainer.append($bodyTlb);
            $bodyTlb.show();

            //init text wrapper
            _this.initTextWrapper();

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

    ContainerInteractionStateQuestion.prototype.destroyEditor = function(){

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

    ContainerInteractionStateQuestion.prototype.initTextWrapper = function(){

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

                var allowedInlineStaticElts = {
                        hottext: ['.widget-math'] //todo: try more // supported inline static elements inside hottext / gapmatchz
                    },
                    $inlineStaticWidgets,
                    inlineStaticElts = [],
                    $renderPlaceholder = $('<span>')
                        .addClass('widget-box')
                        .attr('data-new', true),
                    newEl = newGapWidget.element,
                    newBody,
                    newMarkup;

                newGapWidget.changeState('question');
                textWrapper.create($editable);

                // look for nested inlineStatic elements
                if (allowedInlineStaticElts[gapModel.qtiClass]) {
                    $inlineStaticWidgets = $initialContent.find(
                        //todo: improve selectors
                        allowedInlineStaticElts[gapModel.qtiClass].join(',')
                    );
                }

                // build new model structure & body
                if($inlineStaticWidgets && $inlineStaticWidgets.length > 0) {
                    $inlineStaticWidgets.each(function() {
                        var serial = $(this).data('serial');
                        // get inline element from container
                        var elt = interaction.getBody().elements[serial];
                        // move it to its new parent
                        newEl.getBody().elements[serial] = elt;
                        // replace the widget markup with corresponding element placeholder
                        $(this).replaceWith(elt.placeholder());

                        inlineStaticElts.push(elt);
                    });
                }
                // strip everything that hasn't been replaced and that is not pure text
                newBody = _.escape($initialContent.text().trim());
                newEl.body(newBody); // update model

                // build the new markup, by replacing elements placeholders with empty html nodes
                newMarkup = newBody;
                inlineStaticElts.forEach(function (elt) {
                    var serial = elt.placeholder(),
                        $tmpPlaceholder = $renderPlaceholder.clone()
                            .attr('data-serial', elt.serial)
                            .attr('data-qti-class', elt.qtiClass);

                    newMarkup = newMarkup.replace(serial, $('<div>').append($tmpPlaceholder).html());
                });
                //todo: move me !
                newGapWidget.$container.find('.hottext-content').html(newMarkup); // update markup
                //todo: I should go there... this should be restored for compatibility with gapmatch
                // gapModel.afterCreate(widget, newGapWidget, _.escape(text));

                // render the inline elements in the empty nodes, but without postRendering,
                // so we do not create qtiCreator widgets
                inlineStaticElts.forEach(function (elt) {
                    $renderPlaceholder = newGapWidget.$container.find('[data-serial="' + elt.serial + '"]');
                    elt.render($renderPlaceholder);
                });

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

    ContainerInteractionStateQuestion.prototype.destroyTextWrapper = function(){

        //destroy text wrapper:
        var $editable = this.widget.$container.find('.qti-flow-container [data-html-editable]');
        textWrapper.destroy($editable);
        $editable.off('.wrapper');

    };

    ContainerInteractionStateQuestion.prototype.getGapModel = function(){

        this.throwMissingRequiredImplementationError('getModel');
    };

    return ContainerInteractionStateQuestion;
});