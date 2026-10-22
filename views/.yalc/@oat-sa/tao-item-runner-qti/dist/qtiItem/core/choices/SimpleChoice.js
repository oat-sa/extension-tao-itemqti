define(['taoQtiItem/qtiItem/core/choices/ContainerChoice'], function (QtiContainerChoice) { 'use strict';

    QtiContainerChoice = QtiContainerChoice && Object.prototype.hasOwnProperty.call(QtiContainerChoice, 'default') ? QtiContainerChoice['default'] : QtiContainerChoice;

    var QtiSimpleChoice = QtiContainerChoice.extend({
        qtiClass: 'simpleChoice'
    });

    return QtiSimpleChoice;

});
