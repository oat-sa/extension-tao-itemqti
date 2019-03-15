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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/gridUnits',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/qtiCreator/editor/gridEditor/helper',
    'taoQtiItem/qtiCreator/editor/gridEditor/arrow',
    'taoQtiItem/qtiCreator/editor/targetFinder'
], function($, _, gridUnits, qtiElements, helper, arrow, targetFinder){
    "use strict";
    var droppableGridEditor = {};

    var _pulseTimer;
    var _pulse;

    droppableGridEditor.createDroppableBlocks = function createDroppableBlocks(qtiClass, $el, optionsOriginal){
        var options = optionsOriginal || {};

        var minUnits = (typeof options.min === 'string') ? options.min : 0;
        var $colInitial = (options.initialPosition instanceof $) ? options.initialPosition : null;
        var ns = options.namespace ? '.' + options.namespace : '';
        var data = options.data || {};

        var $placeholder = $('<div>', {'id' : 'qti-block-element-placeholder', 'class' : 'qti-droppable-block-hover'});
        var marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left'));
        var isEmpty = ($el.children('.grid-row').length === 0);

        var _appendPlaceholder;
        var _resetPlaceholder;
        var _insertBetween;
        var _resetColsHeight;

        var $prev;
        var $next;

        //add dropping class (used to fix col-*:first margin issue);
        $el.addClass('dropping');

        //prepare tmp rows and cols
        if(isEmpty){

            $el.append(_getNewRow().append(_getNewCol().addClass('col-12')));

        }else{

            $el.find('.grid-row').each(function(){

                var $row = $(this);
                var cols = [];

                //build tmp new cols:
                var maxHeight = 0;
                var $cols = $row.children(':not(.new-col)').each(function(){
                    $(this).before(_getNewCol().attr('data-index', $(this).index() / 2));
                    maxHeight = Math.max($(this).height(), maxHeight);
                    cols.push({
                        'elt' : $(this),
                        'units' : parseInt($(this).attr('data-units'))
                    });
                });
                $cols.last().after(_getNewCol().attr('data-index', 'last'));
                $cols.height(maxHeight);

                $row.data('distributed-units', gridUnits.distribute(cols, minUnits, 12));

                //build tmp new rows:
                $row.before(_getNewRow().append(_getNewCol()));

            }).last().after(_getNewRow().append(_getNewCol()));
        }

        //append the dropping element placeholder:
        _appendPlaceholder = function($col){

            if($col.length){

                $placeholder
                    .data('dropped', true)
                    .show()
                    .parent().removeClass('col-12')
                    .parent().removeData('active');

                $col.append($placeholder);

            }else{
                //insertion failed
            }
        };

        //restore the dropping element placeholder back to its default location:
        _resetPlaceholder = function(){

            if($placeholder.parent().hasClass('dropping')) {
                $placeholder.parent().parent().removeData('active');

                $placeholder
                    .removeData('dropped')
                    .hide();

                $el.append($placeholder);
                return true;
            } else {
                return false;
            }
        };

        //function to be called for inter-column insertions:
        _insertBetween = function($col, location){
            var $row;
            var distributedUnits;
            var $newCol;
            var newUnit;
            var cumulatedUnits;
            var index;
            var h;

            var _appendToNextRow = function _appendToNextRow($forRow, $newColAppend){
                $forRow.next().attr('data-active', true).append($newColAppend);
            };

            if(location !== 'left' && location !== 'right') {
                return;
            }
            _restoreTmpCol($el);
            $row = $col.parent().attr('data-active', true);

            //store temporary the original classes before columns are resized
            $row.children(':not(.new-col)').each(function(){
                $(this).attr('data-original-class', $(this).attr('class'));
            });

            distributedUnits = $row.data('distributed-units');
            $newCol = (location === 'left') ? $col.prev() : $col.next();
            _appendPlaceholder($newCol);

            if(distributedUnits.refactoredTotalUnits > 12){
                //need to create a new row
                newUnit = ($newCol.is(':last-child') && distributedUnits.last) ? distributedUnits.last : distributedUnits.middle;
                $newCol.attr('class', 'new-col col-' + newUnit);

                cumulatedUnits = 0;
                index = $newCol.data('index');

                if(index === 'last'){
                    _appendToNextRow($row, $newCol);
                }else{
                    _.forEach(distributedUnits.cols, function(col, i){
                        if(cumulatedUnits + col.refactoredUnits > 12){
                            _appendToNextRow($row, col.elt);
                        }
                        col.elt.attr('class', 'col-' + col.refactoredUnits);
                        cumulatedUnits += col.refactoredUnits;

                        if(i === index) {
                            if(cumulatedUnits + newUnit > 12){
                                _appendToNextRow($row, $newCol);
                            }
                            cumulatedUnits += newUnit;
                        }

                    });
                }

            }else{
                if($newCol.is(':last-child') && distributedUnits.last){
                    $newCol.attr('class', 'new-col col-' + distributedUnits.last);
                }else{
                    $newCol.attr('class', 'new-col col-' + distributedUnits.middle);
                }
                _.each(distributedUnits.cols, function(col){
                    col.elt.attr('class', 'col-' + col.refactoredUnits);
                });
            }

            h = _resetColsHeight($col);
            $placeholder.css('height', '100%').parent().height(h);//causes issue on new-col sizes!
        };

        //recalculate the cols height according to new layout
        _resetColsHeight = function($col, asSelf){

            var maxHeight = 0;
            var $cols;
            if(!asSelf){
                asSelf = true;
            }

            $placeholder.css('height', 'auto').parent().removeAttr('style');//remove added height, to reset the height to auto

            $cols = $col.siblings('[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)').addBack();
            $cols.removeAttr('style');//remove added height, to reset the height to auto
            $cols.each(function(){
                maxHeight = Math.max($(this).height(), maxHeight);
            });

            $cols.height(maxHeight);
            if(!asSelf){
                $col.removeAttr('style');
            }
            return maxHeight;
        };

        _resetPlaceholder();

        //manage initial positioning, useful in the "move" context
        if($colInitial && $colInitial.length){

            $prev = $colInitial.prevAll('[class^="col-"], [class*=" col-"]').first();
            $next = $colInitial.nextAll('[class^="col-"], [class*=" col-"]').first();
            if($prev.length){
                _insertBetween($prev, 'right');
            }else if($next.length){
                _insertBetween($next, 'left');
            }else{
                //replace it self...
            }
        }

        //bind all event handlers:
        $el.on('mouseenter.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', _.debounce(function(e){
            var goingTo = e.relatedTarget|| e.toElement; //browser compatibility
            var $col;
            var $previousCol;

            if (goingTo) {
                $col = $(this);
                $previousCol = $placeholder.parent('.new-col');

                $placeholder.remove();//remove the placeholder from the previous location
                _restoreTmpCol($el);//restore tmp columns before reevaluating the heights
                _resetColsHeight($previousCol, false);//recalculate the height of the previously located row
                _resetColsHeight($col);//recalculate the height for the current row
                arrow.create($col, {marginWidth: marginWidth});

            }

        }, 50)).on('arrowenter.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', _.throttle(function(e, position) {
            var $col = $(this);

            _restoreTmpCol($el);//restore tmp columns before reevaluating the heights
            _insertBetween($col, position);

        }, 50)).on('mousemove.gridEdit.gridDragDrop', _.throttle(function(e){ // '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)
            var goingTo = e.relatedTarget|| e.toElement; //browser compatibility
            var $target = $(e.target);
            var $col;
            var $newRow;
            var $newCol;
            var h;
            var relY;

            //insert element above or below the col's row:
            if(!$target.hasClass("new-col") && !$target.is("#qti-block-element-placeholder")) {
                if ($(goingTo).closest('.grid-row').length) {
                    if ($target.hasClass('grid-row')) {
                        $col = $target.children('[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)');
                    } else {
                        $col = $target.parents('.grid-row').children('[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)');
                    }

                    if ($col.length) {
                        h = $col.height();
                        relY = e.pageY - $col.offset().top;

                        //insert on top or bottom:
                        $newRow = (relY < h / 2) ? $col.parent().prev() : $col.parent().next();
                        if (!$newRow.find('#qti-block-element-placeholder').length) {//append row only not already included
                            _restoreTmpCol($el);//restore tmp columns before reevaluating the heights
                            _resetColsHeight($placeholder.parent('.new-col'), false);//recalculate the height of the previously located row
                            $newCol = $newRow.attr('data-active', true).children('.new-col').addClass('col-12');
                        }

                        if (typeof $newCol !== 'undefined' && $newCol.length) {
                            _appendPlaceholder($newCol);
                        }
                    }
                } else {
                    $newCol = $el.find('.new-col:last').css('background', '1px solid red');
                    _appendPlaceholder($newCol);
                    $newCol.addClass('col-12');
                }
            }
        }, 50)).on('mouseleave.gridEdit.gridDragDrop', _.debounce(function(e){
            var goingTo = e.relatedTarget|| e.toElement; //browser compatibility

            if($(e.target).parents('.qti-itemBody').length) {
                _resetPlaceholder();
                if (goingTo && !$(goingTo).hasClass('dropping').length) {
                    $placeholder.remove();
                }

                //destroy inter-column insertion helper
                e.stopPropagation();
                $(this).find('.grid-edit-insert-box').remove();
            }
        }, 50))

        //listen to the end of the dragging
        //on element drop (mouseout in the drop area $el)
        .one('dragoverstop.gridEdit', _.debounce(function(){
            var $selectedCol;
            var dropped;

            $el.off('.gridEdit.gridDragDrop');

            $selectedCol = $placeholder.parent('.new-col');
            dropped = !!$selectedCol.length;

            if(dropped){//has been properly dropped:

                //make the placeholder permanent
                $placeholder.removeAttr('id').removeClass('qti-droppable-block-hover');

                //make the dropped col permanent
                $selectedCol
                    .data('qti-class', qtiClass)
                    .removeClass('new-col')
                    .removeAttr('data-index');

                helper.setUnitsFromClass($selectedCol);

                //make the dropped row permanent
                $selectedCol.parent('.grid-row-new').removeClass('grid-row-new');

                //manage the temp grid-new-row:
                $el.find('.grid-row[data-active=true]').each(function(){

                    var $row = $(this);

                    $row.removeClass('grid-row-new');

                    //make the modified  col-n class permanent and update data attribute "data-units"
                    $row.children(':not(.new-col)').removeAttr('data-original-class').each(function(){
                        helper.setUnitsFromClass($(this));
                    });
                });
            }

            _destroyDroppableBlocks($el);

            if(dropped && $placeholder.data('dropped')){
                //trigger dropped event
                $el.trigger('dropped.gridEdit' + ns, [qtiClass, $placeholder, data]);
            }

        }, 50));

    };

    _pulseTimer = null;
    _pulse = function ($el){
        var intervalDuration = 1000;

        if(_pulseTimer){
            clearInterval(_pulseTimer);
        }

        setInterval(function(){

            $el.animate({
                opacity : 0.1
            }, intervalDuration * 0.5, function(){
                $el.animate({
                    opacity : 0.9
                }, intervalDuration * 0.5);
            });

        }, intervalDuration);

    };

    droppableGridEditor.createDroppableInlines = function createDroppableInlines(qtiClass, $el, options){

        var ns = options.namespace ? '.' + options.namespace : '';
        var data = options.data || {};
        var $targets = targetFinder.getTargetsFor(qtiClass, $el);
        var dropped = false;
        var $placeholder;
        var _resetPlaceholder = function _resetPlaceholder(){
            $placeholder.detach();
            dropped = false;
        };
        var _showPlaceholder = function _showPlaceholder(){
            dropped = true;
            return $placeholder;
        };


        $targets.addClass('drop-target');

        $targets.contents().each(function(){
            //a text node
            if(this.nodeType === 3 && !this.nodeValue.match(/^\s+$/)){
                $(this).replaceWith($.map(this.nodeValue.split(/(\S+)/), function(w){
                    return w.match(/^\s*$/) ? document.createTextNode(w) : $('<span>', {'text' : w, 'class' : 'qti-word-wrap'}).get();
                }));
            }
        });

        $placeholder = $('<span>', {'id' : 'qti-inline-element-placeholder', 'data-inline' : true});
        $placeholder.append($('<span>', {'class' : 'cursor-h'})).append($('<span>', {'class' : 'cursor-v'}));
        _pulse($placeholder);
        _resetPlaceholder($el);

        $el.on('mousemove.gridEdit.gridDragDrop', 'span.qti-word-wrap', _.throttle(function(e){

            var w = $(this).width();
            var parentOffset = $(this).offset();
            var relX = e.pageX - parentOffset.left;

            if(relX < w / 2){
                $(this).before(_showPlaceholder());
            }else{
                $(this).after(_showPlaceholder());
            }

        }, 50)).on('mouseover.gridEdit.gridDragDrop', _.throttle(function(e){
            var $target;
            e.stopPropagation();
            $target = $(e.target);

            if($target.hasClass('drop-target') && !$target.find($placeholder).length){

                //make first insertion easier
                $target.append(_showPlaceholder());

            }else if($target[0] !== $placeholder[0]
                && !$target.hasClass('qti-word-wrap')
                && !$target.children('.qti-word-wrap').length){

                _resetPlaceholder($el);
            }
        }, 50))

        //listen to the end of the dragging
        .one('dragoverstop.gridEdit', function(){

            //make placeholder permanent
            if(dropped){
                $placeholder.removeAttr('id').removeAttr('class');
            }

            //destroy droppable
            _destroyDroppableInlines($el);

            //call callback function:
            if(dropped){
                $el.trigger('dropped.gridEdit' + ns, [qtiClass, $placeholder, data]);
            }else{
                //clean up :
                $placeholder.remove();
                $placeholder = null;
            }
        });
    };

    droppableGridEditor.destroyDroppables = function destroyDroppables($el){

        _destroyDroppableInlines($el);
        _destroyDroppableBlocks($el);
    };

    function _destroyDroppableInlines($el){

        $el.off('.gridEdit.gridDragDrop');

        $el.find('span.qti-word-wrap').replaceWith(function(){
            return _.escape($(this).text());
        });

        $el.find('.drop-target').removeClass('drop-target');
    }

    function _destroyDroppableBlocks($el){

        var _toBeRemoved = [
            '#qti-block-element-placeholder',
            '.new-col',
            '.grid-row-new',
            '.grid-edit-insert-box'
        ];

        $el.removeClass('dropping').off('.gridEdit.gridDragDrop');

        $el.find('[class^="col-"], [class*=" col-"]').removeAttr('style');

        _restoreTmpCol($el);

        $el.find(_toBeRemoved.join(',')).remove();
    }

    function _getNewRow(){
        return $('<div>', {'class' : 'grid-row grid-row-new', 'data-units' : 0});
    }

    function _getNewCol(){
        return $('<div>', {'class' : 'new-col'});
    }

    function _restoreTmpCol($el){
        $el.find('.grid-row').each(function(){
            var $children;
            var $row = $(this);
            $row.children('.new-col').attr('class', 'new-col').removeAttr('style');//reset all column

            //restore location of overflown cols
            if($row.hasClass('grid-row-new')){
                $children = $row.children();
                if($children.length > 1){
                    $row.prev().append($children);
                    $row.append($children.first());
                }
            }

            //restore original classes
            $row.children(':not(.new-col)').each(function(){
                var $col = $(this);
                var originalClasses = $col.attr('data-original-class');
                if(originalClasses){
                    $col.attr('class', originalClasses).removeAttr('data-original-class');
                }
            });
            $row.removeAttr('data-active');
        });
    }

    return droppableGridEditor;
});
