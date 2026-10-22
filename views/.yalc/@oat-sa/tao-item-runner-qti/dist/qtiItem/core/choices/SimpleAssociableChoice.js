define(['taoQtiItem/qtiItem/core/choices/ContainerChoice'], function (QtiContainerChoice) { 'use strict';

    QtiContainerChoice = QtiContainerChoice && Object.prototype.hasOwnProperty.call(QtiContainerChoice, 'default') ? QtiContainerChoice['default'] : QtiContainerChoice;

    var QtiSimpleAssociableChoice = QtiContainerChoice.extend({
        qtiClass: 'simpleAssociableChoice'
    });

    return QtiSimpleAssociableChoice;

});
