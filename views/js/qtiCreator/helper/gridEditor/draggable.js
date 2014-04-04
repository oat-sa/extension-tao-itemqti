define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/core/qtiElements',
    'taoQtiItem/qtiCreator/helper/gridEditor/droppable',
    'jqueryui'
], function($, _, QtiElements, droppable){
    
    var _insertableDefaultsOptions = {
        helper : function(){
            return $(this).clone().css('z-index', 99);
        },
        drop : function(){
            //to be implemented
        }
    };
    
    var createInsertable = function createInsertable($el, $to, opts){

        var options = _.clone(_insertableDefaultsOptions);
        _.extend(options, opts);

        createDraggable($el, $to, {
            helper : options.helper,
            drop : options.drop
        });
    };

    var createDraggable = function createDraggable($el, $to, options){

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
                    droppable.createDroppableBlocks($to, options);
                }else if(QtiElements.isInline(qtiClass)){
                    droppable.createDroppableInlines($to, options);
                }else{
                    throw 'undefined qti class';
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
                droppable.destroyDroppables($to);

                $to.trigger('dragoverstop.gridEdit');
            }
        });

        $el.on('mousedown.gridDraggable.gridEdit', function(){
            $(this).addClass('grid-draggable-active');
        }).on('mouseup.gridDraggable.gridEdit', function(){
            $(this).removeClass('grid-draggable-active');
        });
    };

    var createMovable = function createMovable($el, $to){

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
                _destroyDraggables($el);
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
    };

    var _destroyDraggables = function _destroyDraggables($el){
        $el.draggable('destroy');
        $el.off('.gridDraggable');
    };

    return {
        createInsertable : function($el, $to, opts){
            createInsertable($el, $to, opts);
        },
        createMovable : function($el, $to, opts){
            createMovable($el, $to, opts);
        }
    };
});