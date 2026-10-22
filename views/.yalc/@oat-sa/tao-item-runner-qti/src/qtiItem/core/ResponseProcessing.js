import Element from 'taoQtiItem/qtiItem/core/Element';

var ResponseProcessing = Element.extend({
    qtiClass: 'responseProcessing',
    processingType: '',
    xml: '',
    toArray: function() {
        var arr = this._super();
        arr.processingType = this.processingType;
        arr.xml = this.xml;
        return arr;
    }
});

export default ResponseProcessing;
