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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
    'lodash'
], function ($, stateFactory, QuestionState, formElement, _) {
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
        formElement.initShufflePinToggle(_widget);
        formElement.initDelete(_widget);

        return $toolbar;
    };

    ChoiceStateQuestion.prototype.buildEditor = function () {
        const _widget = this.widget;

        _widget.$container
            .find('.editable-content')
            .attr('contentEditable', true)
            .on(
                'keyup.qti-widget',
                _.throttle(function () {
                    //update model
                    _widget.element.val(_.escape($(this).text()));

                    //update placeholder
                    _widget.$original.width($(this).width());
                }, 200)
            )
            .on('focus.qti-widget', function () {
                _widget.changeState('choice');
            })
            .on('keypress.qti-widget', function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    $(this).blur();
                    _widget.changeState('question');
                }
            })
            .on('input.qti-widget', function (e) {
                if (e.originalEvent.inputType === 'insertFromPaste') {
                    // calculate offset for cursor
                    let offset;
                    if (window.getSelection) {
                        const range = window.getSelection().getRangeAt(0);
                        // new range from div start up to pasted text
                        const preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(this);
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        offset = preCaretRange.toString().length;
                    }
                    // clean format of paste text
                    $(this).html($(this).text());
                    // set cursor after inserted text
                    if (offset) {
                        const range = document.createRange();
                        const sel = window.getSelection();
                        range.setStart(this.childNodes[0], offset);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            });
    };

    ChoiceStateQuestion.prototype.destroyEditor = function () {
        this.widget.$container.find('.editable-content')
            .removeAttr('contentEditable')
            .off('keyup.qti-widget');
    };

    return ChoiceStateQuestion;
});
