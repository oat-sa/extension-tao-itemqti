define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/core/qtiElements',
    'taoQtiItem/qtiCreator/core/gridUnits',
    'taoQtiItem/qtiCreator/core/model/Item',
    'taoQtiItem/qtiCreator/editor/creatorRenderer',
    'jqueryui',
], function(_, $, Element, QtiElements, gridUnits, Item, creatorRenderer){

    'use strict';
    var CL = console ? console.log : function(){
    };

    $.fn.gridEditor = function(options){

        var opts = {};
        var method = '';
        var args = [];
        var ret = undefined;
        if(typeof options === 'object'){
            opts = $.extend({}, $.fn.gridEditor.defaults, options);
        }else if(options === undefined){
            opts = $.extend({}, $.fn.gridEditor.defaults);//use default
        }else if(typeof options === 'string'){
            if(typeof methods[options] === 'function'){
                method = options;
                args = Array.prototype.slice.call(arguments, 1);
            }
        }

        this.each(function(){
            var $this = $(this);
            if(method){
                if(isCreated($this)){
                    ret = methods[method].apply($(this), args);
                }else{
                    $.error('call of method of gridEditor while it has not been initialized');
                }
            }else if(!isCreated($this) && typeof opts === 'object'){
                create($this, opts);
            }
        });

        if(ret === undefined){
            return this;
        }else{
            return ret;
        }
    };

    $.fn.gridEditor.defaults = {
        'elementClass' : 'itemBody'
    };

    var methods = {
        addInsertables : function($elts, options){
            var $grid = $(this);
            $elts.each(function(){
                createInsertable($(this), $grid, options);
            });
        },
        createMovables : function($elts){
            var $grid = $(this);
            $elts.each(function(){
                createMovable($(this), $grid);
            });
        },
        destroy : function(){
            destroy($(this));
        },
        getContent : function(){
            return getContent($(this));
        },
        setContent : function(content){
            if(content){
                setContent($(this), content);
            }
        },
        resizable : function(){
            createResizables($(this));
        }
    };

    function isCreated($elt){
        return (typeof $elt.data('qti-grid-options') === 'object');
    }

    function setUnitsFromClass($el){
        var units = getColUnits($el);
        $el.attr('data-units', units);
        return units;
    }

    function create($elt, options){

        $elt.data('qti-grid-options', options);

        //initialize grid count
        $elt.find('.grid-row').each(function(){
            var totalUnits = 0;
            $(this).children('[class*=" col-"], [class^="col-"]').each(function(){
                totalUnits += setUnitsFromClass($(this));
            });
            $(this).attr('data-units', parseInt(totalUnits));
        });
    }

    function destroy($elt){
        $elt.removeData('qti-grid-options');
        $elt.find('.grid-row, [class*=" col-"], [class^="col-"]').removeAttr('data-units');
    }

    function getColUnits($elt){
        return parseInt($elt.attr('class').match(/col-([\d]+)/).pop());
    }

    function setColUnits($elt, newUnits){
        if($elt.attr('class').match(/col-([\d]+)/)){
            var oldUnits = $elt.attr('data-units');
            var $parentRow = $elt.parent('.grid-row');
            var totalUnits = $parentRow.attr('data-units');
            $parentRow.attr('data-units', totalUnits - oldUnits + newUnits);//update parent
            $elt.attr('data-units', newUnits);//update element
            $elt.removeClass('col-' + oldUnits).addClass('col-' + newUnits);
        }else{
            throw $.error('the element is not a grid column');
        }
    }

    function getBody($el){
        var html = $el.html();
        var _replace = function(original, qtiClass){
            var ret = original;
            if(qtiClass){
                ret = '{{' + qtiClass + ':new}}';
            }
            return ret;
        };

        html = html.replace(new RegExp('<div[^<]*data-qti-class="(\\w+)"[^<]*data-new="true"[^<]*>[^<>]*<\/div>', 'img'), _replace);
        html = html.replace(new RegExp('<div[^<]*data-new="true"[^<]*data-qti-class="(\\w+)"[^<]*>[^<>]*<\/div>', 'img'), _replace);

        return html;
    }

    var _item = null;
    function getQtiElement(){
        if(!_item){
            _item = new Item();
        }
        return _item;
    }

    $.fn.gridEditor.insertableDefaults = {
        helper : function(){
            return $(this).clone().css('z-index', 99);
        },
        drop : function(){
            //to be implemented
        }
    };

    function createInsertable($el, $to, options){

        options = _.defaults($.fn.gridEditor.insertableDefaults, options);

        createDraggable($el, $to, {
            helper : options.helper,
            drop : function($to, $dropped){

                //a new qti element has been added: update the model + render

                $dropped.removeAttr('id');//prevent it from being deleted
                $dropped.attr({'data-new' : true, 'data-qti-class' : $el.data('qti-class')});//add data attribute to get the dom ready to be replaced by rendering

                getQtiElement().createElements(getBody($to), function(newElts){
                    creatorRenderer.get().load(function(){
                        for(var serial in newElts){
                            var elt = newElts[serial],
                                $container,
                                widget;

                            elt.setRenderer(this);
                            elt.render({}, $dropped);
                            widget = elt.postRender();

                            if(Element.isA(elt, 'blockInteraction')){
                                $container = widget.$container;
                            }else{
                                //leave the container in place
                                $container = widget.$original;
                            }

                            createMovable($container, $to);
                        }
                    }, this.getUsedClasses());
                });

            }
        });
    }

    function createMovable($el, $to){

        var $parent = $el.parent('[class^="col-"], [class*=" col-"]');
        createDraggable($el, $to, {
            distance : 5,
            initialPosition : $el.parent(),
            start : function(e, ui){
                $el.hide();

                $parent.data({
                    'initial-position' : true,
                    'initial-class' : $parent.attr('class')
                }).attr('class', 'new-col');

            },
            helper : function(){
                return $(this).clone().addClass('grid-draggable-helper');
            },
            drop : function($to, $dropped){

                //reposition the element in the dom:
                $el.data('grid-element-dropped', true);
                $dropped.replaceWith($el);
                destroyDraggables($el);
                createMovable($el, $to);

            },
            stop : function(e, ui){

                //restore initial position if given:
                if(!$el.data('grid-element-dropped')){
                    $parent.attr('class', $parent.data('initial-class'));
                }

                //re-init the dropped value:
                $el.data('grid-element-dropped', false);

                //show it
                $el.show();
            }
        });


        $el.on("drag", function(e, ui){
//            debugger;
        });
    }

    function destroyDraggables($el){
        $el.draggable('destroy');
        $el.off('.gridDraggable');
    }

    function createDraggable($el, $to, options){
        $el.draggable({
            distance : (options && options.distance) ? parseInt(options.distance) : 1,
            helper : (options && options.helper) ? options.helper : 'original',
            appendTo : $to, //very important ! to enable movable correct positioning
            opacity : 0.5,
            scroll : false,
            cursor : 'crosshair',
            cursorAt : {left : -5, bottom : -5},
            create : function(){
                $(this).addClass('grid-draggable');
            },
            start : function(e, ui){
                if(options && typeof(options.start) === 'function'){
                    options.start.call(this, e, ui);
                }

                $(this).removeClass('grid-draggable-active');

                //define the type of draggable block/inline?
                var qtiClass = $(this).data('qti-class');
                if(QtiElements.isBlock(qtiClass)){
                    createDroppableBlocks($to, options);
                }else if(QtiElements.isInline(qtiClass)){
                    createDroppableInlines($to, options);
                }

                $to.trigger('dragoverstart.gridEdit');
            },
            stop : function(e, ui){

                $to.trigger('beforedragoverstop.gridEdit');

                if(options && typeof(options.stop) === 'function'){
                    options.stop.call(this, e, ui);
                }

                //restore dom:
                $('body').css('cursor', 'auto');//...

                //destroy droppables:
                destroyDroppables($to);
                $to.trigger('dragoverstop.gridEdit');
            }
        });

        $el.on('mousedown.gridDraggable.gridEdit', function(){
            $(this).addClass('grid-draggable-active');
        }).on('mouseup.gridDraggable.gridEdit', function(){
            $(this).removeClass('grid-draggable-active');
        });
    }

    function restoreTmpCol($el){
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
    }

    function getNewRow(){
        return $('<div>', {'class' : 'grid-row grid-row-new', 'data-units' : 0});
    }

    function getNewCol(){
        return $('<div>', {'class' : 'new-col'});
    }

    function createResizables($el){

        var marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left')),
            activeWidth = 20;

        $el.find('[class^="col-"], [class*=" col-"]').each(function(){

            var $col = $(this),
                $nextCol = $col.next(),
                $row = $col.parent('.grid-row'),
                offset = $col.offset(),
                max = 12,
                min = 2,
                nextMin = 2,
                unitWidth = $row.width() / max;

            var activeHeight = $row.height() - parseFloat($col.css('margin-bottom'));
            var $activeZone = $('<div>', {'class' : 'grid-edit-resizable-zone grid-edit-resizable-zone-active'}).css({top : 0, right : -(marginWidth + (activeWidth - marginWidth) / 2), width : activeWidth, height : activeHeight});
            var $handle = $('<span>', {'class' : 'grid-edit-resizable-handle'});
            $activeZone.append($handle);
            $col.append($activeZone);

            var _syncOutlineHeight = function(){
                var h = $row.height() - parseFloat($col.css('margin-bottom'));
                $col.find('.grid-edit-resizable-outline').height(h);
                $activeZone.height(h);
            };

            $activeZone.draggable({
                containment : $nextCol.length ? [
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
                axis : 'x',
                cursor : 'col-resize',
                start : function(){
                    var $overlay = $('<div>', {'class' : 'grid-edit-resizable-outline'});
                    if($nextCol.length){
                        $overlay.width(parseFloat($col.outerWidth()) + marginWidth + parseFloat($nextCol.outerWidth()));
                    }else{
                        $overlay.css({'width' : '100%', 'border-right-width' : 0});
                    }
                    //store in memory for quick access during resize:
                    $(this).data('overlay', $overlay);
                    $col.append($overlay);
                    $handle.addClass('grid-edit-resizable-active');
                    $el.find('.grid-edit-resizable-zone-active').removeClass('grid-edit-resizable-zone-active');
                    _syncOutlineHeight();
                },
                drag : function(){

                    var width = ($(this).offset().left + activeWidth / 2) - offset.left,
                        units = getColUnits($col),
                        nextUnits = $nextCol.length ? getColUnits($nextCol) : 0;

                    if(!$nextCol.length){
                        //need to resize the outline element:
                        $col.find('.grid-edit-resizable-outline').width($handle.offset().left - offset.left);
                    }

                    if(width + marginWidth * 0 < (units - 1) * unitWidth){//need to compensate for the width of the active zone

                        units--;
                        setColUnits($col, units);

                        if($nextCol.length){
                            nextUnits++;
                            setColUnits($nextCol, nextUnits);
                        }

                        _syncOutlineHeight();

                    }else if(width + marginWidth > (units + 1) * unitWidth){//need to compensate for the width of the active zone

                        units++;
                        setColUnits($col, units);

                        if($nextCol.length){
                            nextUnits--;
                            setColUnits($nextCol, nextUnits);
                        }

                        _syncOutlineHeight();
                    }

                },
                stop : function(){
                    $col.find('.grid-edit-resizable-outline').remove();
                    deleteResizables($el);
                    createResizables($el);
                }
            });

        });

        $el.off('dragoverstart.gridEdit').on('dragoverstart.gridEdit', function(){
            deleteResizables($el);
        }).off('dragoverstop.gridEdit').on('dragoverstop.gridEdit', function(){
            createResizables($el);
        });
    }

    function deleteResizables($el){
        $el.find('[class^="col-"] .grid-edit-resizable-zone, [class*=" col-"] .grid-edit-resizable-zone').remove();
    }

    function createDroppableBlocks($el, options){

        var onDrop = (options && typeof options.drop === 'function') ? options.drop : null,
            minUnits = (options && typeof options.min === 'string') ? options.min : 0,
            $colInitial = (options && options.initialPosition instanceof $) ? options.initialPosition : null;

        var $placeholder = $('<div>', {'id' : 'qti-block-element-placeholder', 'class' : 'qti-droppable-block-hover'}),
        marginWidth = parseFloat($el.find('[class^="col-"]:last, [class*=" col-"]:last').css('margin-left')),
            insertZoneWidth = 20;

        //prepare tmp rows and cols
        $el.find('.grid-row').each(function(){

            var $row = $(this), cols = [];

            //build tmp new cols:
            var maxHeight = 0;
            var $cols = $row.children(':not(.new-col)').each(function(){
                $(this).before(getNewCol().attr('data-index', $(this).index() / 2));
                maxHeight = Math.max($(this).height(), maxHeight);
                cols.push({
                    'elt' : $(this),
                    'units' : parseInt($(this).attr('data-units'))
                });
            });
            $cols.last().after(getNewCol().attr('data-index', 'last'));
            $cols.height(maxHeight);

            $row.data('distributed-units', gridUnits.distribute(cols, minUnits, 12));

            //build tmp new rows:
            $row.before(getNewRow().append(getNewCol()));

        }).last().after(getNewRow().append(getNewCol()));

        //append the dropping element placeholder:
        var _appendPlaceholder = function($col){

            $placeholder
                .data('dropped', true)
                .show()
                .parent().removeClass('col-12')
                .parent().removeData('active');

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
                restoreTmpCol($el);
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

        //build arrow for inter-column insertion:
        var _buildArrows = function($col){

            //create inter-column insertion helper
            var $insertRight = $('<div>', {'class' : 'grid-edit-insert-box'})
                .css({
                top : 0,
                right : -(marginWidth + (insertZoneWidth - marginWidth) / 2),
                height : $col.parent('.grid-row').height() - parseFloat($col.css('margin-bottom'))
            })
                .append($('<div>', {'class' : 'grid-edit-insert-square'}))
                .append($('<div>', {'class' : 'grid-edit-insert-triangle'}))
                .append($('<div>', {'class' : 'grid-edit-insert-line'}))
                .on('mouseenter', '.grid-edit-insert-triangle, .grid-edit-insert-square', function(){
                _insertBetween($col, 'right');
                _removeArrows($col);
            });

            var $insertLeft = $insertRight
                .clone()
                .css({'left' : -(marginWidth), 'right' : 'auto'})
                .on('mouseenter', '.grid-edit-insert-triangle, .grid-edit-insert-square', function(){
                _insertBetween($col, 'left');
                _removeArrows($col);
            });

            $col.append($insertRight).append($insertLeft);

            _arrowFall($insertRight, function(){
                _insertBetween($col, 'right');
                _removeArrows($col);
            });

            _arrowFall($insertLeft, function(){
                _insertBetween($col, 'left');
                _removeArrows($col);
            });
        };

        //remove arrows:
        var _removeArrows = function($col){
            $col.find('.grid-edit-insert-box').remove();
        };

        //animate arrow fall:
        var _arrowFall = function($insert, callback){

            var interval = null;
            $insert.on('mouseenter', function(e){

                var relY = e.pageY - $(this).offset().top
                    - parseInt($(this).find('.grid-edit-insert-triangle').outerHeight())
                    - parseInt($(this).find('.grid-edit-insert-square').outerHeight());

                var $arrow = $(this).find('.grid-edit-insert-triangle, .grid-edit-insert-square');

                var t = 0;
                interval = setInterval(function(){
                    var top = 0.5 * 9.81 * Math.pow(t, 2) / 100;
                    $arrow.css('top', top);

                    if(top > relY){
                        clearInterval(interval);
                        callback();
                    }

                    t++;
                }, 10);
            }).on('mouseleave', function(){
                $(this).find('.grid-edit-insert-triangle, .grid-edit-insert-square').css('top', 0);
                clearInterval(interval);
            });
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
        $el.on('mouseenter.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', function(e){

            var $col = $(this), $previousCol = $placeholder.parent('.new-col');

            _resetPlaceholder();//remove the placeholder from the previous location
            restoreTmpCol($el);//restore tmp columns before reevaluating the heights

            _resetColsHeight($previousCol, false);//recalculate the height of the reviously located row
            _resetColsHeight($col);//recalculate the height for the current row

            _buildArrows($col);//build arrows;

        }).on('mousemove.gridEdit.gridDragDrop', '[class^="col-"]:not(.new-col), [class*=" col-"]:not(.new-col)', function(e){

            //insert element above or below the col's row:
            var $col = $(this),
                h = $col.height(),
                relY = e.pageY - $col.offset().top;

            //insert on top of the bottom:
            var $newRow = (relY < h / 2) ? $(this).parent().prev() : $(this).parent().next();
            if(!$newRow.find('#qti-block-element-placeholder').length){//append row only not already included
                var $newCol = $newRow.attr('data-active', true).children('.new-col').addClass('col-12');
                _appendPlaceholder($newCol);
            }

        }).on('mouseleave.gridEdit.gridDragDrop', '[class^="col-"], [class*=" col-"]', function(e){

            //destroy inter-column insertion helper
            e.stopPropagation();
            $(this).find('.grid-edit-insert-box').remove();

        }).on('mouseleave.gridEdit.gridDragDrop', function(){

            //restore dom when the mouse leaves the drop area "$el":
            $placeholder.hide();
            _resetPlaceholder();
            restoreTmpCol($el);

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
                    setUnitsFromClass($(this));
                });
            });

            //manage the temp grid-row-new:
            $placeholder.parent().parent('.grid-row-new').removeClass('grid-row-new');//make the dropped row permanent
            $el.find('.grid-row-new').remove();//remove tmp rows

            //call callback function:
            if($placeholder.data('dropped') && typeof onDrop === 'function'){
                onDrop($el, $placeholder);
            }

            $el.off('.gridEdit.gridDragDrop');
            $el.find('[class^="col-"], [class*=" col-"]')
                .off('.gridEdit.gridDragDrop')
                .removeAttr('style');

        });

    }

    function createDroppableInlines($el, options){

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
    }

    function destroyDroppables($el){

        //inline droppables:
        $el.find('span.qti-word-wrap, span.qti-droppable').replaceWith(function(){
            return $(this).text();
        });

        restoreTmpCol($el);

        $el.find('#qti-inline-element-placeholder, #qti-block-element-placeholder, .new-col, .grid-row-new').remove();

        $el.off('.gridEdit.gridDragDrop');
        $el.find('[class^="col-"], [class*=" col-"]').off('.gridEdit.gridDragDrop').removeAttr('style');

    }

});