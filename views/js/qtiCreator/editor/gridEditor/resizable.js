define(['jquery', 'jqueryui'], function($) {

    _createResizables = function createResizables($el) {

        var marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left')),
                activeWidth = 20;

        $el.find('[class^="col-"], [class*=" col-"]').each(function() {

            var $col = $(this),
                    $nextCol = $col.next(),
                    $row = $col.parent('.grid-row'),
                    offset = $col.offset(),
                    max = 12,
                    min = 2,
                    nextMin = 2,
                    unitWidth = $row.width() / max;

            var activeHeight = $row.height() - parseFloat($col.css('margin-bottom'));
            var $activeZone = $('<div>', {'class': 'grid-edit-resizable-zone grid-edit-resizable-zone-active'}).css({top: 0, right: -(marginWidth + (activeWidth - marginWidth) / 2), width: activeWidth, height: activeHeight});
            var $handle = $('<span>', {'class': 'grid-edit-resizable-handle'});
            $activeZone.append($handle);
            $col.append($activeZone);

            var _syncOutlineHeight = function() {
                var h = $row.height() - parseFloat($col.css('margin-bottom'));
                $col.find('.grid-edit-resizable-outline').height(h);
                $activeZone.height(h);
            };

            $activeZone.draggable({
                containment: $nextCol.length ? [
                    offset.left + min * unitWidth - marginWidth * 2 - 1,
                    offset.top,
                    offset.left + $col.outerWidth() + marginWidth + $nextCol.outerWidth() - nextMin * unitWidth - activeWidth / 2 + 1,
                    offset.top + $col.height()
                ] : [
                    offset.left + min * unitWidth - marginWidth - activeWidth / 2 - 0,
                    offset.top,
                    $row.offset().left + $row.outerWidth() - marginWidth - activeWidth / 2 + 1,
                    offset.top + $col.height()
                ],
                axis: 'x',
                cursor: 'col-resize',
                start: function() {
                    var $overlay = $('<div>', {'class': 'grid-edit-resizable-outline'});
                    if ($nextCol.length) {
                        $overlay.width(parseFloat($col.outerWidth()) + marginWidth + parseFloat($nextCol.outerWidth()));
                    } else {
                        $overlay.css({'width': '100%', 'border-right-width': 0});
                    }
                    //store in memory for quick access during resize:
                    $(this).data('overlay', $overlay);
                    $col.append($overlay);
                    $handle.addClass('grid-edit-resizable-active');
                    $el.find('.grid-edit-resizable-zone-active').removeClass('grid-edit-resizable-zone-active');
                    _syncOutlineHeight();
                },
                drag: function() {

                    var width = ($(this).offset().left + activeWidth / 2) - offset.left,
                            units = _getColUnits($col),
                            nextUnits = $nextCol.length ? _getColUnits($nextCol) : 0;

                    if (!$nextCol.length) {
                        //need to resize the outline element:
                        $col.find('.grid-edit-resizable-outline').width($handle.offset().left - offset.left);
                    }

                    if (width + marginWidth * 0 < (units - 1) * unitWidth) {//need to compensate for the width of the active zone

                        units--;
                        _setColUnits($col, units);

                        if ($nextCol.length) {
                            nextUnits++;
                            _setColUnits($nextCol, nextUnits);
                        }

                        _syncOutlineHeight();

                    } else if (width + marginWidth > (units + 1) * unitWidth) {//need to compensate for the width of the active zone

                        units++;
                        _setColUnits($col, units);

                        if ($nextCol.length) {
                            nextUnits--;
                            _setColUnits($nextCol, nextUnits);
                        }

                        _syncOutlineHeight();
                    }

                },
                stop: function() {
                    $col.find('.grid-edit-resizable-outline').remove();
                    _deleteResizables($el);
                    _createResizables($el);
                }
            }).css('position', 'absolute');

        });

        $el.off('dragoverstart.gridEdit').on('dragoverstart.gridEdit', function() {
            _deleteResizables($el);
        }).off('dragoverstop.gridEdit').on('dragoverstop.gridEdit', function() {
            _createResizables($el);
        });
    };

    var _deleteResizables = function _deleteResizables($el) {
        $el.find('[class^="col-"] .grid-edit-resizable-zone, [class*=" col-"] .grid-edit-resizable-zone').remove();
    };

    var _setColUnits = function _setColUnits($elt, newUnits) {
        if ($elt.attr('class').match(/col-([\d]+)/)) {
            var oldUnits = $elt.attr('data-units');
            var $parentRow = $elt.parent('.grid-row');
            var totalUnits = $parentRow.attr('data-units');
            $parentRow.attr('data-units', totalUnits - oldUnits + newUnits);//update parent
            $elt.attr('data-units', newUnits);//update element
            $elt.removeClass('col-' + oldUnits).addClass('col-' + newUnits);
        } else {
            throw $.error('the element is not a grid column');
        }
    };

    var _getColUnits = function _getColUnits($elt) {
        return parseInt($elt.attr('class').match(/col-([\d]+)/).pop());
    };

    return {
        create: function($element) {
            
            _createResizables($element);
            
            $(window).on('resize.qtiEdit.resizable', function(){
                _deleteResizables($element);
                _createResizables($element);
            });
        },
        destroy: function($element) {
            
            _deleteResizables($element);
            
            $(window).off('resize.qtiEdit.resizable');
        }
    };
});