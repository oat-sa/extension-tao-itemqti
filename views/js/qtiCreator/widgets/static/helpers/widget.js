define(['jquery', 'lodash'], function($, _){

    var helper = {
        buildInlineContainer : function(widget){
            
            var $wrap = $('<span>', {
                'data-serial' : widget.element.serial,
                'class' : 'widget-box widget-inline widget-'+widget.element.qtiClass,
                'data-qti-class' : widget.element.qtiClass
            });
            widget.$container = widget.$original.wrap($wrap).parent();
        },
        buildBlockContainer : function(widget){
        
            var $wrap = $('<div>', {
                'data-serial' : widget.element.serial,
                'class' : 'widget-box widget-block widget-'+widget.element.qtiClass,
                'data-qti-class' : widget.element.qtiClass
            });
            widget.$container = widget.$original.wrap($wrap).parent();
        },
        createToolbar : function(widget, toolbarTpl){
        
            if(_.isFunction(toolbarTpl)){

                var $tlb = $(toolbarTpl({
                    serial : widget.serial,
                    state : 'active'
                }));

                widget.$container.append($tlb);

                $tlb.find('[data-role="delete"]').on('click.widget-box', function(e){
                    e.stopPropagation();//to prevent direct deleting;
                    widget.changeState('deleting');
                });

            }else{
                throw 'the toolbarTpl must be a handlebars function';
            }
        }
    };

    return helper;
});