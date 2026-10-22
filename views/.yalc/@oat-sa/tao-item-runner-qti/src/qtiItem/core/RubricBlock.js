import Element from 'taoQtiItem/qtiItem/core/Element';
import Container from 'taoQtiItem/qtiItem/mixin/Container';

var RubricBlock = Element.extend({
    qtiClass: 'rubricBlock',
    isEmpty: function isEmpty() {
        return !(this.bdy && this.bdy.body());
    }
});

Container.augment(RubricBlock);

export default RubricBlock;
