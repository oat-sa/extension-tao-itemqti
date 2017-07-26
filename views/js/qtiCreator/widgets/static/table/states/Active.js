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
    'taoQtiItem/qtiCreator/widgets/static/table/components/colActions',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(_, $, __, ckEditor, stateFactory, Active, colActionsFactory, htmlEditor, contentHelper){
    'use strict';

    var $tablePropTrigger;

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
                editor.execCommand('taoqtitableProperties');
            });

            self.addTableActions(editor);
        });
    };

    TableStateActive.prototype.destroyEditor = function(){
        var _widget = this.widget,
            $editableContainer = _widget.$container;

        //search and destroy the editor
        htmlEditor.destroyEditor($editableContainer);
    };

    TableStateActive.prototype.addTableActions = function addTableActions(editor){
        var _widget = this.widget,
            $tableContainer = _widget.$container,
            $itemPanel = _widget.getAreaBroker().getItemPanelArea(),
            colsCount = 0,
            rowsCount = 0,
            $allRows,
            $firstRow,
            $firstRowCells,
            firstColCells = [];

        var $allCells = $tableContainer.find('td,th');

        var colActions = colActionsFactory($itemPanel);
        colActions.hide();
        colActions.on('deleteCol', function() {
            var cmd = editor.getCommand('columnDelete');
            cmd.setState(1); //fixme: can we do better?!
            editor.execCommand('columnDelete');
        });
        colActions.on('insertCol', function() {
            var cmd = editor.getCommand('columnInsertAfter');
            cmd.setState(1); //fixme: can we do better?!
            editor.execCommand('columnInsertAfter');
        });

        $firstRow = $tableContainer.find('thead tr').eq(0);
        if ($firstRow.length === 0) {
            $firstRow = $tableContainer.find('tbody tr').eq(0);
        }
        $firstRowCells = $firstRow.find('td, th');


        function addFirstCellOfRow() {
            firstColCells.push($(this).children().eq(0));
        }

        $tableContainer.find('thead tr').each(addFirstCellOfRow);
        $tableContainer.find('tbody tr').each(addFirstCellOfRow);
        $tableContainer.find('tfoot tr').each(addFirstCellOfRow);

        colsCount = $firstRowCells.length;
        rowsCount = firstColCells.length;

        console.log('table ', colsCount, 'x', rowsCount);


        function getCurrentCell() {
            var selection = editor.getSelection();
            var selectedCells = window.CKEDITOR.plugins.taoqtitabletools.getSelectedCells(selection),
                currentCell,
                currentCellPos = {},
                currentCellCoords,
                tableCoords = $tableContainer.offset();

            var tooltip, tooltipApi;

            // var $colActions = $(colTpl());

            if (selectedCells.length > 0) {
                currentCell = selectedCells[0].$;
                $allCells.css({'background-color': 'transparent'});
                $(currentCell).css({'background-color': 'red'});
                currentCellCoords = $(currentCell).offset();

                currentCellPos = {
                    x: currentCell.cellIndex,
                    y: currentCell.parentNode.rowIndex
                };

                $firstRowCells.eq(currentCellPos.x).css({'background-color': 'yellow'});
                $(firstColCells[currentCellPos.y]).css({'background-color': 'yellow'});
                console.log('in: ', currentCell.cellIndex, ' - ', currentCell.parentNode.rowIndex);

                // tooltip = $(currentCell).qtip({
                //     content: {
                //         text: 'tooltip'
                //     },
                //     style: {
                //         classes: 'qtip-light'
                //     }
                //
                // });
                // tooltipApi = tooltip.qtip('api');
                // tooltipApi.show();

                colActions.show();

                colActions.moveTo(
                    currentCellCoords.left - $itemPanel.offset().left + $(currentCell).width() / 2 - colActions.getOuterSize().width / 2,
                    tableCoords.top - $itemPanel.offset().top - colActions.getOuterSize().height /* height of toolbar */
                );
            }
            console.dir(selectedCells);
        }

        $tableContainer.on('keyup', getCurrentCell);
        $tableContainer.on('click', getCurrentCell);
    };



    return TableStateActive;
});