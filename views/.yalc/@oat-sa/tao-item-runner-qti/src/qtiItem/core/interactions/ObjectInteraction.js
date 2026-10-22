import QtiBlockInteraction from 'taoQtiItem/qtiItem/core/interactions/BlockInteraction';
import QtiObject from 'taoQtiItem/qtiItem/core/Object';
var QtiObjectInteraction = QtiBlockInteraction.extend({
    //common methods to object containers (start)
    initObject: function(object) {
        this.object = object || new QtiObject();
    },
    getObject: function() {
        return this.object;
    }
    //common methods to object containers (end)
});

export default QtiObjectInteraction;
