define(['taoQtiItem/qtiItem/core/interactions/ObjectInteraction', 'lodash'], function(QtiObjectInteraction, _){
    var QtiGraphicInteraction = QtiObjectInteraction.extend({
        render : function(data, $container){

            var defaultData = {
                'backgroundImage' : this.object.getAttributes(),
                'object' : this.object.render()
            };
            var tplData = _.merge(defaultData, data || {});

            return this._super(tplData, $container);

        }
    });

    return QtiGraphicInteraction;
});

