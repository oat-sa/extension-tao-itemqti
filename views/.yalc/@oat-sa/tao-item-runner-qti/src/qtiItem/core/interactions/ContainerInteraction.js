import BlockInteraction from 'taoQtiItem/qtiItem/core/interactions/BlockInteraction';
import Container from 'taoQtiItem/qtiItem/mixin/Container';
var ContainerInteraction = BlockInteraction.extend({});
Container.augment(ContainerInteraction);
export default ContainerInteraction;
