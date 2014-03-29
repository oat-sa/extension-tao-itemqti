define(['taoQtiItem/qtiItem/core/interactions/ObjectInteraction', 'lodash'], function(QtiObjectInteraction, _){
    var QtiGraphicInteraction = QtiObjectInteraction.extend({
        render : function(data, $container, subclass, renderer){
            
            renderer = renderer || this.getRenderer();
            
            var defaultData = {
                'backgroundImage' : this.object.getAttributes(),
                'object' : this.object.render({}, null, '', renderer)
            };
            var tplData = _.merge(defaultData, data || {});

            return this._super(tplData, $container, subclass, renderer);

        }
    });

    return QtiGraphicInteraction;
});

