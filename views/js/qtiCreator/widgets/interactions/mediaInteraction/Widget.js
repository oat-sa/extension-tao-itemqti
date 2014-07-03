define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states'
], function(_, Widget, states){
    
    var MediaInteractionWidget = _.extend(Widget.clone(), {

        initCreator : function(){
            var self = this; 
            var $container  = this.$original;
            var $itemBody   = $container.parents('.qti-itemBody');

            this.registerStates(states);            
            Widget.initCreator.call(this);
            
            $itemBody
              .off('resizestop.gridEdit.' + this.element.serial)
              .on('resizestop.gridEdit.' + this.element.serial, _.throttle(function(){
                var width = $container.innerWidth();
                if(width > 0){
                    self.element.object.attr('width', $container.innerWidth());
                    self.rebuild(); 
                }
            }, 10));
        },
    
        destroy : function(){

            var $container = this.$original;
            var $itemBody  = $container.parents('.qti-itemBody');

            //stop listening the resize
            $itemBody.off('resizestop.gridEdit.' + this.element.serial);

            //call parent destroy
            Widget.destroy.call(this);
        }
    });

    return MediaInteractionWidget;
});
