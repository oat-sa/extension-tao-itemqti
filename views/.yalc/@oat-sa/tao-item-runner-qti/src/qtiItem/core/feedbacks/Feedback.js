import IdentifiedElement from 'taoQtiItem/qtiItem/core/IdentifiedElement';
var Feedback = IdentifiedElement.extend({
    is: function(qtiClass) {
        return qtiClass === 'feedback' || this._super(qtiClass);
    }
});
export default Feedback;
