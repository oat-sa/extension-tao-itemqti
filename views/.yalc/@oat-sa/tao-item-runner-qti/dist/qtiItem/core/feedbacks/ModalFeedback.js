define(['taoQtiItem/qtiItem/core/IdentifiedElement', 'taoQtiItem/qtiItem/mixin/Container'], function (IdentifiedElement, Container) { 'use strict';

    IdentifiedElement = IdentifiedElement && Object.prototype.hasOwnProperty.call(IdentifiedElement, 'default') ? IdentifiedElement['default'] : IdentifiedElement;
    Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;

    var ModalFeedback = IdentifiedElement.extend({
        qtiClass: 'modalFeedback',
        is: function(qtiClass) {
            return qtiClass === 'feedback' || this._super(qtiClass);
        }
    });

    Container.augment(ModalFeedback);

    return ModalFeedback;

});
