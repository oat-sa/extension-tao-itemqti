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
 * Copyright (c) 2014-2017 Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.content',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function ($, stateFactory, QuestionState, contentToolbarTpl, formElement, htmlEditor, contentHelper) {
    'use strict';

    var SimpleAssociableChoiceStateQuestion = stateFactory.extend(QuestionState, function () {
        this.buildEditor();
    }, function () {
        this.destroyEditor();
    });

    SimpleAssociableChoiceStateQuestion.prototype.createToolbar = function () {

        var _widget = this.widget,
            $container = _widget.$container,
            choice = _widget.element,
            interaction,
            $toolbar = $container.find('.mini-tlb').not('[data-html-editable] *');

        if (!$toolbar.length) {

            interaction = choice.getInteraction();

            //add mini toolbars
            $toolbar = $(contentToolbarTpl({
                choiceSerial: choice.getSerial(),
                interactionSerial: interaction.getSerial(),
                fixed: choice.attr('fixed'),
                interactionShuffle: interaction.attr('shuffle')
            }));

            $container.children('.inner-wrapper').append($toolbar);

            //set toolbar button behaviour:
            formElement.initShufflePinToggle(_widget);
            formElement.initDelete(_widget);
        }

        return $toolbar;
    };

    SimpleAssociableChoiceStateQuestion.prototype.buildEditor = function () {

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container;

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {

            htmlEditor.buildEditor($editableContainer, {
                change: contentHelper.getChangeCallback(container),
                data: {
                    container: container,
                    widget: _widget
                }
            });
        }
    };

    SimpleAssociableChoiceStateQuestion.prototype.destroyEditor = function () {

        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return SimpleAssociableChoiceStateQuestion;
});
