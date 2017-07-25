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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(_, $, __, ckEditor, stateFactory, Active, htmlEditor, contentHelper){
    'use strict';

    var $tablePropTrigger;

    var TableStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TableStateActive.prototype.buildEditor = function(){

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable="true"]');

        $editableContainer.attr('data-html-editable-container', true);

        window.CKEDITOR.dtd.$editable.table = 1; //fixme: why is this still needed ?

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : contentHelper.getChangeCallback(container),
                data : {
                    container : container,
                    widget : _widget
                },
                blur : function(){
                    _widget.changeState('sleep');
                },
                hideTriggerOnBlur: true
            });
        }

        $tablePropTrigger = $editableContainer.find('[data-role="cke-table-properties"]');

        $editable.on('editorready', function(event, editor) {
            $tablePropTrigger.on('mousedown.table-widget', function(e){
                var cmd = editor.getCommand('taoqtitableProperties');
                cmd.setState(1); //fixme: can we do better?!
                e.stopPropagation();
                editor.execCommand('taoqtitableProperties', { test: 'data parameter' });
            });

        });
    };

    TableStateActive.prototype.destroyEditor = function(){
        var _widget = this.widget,
            $editableContainer = _widget.$container;

        //search and destroy the editor
        htmlEditor.destroyEditor($editableContainer);
    };

    return TableStateActive;
});