define(['taoQtiItem/qtiItem/core/interactions/ObjectInteraction'], function(ObjectInteraction){
    var MediaInteraction = ObjectInteraction.extend({
        qtiClass : 'mediaInteraction',
        render : function(data, $container, subclass, renderer){
            
            renderer = renderer || this.getRenderer();
            var defaultData = {
                'media' : this.object.render({}, null, '', renderer)
            };
            var tplData = $.extend(true, defaultData, data || {});

            return this._super(tplData, $container, subclass, renderer);

        }
    });
    return MediaInteraction;
});

