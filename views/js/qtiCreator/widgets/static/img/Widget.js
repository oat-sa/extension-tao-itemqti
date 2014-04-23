define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/img/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media'
], function(Widget, states, toolbarTpl) {

    var ImgWidget = Widget.clone();

    ImgWidget.initCreator = function() {

        Widget.initCreator.call(this);

        this.registerStates(states);
    };
    
    ImgWidget.buildContainer = function(){

        var $wrap = $('<span>', {
            'data-serial' : this.element.serial, 
            'class' : 'widget-box widget-inline', 
            'data-qti-class' : this.element.qtiClass
        });
        this.$container = this.$original.wrap($wrap).parent();
        
        return this;
    };
    
    ImgWidget.createToolbar = function() {
        
        var $tlb = $(toolbarTpl({
                serial: this.serial,
                state: 'active'
            })),
            _this = this;
        
        this.$container.append($tlb);
        
        $tlb.find('[data-role="delete"]').on('click.widget-box', function(e){
            e.stopPropagation();//to prevent direct deleting;
            _this.changeState('deleting');
        });

        return this;
    };

    return ImgWidget;
});