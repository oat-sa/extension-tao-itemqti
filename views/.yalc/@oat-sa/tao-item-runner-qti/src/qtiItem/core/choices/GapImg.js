import QtiChoice from 'taoQtiItem/qtiItem/core/choices/Choice';
import QtiObject from 'taoQtiItem/qtiItem/core/Object';
var QtiGapImg = QtiChoice.extend({
    qtiClass: 'gapImg',
    //common methods to object containers (start)
    initObject: function(object) {
        this.object = object || new QtiObject();
    },
    getObject: function() {
        return this.object;
    }
    //common methods to object containers (end)
});
export default QtiGapImg;
