import IdentifiedElement from 'taoQtiItem/qtiItem/core/IdentifiedElement';
import Container from 'taoQtiItem/qtiItem/mixin/Container';

var ModalFeedback = IdentifiedElement.extend({
    qtiClass: 'modalFeedback',
    is: function(qtiClass) {
        return qtiClass === 'feedback' || this._super(qtiClass);
    }
});

Container.augment(ModalFeedback);

export default ModalFeedback;
