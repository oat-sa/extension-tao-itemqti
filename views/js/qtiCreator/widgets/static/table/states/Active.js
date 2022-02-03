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
 * Copyright (c) 2017-2022 (original work) Open Assessment Technologies SA ;
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
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/table'
], function (
    _,
    $,
    __,
    ckEditor,
    tableModelFactory,
    stateFactory,
    Active,
    tableActionsFactory,
    htmlEditor,
    contentHelper,
    formElement,
    formTpl
) {
    'use strict';

    let tableModel, colActions, rowActions;

    const css = {
        deleteColRow: 'hoverDelete',
        insertRowAfter: 'insertRowAfter',
        insertColAfter: 'insertColAfter',

        hAlignCenter: 'table-center',
        hAlignRight: 'table-right'
    };

    const TableStateActive = stateFactory.extend(
        Active,
        function create() {
            this.initForm();
            this.buildEditor();
        },
        function exit() {
            this.widget.$form.empty();
            this.destroyEditor();
        }
    );

    // the element body should only contain the <table> tag content, and not the <table> tag itself.
    // as the ckeditor instance is bound to a wrapping <div>, we need to go through an extra step to remove the <table> tag.
    function getChangeCallback(container) {
        return _.throttle(function (data) {
            const $tableTagContent = $(data).children(), // might a mix of tbody / thead / tfoot
                $pseudoContainer = $('<div>').html($tableTagContent),
                newBody = contentHelper.getContent($pseudoContainer);
            container.body(newBody);
        }, 400);
    }

    TableStateActive.prototype.initForm = function initForm() {
        const _widget = this.widget,
            $form = _widget.$form,
            table = _widget.element,
            $container = _widget.$container;

        const hAlignOptions = [
            {
                name: __('Left'),
                value: 'left'
            },
            {
                name: __('Center'),
                value: 'center',
                selected: table.hasClass(css.hAlignCenter)
            },
            {
                name: __('Right'),
                value: 'right',
                selected: table.hasClass(css.hAlignRight)
            }
        ];

        $form.html(
            formTpl({
                hAlignOptions: hAlignOptions
            })
        );

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, table, {
            hAlign: function (t, value) {
                hideTableActions();
                t.removeClass(css.hAlignRight);
                t.removeClass(css.hAlignCenter);
                $container.removeClass(`${css.hAlignRight} ${css.hAlignCenter}`);
                switch (value) {
                    case 'center': {
                        t.addClass(css.hAlignCenter);
                        $container.addClass(css.hAlignCenter);
                        break;
                    }
                    case 'right': {
                        t.addClass(css.hAlignRight);
                        $container.addClass(css.hAlignRight);
                        break;
                    }
                }
            }
        });
    };

    TableStateActive.prototype.buildEditor = function buildEditor() {
        const _widget = this.widget,
            container = _widget.element.getBody(),
            $itemPanel = _widget.getAreaBroker().getItemPanelArea(),
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('.qti-table-container'),
            $tablePropTrigger = $editableContainer.find('[data-role="cke-table-properties"]');
        const areaBroker = _widget && _widget.getAreaBroker && _widget.getAreaBroker(),
            $toolbarArea = areaBroker && areaBroker.getToolbarArea && areaBroker.getToolbarArea();

        $editableContainer.attr('data-html-editable-container', true);
        $editable.attr('data-html-editable', true); // DO NOT move in template to avoid creation of nested ckInstances when container editor is created

        if (!htmlEditor.hasEditor($editableContainer)) {
            htmlEditor.buildEditor($editableContainer, {
                placeholder: '',
                change: getChangeCallback(container),
                removePlugins: 'magicline',
                data: {
                    container: container,
                    widget: _widget
                },
                blur: function () {
                    _widget.changeState('sleep');
                }
            });
        }

        $editable
            .on('editorready.tableActive', function (event, editor) {
                tableModel = tableModelFactory($editable.find('table'));

                // listener for table properties
                $tablePropTrigger.on('click.tableActive', function openTableProperties(e) {
                    e.stopPropagation();
                    hideTableActions();
                    editor.execCommand('taoqtitableProperties');
                });

                // listeners for columns actions
                colActions = tableActionsFactory({
                    insertCol: true,
                    deleteTitle: 'Delete column'
                })
                    .on('delete', function () {
                        editor.execCommand('columnDelete');
                        updateTable(editor, $editableContainer);
                        hideTableActions();
                    })
                    .on('deleteMouseEnter', function () {
                        addClassOnCurrentCol(editor, css.deleteColRow);
                    })
                    .on('deleteMouseLeave', function () {
                        clearCellClasses($editable, css.deleteColRow);
                    })
                    .on('insertCol', function () {
                        editor.execCommand('columnInsertAfter');
                        clearCellClasses($editable, css.insertColAfter); // this is because ck clone the current cells to insert the new ones
                        this.trigger('insertColMouseEnter'); // so we don't want him to clone the "insert style"
                        updateTable(editor, $editableContainer);
                    })
                    .on('insertColMouseEnter', function () {
                        addClassOnCurrentCol(editor, css.insertColAfter);
                    })
                    .on('insertColMouseLeave', function () {
                        clearCellClasses($editable, css.insertColAfter);
                    })
                    .render($itemPanel);

                // listeners for row actions
                rowActions = tableActionsFactory({
                    insertRow: true,
                    deleteTitle: 'Delete row'
                })
                    .on('delete', function () {
                        editor.execCommand('rowDelete');
                        updateTable(editor, $editableContainer);
                        hideTableActions();
                    })
                    .on('deleteMouseEnter', function () {
                        addClassOnCurrentRow(editor, css.deleteColRow);
                    })
                    .on('deleteMouseLeave', function () {
                        clearCellClasses($editable, css.deleteColRow);
                    })
                    .on('insertRow', function () {
                        editor.execCommand('rowInsertAfter');
                        clearCellClasses($editable, css.insertRowAfter); // this is because ck clone the current cells to insert the new ones
                        this.trigger('insertRowMouseEnter'); // so we don't want him to clone the "insert style"
                        updateTable(editor, $editableContainer);
                    })
                    .on('insertRowMouseEnter', function () {
                        addClassOnCurrentRow(editor, css.insertRowAfter);
                    })
                    .on('insertRowMouseLeave', function () {
                        clearCellClasses($editable, css.insertRowAfter);
                    })
                    .render($itemPanel);

                // When the table is clicked,
                // Set focus at the end of the last cell
                // and show the table, column, and row toolbars
                displayTableActions(editor, $editableContainer);

                $editableContainer.on('keyup.tableActive mouseup.tableActive', function () {
                    displayTableActions(editor, $editableContainer);
                    const currentSelection = getSelection(editor);
                    const $toolbars = $toolbarArea.find('.cke_toolbar');
                    // According 'ui/ckeditor/ckConfigurator' for table 2nd toolbar is Insert
                    // and 3rd is Links
                    // for multiselection they shouldd be hidden
                    if (currentSelection.length > 1) {
                        $toolbars.eq(1).hide();
                        $toolbars.eq(2).hide();
                    } else {
                        $toolbars.eq(1).show();
                        $toolbars.eq(2).show();
                    }
                });
            })
            .on('editordestroyed.tableActive', function () {
                if ($tablePropTrigger.length) {
                    $tablePropTrigger.off('.tableActive');
                }
            });
    };

    TableStateActive.prototype.destroyEditor = function destroyEditor() {
        const _widget = this.widget,
            $editableContainer = _widget.$container,
            $editable = $editableContainer.find('[data-html-editable="true"]');

        clearCellClasses($editable, css.insertColAfter);
        clearCellClasses($editable, css.insertRowAfter);
        clearCellClasses($editable, css.deleteColRow);

        //search and destroy the editor
        htmlEditor.destroyEditor($editableContainer);
        $editableContainer.off('.tableActive');
        $editable.off('.tableActive');

        $editable.attr('data-html-editable', false);
        $editableContainer.attr('data-html-editable-container', false);

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
        const currentCellPos = getCurrentCellPos(editor);
        if (currentCellPos) {
            const $currentCol = tableModel.getRowCells(currentCellPos.y);
            $currentCol.addClass(className);
        }
    }

    function addClassOnCurrentCol(editor, className) {
        const currentCellPos = getCurrentCellPos(editor);
        if (currentCellPos) {
            const $currentCol = tableModel.getColCells(currentCellPos.x);
            $currentCol.addClass(className);
        }
    }

    function clearCellClasses($editable, className) {
        $editable.find('th, td').removeClass(className);
    }

    /**
     * Update the table model and the available actions on rows/columns
     * @param {Object} editor
     * @param {JQueryElement} $editableContainer
     */
    function updateTable(editor, $editableContainer) {
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
        // reposition toolbars as their dimensions might have change
        displayTableActions(editor, $editableContainer);
    }

    /**
     * hide components containing row and column actions
     */
    function hideTableActions() {
        if (colActions) {
            colActions.hide();
        }
        if (rowActions) {
            rowActions.hide();
        }
    }

    /**
     * Display row and columns actions at the correct position, depending of where the user has the cursor
     * @param {ckEditor} editor - editor instance to access the current selection
     * @param {jQuery} $tableContainer - the table DOM element, so we can align the toolbars on it
     */
    function displayTableActions(editor, $tableContainer) {
        const selectedCells = getSelection(editor);

        if (selectedCells && selectedCells.length !== 1) {
            // when none or more than one cells are selected, then we do not display the toolbars as the expected behavior is not obvious.
            // for example, it's difficult to define the expected behavior of deleting a column when cells from multiple columns are selected...
            hideTableActions();
        } else {
            const $currentCell = $(selectedCells[0].$);

            colActions.show().hAlignWith($currentCell, 'center').vAlignWith($tableContainer, 'top');

            rowActions.show().hAlignWith($tableContainer, 'left').vAlignWith($currentCell, 'center');
        }
    }

    /**
     * only works when a single cell is selected
     * @param {Object} editor
     * @returns {Object} x,y cell position
     */
    function getCurrentCellPos(editor) {
        const selectedCells = getSelection(editor);

        if (selectedCells && selectedCells.length === 1) {
            const currentCell = selectedCells[0].$;

            return {
                x: currentCell.cellIndex,
                y: currentCell.parentNode.rowIndex
            };
        }
    }

    /**
     * Get the current selected cells in the table
     * @param {Object} editor - CkEditor instance
     * @returns {ckEditor.dom.element[]}
     */
    function getSelection(editor) {
        const selection = editor.getSelection(),
            tabletools = window.CKEDITOR.plugins.tabletools;

        if (selection && tabletools) {
            return tabletools.getSelectedCells(selection);
        }
    }

    return TableStateActive;
});
