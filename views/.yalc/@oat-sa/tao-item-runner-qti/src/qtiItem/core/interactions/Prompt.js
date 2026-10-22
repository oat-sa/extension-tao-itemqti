import Element from 'taoQtiItem/qtiItem/core/Element';
import Container from 'taoQtiItem/qtiItem/mixin/ContainerInline';
var Prompt = Element.extend({ qtiClass: 'prompt' });
Container.augment(Prompt);
export default Prompt;
