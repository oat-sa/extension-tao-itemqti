define(['taoQtiItem/core/interactions/ObjectInteraction'], function(ObjectInteraction){
    var MediaInteraction = ObjectInteraction.extend({
        qtiClass : 'mediaInteraction',
        render : function(data, $container){

            var defaultData = {
                'media' : this.object.render()
            };
            var tplData = $.extend(true, defaultData, data || {});

            return this._super(tplData, $container);

        }
    });
    return MediaInteraction;
});

