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

    var $tablePropTrigger,
        colActions,
        rowActions;

    var TableStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TableStateActive.prototype.buildEditor = function(){
        var self = this,
            _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable="true"]'),
            $itemPanel = _widget.getAreaBroker().getItemPanelArea();

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

        $tablePropTrigger = $editableContainer.find('[data-role="cke-table-properties"]');

        $editable
            .on('editorready.tableActive', function(event, editor) {
                $tablePropTrigger.on('click.tableActive', function(e){
                    e.stopPropagation();
                    editor.execCommand('taoqtitableProperties');
                });

                colActions = tableActionsFactory({ insertCol: true })
                    .on('delete', function() {
                        editor.execCommand('columnDelete');
                        this.hide();
                        rowActions.hide();
                    })
                    .on('insertCol', function() {
                        editor.execCommand('columnInsertAfter');
                    })
                    .render($itemPanel)
                    .hide();

                rowActions = tableActionsFactory({ insertRow: true })
                    .on('delete', function() {
                        editor.execCommand('rowDelete');
                        this.hide();
                        colActions.hide();
                    })
                    .on('insertRow', function() {
                        editor.execCommand('rowInsertAfter');
                    })
                    .render($itemPanel)
                    .hide();

                $editableContainer.on('keyup.tableActive', _displayTableActions.bind(this, editor, $editableContainer));
                $editableContainer.on('click.tableActive', _displayTableActions.bind(this, editor, $editableContainer));
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

    TableStateActive.prototype.enableTableActions = function enableTableActions(){



    };

    function _displayTableActions(editor, $editableContainer) {
        var selection = editor.getSelection();
        var selectedCells = window.CKEDITOR.plugins.tabletools.getSelectedCells(selection),
            currentCell;

        if (selectedCells.length > 0) {
            currentCell = selectedCells[0].$;

            colActions
                .show()
                .hAlignWith($(currentCell), 'center')
                .vAlignWith($editableContainer, 'top');

            rowActions
                .show()
                .hAlignWith($editableContainer, 'left')
                .vAlignWith($(currentCell), 'center');
        }
    }



    /*
    Getting this data has proven to be useful during the development of the first iteration of the table widget and deleting this breaks my heart.
    I keep this for now in case we find a use for it during the next iterations, in that case it could serve as a basis for a nice table helper.
    If not, it should be deleted at some point.

    function _getTableModel($table) {
        var $firstRow,
            $firstRowCells,
            firstColCells,
            colsCount,
            rowsCount;

        $firstRow = $table.find('thead tr').eq(0);
        if ($firstRow.length === 0) {
            $firstRow = $table.find('tbody tr').eq(0);
        }
        $firstRowCells = $firstRow.find('td, th');

        function addFirstCellOfRow() {
            firstColCells.push($(this).children().eq(0));
        }

        // we want the rows in order, but with a <tfoot>, they are out of order in the markup...
        $table.find('thead tr').each(addFirstCellOfRow);
        $table.find('tbody tr').each(addFirstCellOfRow);
        $table.find('tfoot tr').each(addFirstCellOfRow);

        colsCount = $firstRowCells.length;
        rowsCount = firstColCells.length;

        return {
            $firstRowCells: $firstRowCells,
            firstCollCells: firstColCells, // fixme: make this consitent between rows & cell. Either jQuery collection or table.
            rowCount: rowsCount,
            colsCount: colsCount
        };
    }
     */


    return TableStateActive;
});