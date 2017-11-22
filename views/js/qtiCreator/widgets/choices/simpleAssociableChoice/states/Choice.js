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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/simpleAssociableChoice',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(stateFactory, Choice, formTpl, formElement, identifierHelper, htmlEditor, contentHelper){
    'use strict';

    var SimpleAssociableChoiceStateChoice = stateFactory.extend(Choice, function () {
        this.buildEditor();
    }, function () {
        this.destroyEditor();
    });

    SimpleAssociableChoiceStateChoice.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            choice = _widget.element,
            callbacks;

        //build form:
        $form.html(formTpl({
            serial : choice.getSerial(),
            identifier : choice.id(),
            matchMin : choice.attr('matchMin'),
            matchMax : choice.attr('matchMax')
        }));

        formElement.initWidget($form);

        //init data validation and binding
        callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'matchMin', 'matchMax');
        callbacks.identifier = identifierHelper.updateChoiceIdentifier;
        formElement.setChangeCallbacks($form, choice, callbacks);
    };

    SimpleAssociableChoiceStateChoice.prototype.buildEditor = function () {

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

    SimpleAssociableChoiceStateChoice.prototype.destroyEditor = function () {

        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return SimpleAssociableChoiceStateChoice;
});
