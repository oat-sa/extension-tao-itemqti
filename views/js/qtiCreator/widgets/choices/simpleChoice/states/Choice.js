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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/choice',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(stateFactory, Choice, formTpl, formElement, identifierHelper, htmlEditor, contentHelper){
    'use strict';

    var SimpleChoiceStateChoice = stateFactory.extend(Choice, function(){
        this.buildEditor();
    }, function(){
        this.destroyEditor();
    });

    SimpleChoiceStateChoice.prototype.initForm = function(){

        var _widget = this.widget;

        //build form:
        _widget.$form.html(formTpl({
            serial : _widget.element.getSerial(),
            identifier : _widget.element.id()
        }));

        formElement.initWidget(_widget.$form);

        //init data validation and binding
        formElement.setChangeCallbacks(_widget.$form, _widget.element, {
            identifier : identifierHelper.updateChoiceIdentifier
        });
    };

    SimpleChoiceStateChoice.prototype.buildEditor = function(){

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container;

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : contentHelper.getChangeCallback(container),
                data : {
                    container : container,
                    widget : _widget
                }
            });
        }
    };

    SimpleChoiceStateChoice.prototype.destroyEditor = function(){
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };


    return SimpleChoiceStateChoice;
});