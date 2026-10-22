import Choice from 'taoQtiItem/qtiItem/core/choices/Choice';
import Container from 'taoQtiItem/qtiItem/mixin/ContainerInline';

var ContainerChoice = Choice.extend({
    init: function(serial, attributes) {
        this._super(serial, attributes);
    },
    is: function(qtiClass) {
        return qtiClass === 'containerChoice' || this._super(qtiClass);
    }
});

Container.augment(ContainerChoice);

export default ContainerChoice;
