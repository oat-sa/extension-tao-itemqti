define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiItem/mixin/Container'], function (Element, Container) { 'use strict';

    Element = Element && Object.prototype.hasOwnProperty.call(Element, 'default') ? Element['default'] : Element;
    Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;

    var RubricBlock = Element.extend({
        qtiClass: 'rubricBlock',
        isEmpty: function isEmpty() {
            return !(this.bdy && this.bdy.body());
        }
    });

    Container.augment(RubricBlock);

    return RubricBlock;

});
