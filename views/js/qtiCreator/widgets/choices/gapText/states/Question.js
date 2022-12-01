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
    'lodash',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function ($, _, CKEditor, stateFactory, Question, Element, htmlEditor, contentHelper) {
    'use strict';

    const GapTextStateQuestion = stateFactory.extend(
        Question,
        function () {
            this.buildEditor();
        },
        function () {
            this.destroyEditor();
        }
    );

    GapTextStateQuestion.prototype.initForm = _.noop();

    GapTextStateQuestion.prototype.buildEditor = function () {
        const _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container;

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {
            htmlEditor.buildEditor($editableContainer, {
                change: contentHelper.getChangeCallback(container),
                data: {
                    container: container,
                    widget: _widget
                },
                toolbar: [
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Subscript', 'Superscript']
                    },
                    {
                        name: 'insert',
                        items: ['SpecialChar']
                    },
                    {
                        name: 'language',
                        items: ['Language']
                    }
                ],
                qtiMedia: false,
                qtiInclude: false,
                enterMode: CKEditor.ENTER_BR,
                furiganaPlugin: true
            });
        }

        $editableContainer.on('keypress.qti-widget', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                $(this).blur();
            }
        });
    };

    GapTextStateQuestion.prototype.destroyEditor = function () {
        const _widget = this.widget,
            interaction = _widget.interaction,
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable]');

        if (!htmlEditor.hasEditor($editableContainer)) {
            return;
        }

        /**
         * Workaround for ckEditor. When adding text to an empty choice, when initialising the widget on an empty content,
         * ck automatically wraps it in a <p>, which breaks QTI compatibility.
         * Therefore, we replace an empty choice with a placeholder text.
         */
        if ($editable.data('editor')) {
            if (!htmlEditor.getData($editable) || htmlEditor.getData($editable) === '') {
                const placeholder = interaction.getNextPlaceholder();
                htmlEditor.setData($editable, placeholder);
            }
        }

        $editableContainer.off('.qti-widget');

        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return GapTextStateQuestion;
});
