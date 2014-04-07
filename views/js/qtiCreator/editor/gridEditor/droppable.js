define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/gridUnits',
    'taoQtiItem/qtiCreator/editor/gridEditor/helper',
    'taoQtiItem/qtiCreator/editor/gridEditor/arrow'
], function($, _, gridUnits, helper, arrow){

    var droppableGridEditor = {};

    droppableGridEditor.createDroppableBlocks = function createDroppableBlocks(qtiClass, $el, options){

        var minUnits = (options && typeof options.min === 'string') ? options.min : 0,
            $colInitial = (options && options.initialPosition instanceof $) ? options.initialPosition : null;

        var $placeholder = $('<div>', {'id' : 'qti-block-element-placeholder', 'class' : 'qti-droppable-block-hover'}),
            marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left')),
            isEmpty = ($el.children('.grid-row').length === 0);
        
        //prepare tmp rows and cols
        if(isEmpty){
            $el.append(_getNewRow().append(_getNewCol().addClass('col-12')));
        }else{
            $el.find('.grid-row').each(function() {

                var $row = $(this), cols = [];

                //build tmp new cols:
                var maxHeight = 0;
                var $cols = $row.children(':not(.new-col)').each(function() {
                    $(this).before(_getNewCol().attr('data-index', $(this).index() / 2));
                    maxHeight = Math.max($(this).height(), maxHeight);
                    cols.push({
                        'elt': $(this),
                        'units': parseInt($(this).attr('data-units'))
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
        var _appendPlaceholder = function($col){
            
            $placeholder
                .data('dropped', true)
                .show()
                .parent().removeClass('col-12')
                .parent().removeData('active');
                
            if(!$col.length){
                debugger;
            }
            
            $col.append($placeholder);
        };

        //restore the dropping element placeholder back to its default location:
        var _resetPlaceholder = function(){
            
            $placeholder.parent().parent().removeData('active');

            $placeholder
                .removeData('dropped')
                .hide();

            $el.append($placeholder);
        };

        //function to be called for inter-column insertions:
        var _insertBetween = function($col, location){
            if(location === 'left' || location === 'right'){
                _restoreTmpCol($el);
                var $row = $col.parent().attr('data-active', true);
                $row.children(':not(.new-col)').each(function(){
                    $(this).attr('data-original-class', $(this).attr('class'));
                });

                var distributedUnits = $row.data('distributed-units');
                var $newCol = (location === 'left') ? $col.prev() : $col.next();
                _appendPlaceholder($newCol);

                if(distributedUnits.refactoredTotalUnits > 12){
                    //need to create a new row
                    var newUnit = ($newCol.is(':last-child') && distributedUnits.last) ? distributedUnits.last : distributedUnits.middle;
                    $newCol.attr('class', 'new-col col-' + newUnit);

                    var cumulatedUnits = 0, index = $newCol.data('index');

                    var _appendToNextRow = function _appendToNextRow($row, $newCol){
                        $row.next().attr('data-active', true).append($newCol);
                    };

                    if(index === 'last'){
                        _appendToNextRow($row, $newCol);
                    }else{
                        for(var i in distributedUnits.cols){

                            if(i == index){//note: no strict comparison here
                                if(cumulatedUnits + newUnit > 12){
                                    _appendToNextRow($row, $newCol)
                                }
                                cumulatedUnits += newUnit;
                            }

                            var col = distributedUnits.cols[i];
                            if(cumulatedUnits + col.refactoredUnits > 12){
                                _appendToNextRow($row, col.elt)
                            }
                            col.elt.attr('class', 'col-' + col.refactoredUnits);
                            cumulatedUnits += col.refactoredUnits;
                        }
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

                var h = _resetColsHeight($col);
                $placeholder.css('height', '100%').parent().height(h);//causes issue on new-col sizes!
            }
        };

        //recalculate the cols height according to new layout
        var _resetColsHeight = function($col, self){

            var maxHeight = 0;
            if(self === undefined){
                self = true;
            }

            $placeholder.css('height', 'auto').parent().removeAttr('style');//remove added height, to reset the height to auto

            var $cols = $col.siblings('[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)').andSelf();
            $cols.removeAttr('style');//remove added height, to reset the height to auto
            $cols.each(function(){
                maxHeight = Math.max($(this).height(), maxHeight);
            });

            $cols.height(maxHeight);
            if(!self){
                $col.removeAttr('style');
            }
            return maxHeight;
        };

        _resetPlaceholder();
        
        //manage initial positioning, useful in the "move" context
        if($colInitial && $colInitial.length){

            var $prev = $colInitial.prevAll('[class^="col-"], [class*=" col-"]').first();
            var $next = $colInitial.nextAll('[class^="col-"], [class*=" col-"]').first();
            if($prev.length){
                _insertBetween($prev, 'right');
            }else if($next.length){
                _insertBetween($next, 'left');
            }else{
                //replace it self...
            }
        }

        //bind all event handlers:
        $el.css('background', '1px solid red');
        $el.on('mouseenter.gridEdit.gridDragDrop', function(e){
            
            if(isEmpty){
                var $newCol = $el.find('.new-col').css('background', '1px solid red');
                _appendPlaceholder($newCol);
                $newCol.addClass('col-12');
            }
            
        }).on('mouseenter.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', function(e){

            var $col = $(this), $previousCol = $placeholder.parent('.new-col');

            _resetPlaceholder();//remove the placeholder from the previous location
            _restoreTmpCol($el);//restore tmp columns before reevaluating the heights

            _resetColsHeight($previousCol, false);//recalculate the height of the reviously located row
            _resetColsHeight($col);//recalculate the height for the current row

            arrow.create($col, {marginWidth : marginWidth});

        }).on('arrowenter.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', function(e, position){

            _insertBetween($(this), position);

        }).on('mousemove.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', _.throttle(function(e){

            //insert element above or below the col's row:
            var $col = $(this),
                h = $col.height(),
                relY = e.pageY - $col.offset().top;

            //insert on top or bottom:
            var $newRow = (relY < h / 2) ? $(this).parent().prev() : $(this).parent().next();
            if(!$newRow.find('#qti-block-element-placeholder').length){//append row only not already included
                var $newCol = $newRow.attr('data-active', true).children('.new-col').addClass('col-12');
                _appendPlaceholder($newCol);
            }

        }, 100)).on('mouseleave.gridEdit.gridDragDrop', '[class^="col-"], [class*=" col-"]', function(e){

            //destroy inter-column insertion helper
            e.stopPropagation();
            $(this).find('.grid-edit-insert-box').remove();

        }).on('mouseleave.gridEdit.gridDragDrop', function(){

            //restore dom when the mouse leaves the drop area "$el":
            $placeholder.hide();
            _resetPlaceholder();
            _restoreTmpCol($el);

        });

        //listen to the end of the dragging
        //on element drop (mouseout in the drop area $el)
        $el.one('beforedragoverstop.gridEdit', function(){

            $el.find('.grid-edit-insert-box').remove();

            $placeholder.parent('.new-col').removeClass('new-col');//make the dropped col permanent
            $el.find('.new-col').remove();//remove tmp cols

            //manage the temp new-col:
            $el.find('.grid-row[data-active=true]').each(function(){
                $(this).removeClass('grid-row-new');

                //make the modified  col-n class permanent and update data attribute "data-units"
                $(this).children().removeAttr('data-original-class').each(function(){
                    helper.setUnitsFromClass($(this));
                });
            });

            //manage the temp grid-row-new:
            $placeholder.parent().parent('.grid-row-new').removeClass('grid-row-new');//make the dropped row permanent
            $el.find('.grid-row-new').remove();//remove tmp rows

            //call callback function:
            if($placeholder.data('dropped')){
                $el.trigger('dropped.gridEdit', [qtiClass, $el, $placeholder]);
            }

            $el.off('.gridEdit.gridDragDrop');
            $el.find('[class^="col-"], [class*=" col-"]')
                .off('.gridEdit.gridDragDrop')
                .removeAttr('style');

        });

    };

    droppableGridEditor.createDroppableInlines = function createDroppableInlines(qtiClass, $el, options){

        var onDrop = (options && typeof options.drop === 'function') ? options.drop : null;

        (function wrap($el){
            QtiElements.getAllowedContainersElements(qtiElementClass, $el).filter(':not(script)').contents().each(function(){
                //a text node
                if(this.nodeType === 3 && !this.nodeValue.match(/^\s+$/)){
                    $(this).replaceWith($.map(this.nodeValue.split(/(\S+)/), function(w){
                        return w.match(/^\s*$/) ? document.createTextNode(w) : $('<span>', {'id' : 'w' + ($.fn.gridEditor.count++), 'text' : w, 'class' : 'qti-word-wrap'}).get();
                    }));
                }
            });
        }($el));

        var $placeholder = $('<span>', {'id' : 'qti-inline-element-placeholder', 'class' : 'qti-droppable-inline-hover', 'data-inline' : true}).hide();
        $el.after($placeholder);
        var $droppables = $el.on('mousemove.gridEdit.gridDragDrop', 'span.qti-word-wrap', function(e){
            var w = $(this).width();
            var parentOffset = $(this).offset();
            var relX = e.pageX - parentOffset.left;
            $placeholder.data('dropped', true);
            $placeholder.show().css('display', 'inline-block');
            if(relX < w / 2){
                $(this).before($placeholder);
            }else{
                $(this).after($placeholder);
            }
        });

        //listen to the end of the dragging 
        $el.one('beforedragoverstop.gridEdit', function(){
            if($placeholder.data('dropped') && typeof onDrop === 'function'){
                onDrop($el, $placeholder);
            }
            $droppables.off('.gridEdit.gridDragDrop');
        });
    };

    droppableGridEditor.destroyDroppables = function destroyDroppables($el){

        //inline droppables:
        $el.find('span.qti-word-wrap, span.qti-droppable').replaceWith(function(){
            return $(this).text();
        });

        _restoreTmpCol($el);

        $el.find('#qti-inline-element-placeholder, #qti-block-element-placeholder, .new-col, .grid-row-new').remove();

        $el.off('.gridEdit.gridDragDrop');
        $el.find('[class^="col-"], [class*=" col-"]').off('.gridEdit.gridDragDrop').removeAttr('style');
    };

    var _getNewRow = function _getNewRow(){
        return $('<div>', {'class' : 'grid-row grid-row-new', 'data-units' : 0});
    };

    var _getNewCol = function _getNewCol(){
        return $('<div>', {'class' : 'new-col'});
    };

    var _restoreTmpCol = function _restoreTmpCol($el){
        $el.find('.grid-row').each(function(){
            var $row = $(this);
            $row.children('.new-col').attr('class', 'new-col').removeAttr('style');//reset all column

            //restore location of overflown cols
            if($row.hasClass('grid-row-new')){
                var $children = $row.children();
                if($children.length > 1){
                    $row.prev().append($children);
                    $row.append($children.first());
                }
            }

            //restore original classes
            $row.children(':not(.new-col)').each(function(){
                var $col = $(this), originalClasses = $col.attr('data-original-class');
                if(originalClasses){
                    $col.attr('class', originalClasses).removeAttr('data-original-class');
                }
            });
            $row.removeAttr('data-active');
        });
    };

    return droppableGridEditor;
});
