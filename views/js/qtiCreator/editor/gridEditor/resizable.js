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
 * Copyright (c) 2014-2023 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/editor/gridEditor/config',
    'taoQtiItem/qtiCreator/editor/gridEditor/helper',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/lib/jqueryui_dragdrop'
], function (_, $, config, helper, qtiElements) {
    'use strict';

    // in one row max 12 columns
    const MAX_UNITS = 12;

    let _syncHandleHeight = function ($row) {
        let h = $row.height() - parseFloat($row.children('[class^="col-"], [class*=" col-"]').css('margin-bottom'));
        $row.find('.grid-edit-resizable-zone').height(h);
    };

    const _deleteResizables = function _deleteResizables($el) {
        $el.find('.grid-edit-resizable-zone').remove();
    };

    let _setColUnits = function _setColUnits($elt, newUnits) {
        if ($elt.attr('class').match(/col-([\d]+)/)) {
            let oldUnits = $elt.attr('data-units');
            let $parentRow = $elt.parent('.grid-row');
            let totalUnits = $parentRow.attr('data-units') || MAX_UNITS;
            $parentRow.attr('data-units', Math.max(totalUnits - oldUnits + newUnits)); //update parent
            $elt.attr('data-units', newUnits); //update element
            $elt.removeClass(`col-${oldUnits}`).addClass(`col-${newUnits}`);
        } else {
            throw $.error('the element is not a grid column');
        }
    };
    const _createResizables = function createResizables($el) {
        let marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left') || 0);
        let activeWidth = 20;

        $el.find('[class^="col-"], [class*=" col-"]').each(function () {
            let $col = $(this);

            // Skip if the element is inside a PCI.
            // In this case, this is most probably a custom style rather than a TAO controlled grid.
            if ($col.closest('.qti-customInteraction').length) {
                return true;
            }

            //@todo this should be more generic
            //see draggable etc for more references
            if ($col.parent().hasClass('fixed-grid-row')) {
                return true;
            }

            if ($col.children('.grid-edit-resizable-zone').length) {
                //already created, next !
                return true;
            }

            let $nextCol = $col.next();
            let $row = $col.parent('.grid-row');
            let min = qtiElements.is($col.data('qti-class'), 'interaction') ? config.min.interaction : config.min.text;
            let nextMin = qtiElements.is($nextCol.data('qti-class'), 'interaction')
                ? config.min.interaction
                : config.min.text;
            let unitWidth = $row.width() / MAX_UNITS;

            let activeHeight = $row.height() - parseFloat($col.css('margin-bottom'));
            let $activeZone = $('<div>', { class: 'grid-edit-resizable-zone grid-edit-resizable-zone-active' }).css({
                top: 0,
                right: -(marginWidth + (activeWidth - marginWidth) / 2),
                width: activeWidth,
                height: activeHeight
            });
            let $handle = $('<span>', { class: 'grid-edit-resizable-handle' });
            $activeZone.append($handle);
            $col.append($activeZone);

            let _syncOutlineHeight = function () {
                let h = $row.height() - parseFloat($col.css('margin-bottom'));
                $col.find('.grid-edit-resizable-outline').height(h);
                $activeZone.height(h);
            };

            $activeZone
                .draggable({
                    containment: $nextCol.length
                        ? [
                            $col.offset().left + min * unitWidth - marginWidth * 2 + 10,
                            $col.offset().top,
                            $col.offset().left +
                                  $col.outerWidth() +
                                  marginWidth +
                                  $nextCol.outerWidth() -
                                  nextMin * unitWidth -
                                  activeWidth / 2 -
                                  10,
                            $col.offset().top + $col.height()
                        ]
                        : [
                            $col.offset().left + min * unitWidth - marginWidth - activeWidth / 2 - 10,
                            $col.offset().top,
                            $row.offset().left + $row.outerWidth() - marginWidth - activeWidth / 2 - 12,
                            $col.offset().top + $col.height()
                        ],
                    axis: 'x',
                    cursor: 'col-resize',
                    start: function () {
                        $col.trigger('resizestart.gridEdit');

                        let $overlay = $('<div>', { class: 'grid-edit-resizable-outline' });
                        if ($col.next().length) {
                            $overlay.width(
                                parseFloat($col.outerWidth()) + marginWidth + parseFloat($nextCol.outerWidth())
                            );
                        } else {
                            $overlay.css({ width: '100%', 'border-right-width': 0 });
                        }
                        //store in memory for quick access during resize:
                        $(this).data('overlay', $overlay);
                        $col.append($overlay);
                        $handle.addClass('grid-edit-resizable-active');
                        $el.find('.grid-edit-resizable-zone-active').removeClass('grid-edit-resizable-zone-active');
                        _syncOutlineHeight();
                    },
                    drag: _.throttle(function () {
                        let width = $(this).offset().left + activeWidth / 2 - $col.offset().left;
                        let units = helper.getColUnits($col);
                        let nextUnits = $nextCol.length ? helper.getColUnits($nextCol) : 0;
                        if (!$nextCol.length) {
                            //need to resize the outline element:
                            $col.find('.grid-edit-resizable-outline').width($handle.offset().left - $col.offset().left);
                        }
                        if (width + marginWidth * 0 < (units - 1) * unitWidth) {
                            //need to compensate for the width of the active zone
                            units--;
                            _setColUnits($col, units);

                            if ($nextCol.length) {
                                nextUnits++;
                                _setColUnits($nextCol, nextUnits);
                            }

                            _syncOutlineHeight();

                            $col.trigger('resize.gridEdit');
                        } else if (width + marginWidth + 20 > (units + 1) * unitWidth) {
                            //need to compensate for the width of the active zone
                            units++;
                            _setColUnits($col, units);

                            if ($nextCol.length) {
                                nextUnits--;
                                _setColUnits($nextCol, nextUnits);
                            }

                            _syncOutlineHeight();

                            $col.trigger('resize.gridEdit');
                        }
                    }, config.throttle.resize),
                    stop: function () {
                        $col.find('.grid-edit-resizable-outline').remove();

                        _deleteResizables($el);
                        _createResizables($el);

                        $col.trigger('resizestop.gridEdit');
                    }
                })
                .css('position', 'absolute');
        });

        $el.off('.gridEdit.resizable')
            .on('dragoverstart.gridEdit.resizable', function () {
                _deleteResizables($el);
            })
            .on('dragoverstop.gridEdit.resizable', function () {
                _createResizables($el);
            })
            .on('contentChange.gridEdit.resizable', '.grid-row', function () {
                _deleteResizables($el);
                _createResizables($el);
            });
    };

    return {
        create: function ($element) {
            _createResizables($element);

            $(window)
                .off('resize.qtiEdit.resizable')
                .on('resize.qtiEdit.resizable', function () {
                    _deleteResizables($element);
                    _createResizables($element);
                });
        },
        destroy: function ($element, preserveGlobalEvents) {
            _deleteResizables($element);

            if (!preserveGlobalEvents) {
                $(window).off('resize.qtiEdit.resizable');
            }
        },
        syncHandleHeight: function ($row) {
            if ($row.hasClass('grid-row')) {
                _syncHandleHeight($row);
            } else {
                $row.find('.grid-row').each(function () {
                    _syncHandleHeight($(this));
                });
            }
        }
    };
});
