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
    'ui/tableModel',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/widgets/static/table/components/tableActions',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(_, $, __, ckEditor, tableModelFactory, stateFactory, Active, tableActionsFactory, htmlEditor, contentHelper){
    'use strict';

    var tableModel,
        colActions,
        rowActions;

    var css = {
        deleteColRow: 'hoverDelete',
        insertRowAfter: 'insertRowAfter',
        insertColAfter: 'insertColAfter'
    };

    var TableStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TableStateActive.prototype.buildEditor = function buildEditor(){
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
                tableModel = tableModelFactory($editable);

                // listener for table properties
                $tablePropTrigger.on('click.tableActive', function openTableProperties(e){
                    e.stopPropagation();
                    editor.execCommand('taoqtitableProperties');
                });

                // listeners for columns actions
                colActions = tableActionsFactory({
                    insertCol: true,
                    deleteTitle: 'Delete column'
                })
                    .on('delete', function() {
                        editor.execCommand('columnDelete');
                        hideTableActions();
                        updateTable();
                    })
                    .on('deleteMouseEnter', function() {
                        addClassOnCurrentCol(editor, css.deleteColRow);
                    })
                    .on('deleteMouseLeave', function() {
                        clearCellClasses($editable,  css.deleteColRow);
                    })
                    .on('insertCol', function() {
                        editor.execCommand('columnInsertAfter');
                        updateTable();
                    })
                    .on('insertColMouseEnter', function() {
                        addClassOnCurrentCol(editor, css.insertColAfter);
                    })
                    .on('insertColMouseLeave', function() {
                        clearCellClasses($editable,  css.insertColAfter);
                    })
                    .render($itemPanel)
                    .hide();

                // listeners for row actions
                rowActions = tableActionsFactory({
                    insertRow: true,
                    deleteTitle: 'Delete row'
                })
                    .on('delete', function() {
                        editor.execCommand('rowDelete');
                        hideTableActions();
                        updateTable();
                    })
                    .on('deleteMouseEnter', function() {
                        addClassOnCurrentRow(editor, css.deleteColRow);
                    })
                    .on('deleteMouseLeave', function() {
                        clearCellClasses($editable,  css.deleteColRow);
                    })
                    .on('insertRow', function() {
                        editor.execCommand('rowInsertAfter');
                        updateTable();
                    })
                    .on('insertRowMouseEnter', function() {
                        addClassOnCurrentRow(editor, css.insertRowAfter);
                    })
                    .on('insertRowMouseLeave', function() {
                        clearCellClasses($editable,  css.insertRowAfter);
                    })
                    .render($itemPanel)
                    .hide();

                $editableContainer.on('keyup.tableActive mouseup.tableActive', function() {
                    displayTableActions(editor, $editableContainer);
                });
            })
            .on('editordestroyed.tableActive', function() {
                if ($tablePropTrigger.length) {
                    $tablePropTrigger.off('.tableActive');
                }
            });
    };

    TableStateActive.prototype.destroyEditor = function destroyEditor(){
        var _widget = this.widget,
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable="true"]');

        //search and destroy the editor
        $editableContainer.off('.tableActive');
        $editable.off('.tableActive');
        htmlEditor.destroyEditor($editableContainer);

        tableModel = null;

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

    function addClassOnCurrentRow(editor, className) {
        var currentCellPos = getCurrentCellPos(editor),
            $currentCol;
        if (currentCellPos) {
            $currentCol = tableModel.getRowCells(currentCellPos.y);
            $currentCol.addClass(className);
        }
    }

    function addClassOnCurrentCol(editor, className) {
        var currentCellPos = getCurrentCellPos(editor),
            $currentCol;
        if (currentCellPos) {
            $currentCol = tableModel.getColCells(currentCellPos.x);
            $currentCol.addClass(className);
        }
    }

    function clearCellClasses($editable, className) {
        $editable.find('th, td').removeClass(className);
    }

    function updateTable() {
        tableModel.update();
        if (tableModel.getRowCount() === 1) {
            rowActions.hideDelete();
        } else {
            rowActions.showDelete();
        }
        if (tableModel.getColCount() === 1) {
            colActions.hideDelete();
        } else {
            colActions.showDelete();
        }
    }

    /**
     * hide components containing row and column actions
     */
    function hideTableActions() {
        colActions.hide();
        rowActions.hide();
    }

    /**
     * Display row and columns actions at the correct position, depending of where the user has the cursor
     * @param {ckEditor} editor - editor instance to access the current selection
     * @param {jQuery} $tableContainer - the table DOM element, so we can align the toolbars on it
     */
    function displayTableActions(editor, $tableContainer) {
        var selectedCells = getSelection(editor),
            $currentCell;

        if (selectedCells && selectedCells.length !== 1) {
            // when none or more than one cells are selected, then we do not display the toolbars as the expected behavior is not obvious.
            // for example, it's difficult to define the expected behavior of deleting a column when cells from multiple columns are selected...
            hideTableActions();

        } else {
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

    /**
     * only works when a single cell is selected
     * @param editor
     */
    function getCurrentCellPos(editor) {
        var selectedCells = getSelection(editor),
            currentCell;

        if (selectedCells && selectedCells.length === 1) {
            currentCell = selectedCells[0].$;

            return {
                x: currentCell.cellIndex,
                y: currentCell.parentNode.rowIndex
            };
        }
    }

    /**
     * Get the current selected cells in the table
     * @param editor - CkEditor instance
     * @returns {ckEditor.dom.element[]}
     */
    function getSelection(editor) {
        var selection = editor.getSelection(),
            tabletools = window.CKEDITOR.plugins.tabletools;

        if (selection && tabletools) {
            return tabletools.getSelectedCells(selection);
        }
    }

    return TableStateActive;
});