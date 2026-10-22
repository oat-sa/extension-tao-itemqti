import QtiObjectInteraction from 'taoQtiItem/qtiItem/core/interactions/ObjectInteraction';
import _ from 'lodash';
import rendererConfig from 'taoQtiItem/qtiItem/helper/rendererConfig';
var QtiGraphicInteraction = QtiObjectInteraction.extend({
    render: function() {
        var args = rendererConfig.getOptionsFromArguments(arguments),
            renderer = args.renderer || this.getRenderer(),
            defaultData = {
                backgroundImage: this.object.getAttributes(),
                object: this.object.render(renderer)
            };

        return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
    }
});

export default QtiGraphicInteraction;
