import Element from 'taoQtiItem/qtiItem/core/Element';
import Container from 'taoQtiItem/qtiItem/mixin/ContainerInline';
import NamespacedElement from 'taoQtiItem/qtiItem/mixin/NamespacedElement';

var Include = Element.extend({
    qtiClass: 'include',
    defaultNsName: 'xi',
    defaultNsUri: 'http://www.w3.org/2001/XInclude',
    nsUriFragment: 'XInclude',
    isEmpty: function() {
        return !this.attr('href') || this.getBody().isEmpty();
    }
});
Container.augment(Include);
NamespacedElement.augment(Include);
export default Include;
