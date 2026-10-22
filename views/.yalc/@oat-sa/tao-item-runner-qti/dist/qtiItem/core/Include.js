define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiItem/mixin/ContainerInline', 'taoQtiItem/qtiItem/mixin/NamespacedElement'], function (Element, Container, NamespacedElement) { 'use strict';

    Element = Element && Object.prototype.hasOwnProperty.call(Element, 'default') ? Element['default'] : Element;
    Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;
    NamespacedElement = NamespacedElement && Object.prototype.hasOwnProperty.call(NamespacedElement, 'default') ? NamespacedElement['default'] : NamespacedElement;

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

    return Include;

});
