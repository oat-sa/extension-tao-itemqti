import Choice from 'taoQtiItem/qtiItem/core/choices/Choice';
import Container from 'taoQtiItem/qtiItem/mixin/ContainerInline';

var Hottext = Choice.extend({
    qtiClass: 'hottext'
});

Container.augment(Hottext);

export default Hottext;
