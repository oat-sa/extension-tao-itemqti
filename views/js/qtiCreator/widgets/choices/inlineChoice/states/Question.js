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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'jquery',
    'lodash',
    'ckeditor',
    'services/features',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function ($, _, CKEditor, features, stateFactory, QuestionState, formElement, htmlEditor, contentHelper) {
    'use strict';
    const ChoiceStateQuestion = stateFactory.extend(
        QuestionState,
        function initStateQuestion() {
            this.buildEditor();
        },
        function exitStateQuestion() {
            this.destroyEditor();
        }
    );

    ChoiceStateQuestion.prototype.createToolbar = function () {
        const _widget = this.widget,
            $toolbar = _widget.$container.find('td:last');

        //set toolbar button behaviour:
        if(features.isVisible('taoQtiItem/creator/interaction/inlineChoice/property/shuffle')) {
            formElement.initShufflePinToggle(_widget);
        }

        formElement.initDelete(_widget);

        return $toolbar;
    };

    ChoiceStateQuestion.prototype.buildEditor = function () {
        const _widget = this.widget,
            container = _widget.element.getBody(),
            $editable = _widget.$container.find('.editable-content'),
            $editableContainer = _widget.$container.find('.editable-container');

        $editableContainer.attr('data-html-editable-container', true);
        $editable.attr('data-html-editable', true).attr('contenteditable', true);

        if (!htmlEditor.hasEditor($editableContainer)) {
            htmlEditor.buildEditor($editableContainer, {
                change: contentHelper.getChangeCallback(container),
                data: {
                    container,
                    widget: _widget
                },
                toolbar: [
                    {
                        name: 'insert',
                        items: ['SpecialChar']
                    }
                ],
                qtiMedia: false,
                qtiImage: false,
                qtiInclude: false,
                enterMode: CKEditor.ENTER_BR,
                shieldInnerContent: false,
                mathJax: false,
                furiganaPlugin: true
            });
        }

        $editable
            .on('focus.qti-widget', function () {
                _widget.changeState('choice');
            })
            .on('keypress.qti-widget', function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    $(this).blur();
                    _widget.changeState('question');
                }
            });
    };

    ChoiceStateQuestion.prototype.destroyEditor = function () {
        this.widget.$container
            .find('.editable-content')
            .removeAttr('contenteditable')
            .removeAttr('data-html-editable')
            .off('keyup.qti-widget');

        this.widget.$container.find('.editable-container').removeAttr('data-html-editable');
    };

    return ChoiceStateQuestion;
});
