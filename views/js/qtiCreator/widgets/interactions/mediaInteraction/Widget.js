define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction'
], function($, _, Widget, states, MediaInteractionCommonRenderer){
    
    var MediaInteractionWidget = _.extend(Widget.clone(), {

        initCreator : function(){
            var self = this; 
            var $container  = this.$original;
            var $itemWidget   = $container.parents('.qti-item');

            this.registerStates(states);            
            Widget.initCreator.call(this);
            
            var resizingEvents = [
                'resize.gridEdit.'+ this.element.serial,
                'resize.qti-widget.'+ this.element.serial
            ];
            
            $itemWidget.closest('.qti-item')
              .off(this.element.serial)
              .on(resizingEvents.join(' '), _.throttle(function(e){
                
                if($(e.target).find('[data-serial]').first().data('serial') === self.element.serial){
                    var width = $container.innerWidth();
                    if(width > 0){
                        self.element.object.attr('width', $container.innerWidth());
                        self.destroyInteraction();
                        self.renderInteraction();
                    }
                }
            }, 100));
        },
    
        destroy : function(){

            var $container = this.$original;
            var $itemBody  = $container.parents('.qti-itemBody');

            //stop listening the resize
            $itemBody.off('resize.gridEdit.' + this.element.serial);

            //call parent destroy
            Widget.destroy.call(this);
        },

        renderInteraction : function(){
            var $container  = this.$original; 
            var interaction = this.element;
            MediaInteractionCommonRenderer.render.call(interaction.getRenderer(), interaction, {
                features : 'full',
                controlPlaying : false
            });
        },

        destroyInteraction : function(){
            var interaction = this.element;
            MediaInteractionCommonRenderer.destroy.call(interaction.getRenderer(), interaction);    
        }
    });

    return MediaInteractionWidget;
});
