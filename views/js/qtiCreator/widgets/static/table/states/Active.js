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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/widgets/static/table/components/tableActions',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(_, $, __, ckEditor, stateFactory, Active, tableActionsFactory, htmlEditor, contentHelper){
    'use strict';

    var colActions,
        rowActions;

    var TableStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TableStateActive.prototype.buildEditor = function(){
        var _widget   = this.widget,
            container = _widget.element.getBody(),

            $itemPanel          = _widget.getAreaBroker().getItemPanelArea(),
            $editableContainer  = _widget.$container,
            $editable           = $editableContainer.find('[data-html-editable="true"]'),
            $tablePropTrigger   = $editableContainer.find('[data-role="cke-table-properties"]');

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){
            htmlEditor.buildEditor($editableContainer, {
                placeholder: '',
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

        $editable
            .on('editorready.tableActive', function(event, editor) {
                $tablePropTrigger.on('click.tableActive', function openTableProperties(e){
                    e.stopPropagation();
                    editor.execCommand('taoqtitableProperties');
                });

                colActions = tableActionsFactory({ insertCol: true })
                    .on('delete', function() {
                        editor.execCommand('columnDelete');
                        hideTableActions();
                    })
                    .on('insertCol', function() {
                        editor.execCommand('columnInsertAfter');
                    })
                    .render($itemPanel)
                    .hide();

                rowActions = tableActionsFactory({ insertRow: true })
                    .on('delete', function() {
                        editor.execCommand('rowDelete');
                        hideTableActions();
                    })
                    .on('insertRow', function() {
                        editor.execCommand('rowInsertAfter');
                    })
                    .render($itemPanel)
                    .hide();

                $editableContainer.on('keyup.tableActive', displayTableActions.bind(this, editor, $editableContainer));
                $editableContainer.on('click.tableActive', displayTableActions.bind(this, editor, $editableContainer));
            })
            .on('editordestroyed.tableActive', function() {
                if ($tablePropTrigger.length) {
                    $tablePropTrigger.off('.tableActive');
                }
            });
    };

    TableStateActive.prototype.destroyEditor = function(){
        var _widget = this.widget,
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable="true"]');

        //search and destroy the editor
        $editableContainer.off('.tableActive');
        $editable.off('.tableActive');
        htmlEditor.destroyEditor($editableContainer);

        // destroy the actions toolbars
        if (colActions) {
            colActions.destroy();
            colActions = null;
        }

        if (rowActions) {
            rowActions.destroy();
            rowActions = null;
        }
    };


    function hideTableActions() {
        colActions.hide();
        rowActions.hide();
    }

    function displayTableActions(editor, $tableContainer) {
        var selection = editor.getSelection(),
            tabletools = window.CKEDITOR.plugins.tabletools,
            selectedCells,
            $currentCell;

        if (selection && tabletools) {
            selectedCells = tabletools.getSelectedCells(selection);

            if (selectedCells.length > 0) {
                $currentCell = $(selectedCells[0].$);

                colActions
                    .show()
                    .hAlignWith($currentCell, 'center')
                    .vAlignWith($tableContainer, 'top');

                rowActions
                    .show()
                    .hAlignWith($tableContainer, 'left')
                    .vAlignWith($currentCell, 'center');
            }
        }
    }

    return TableStateActive;
});