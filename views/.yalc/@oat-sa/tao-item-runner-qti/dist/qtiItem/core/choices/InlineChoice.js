define(['taoQtiItem/qtiItem/core/choices/ContainerInlineChoice'], function (QtiContainerChoice) { 'use strict';

    QtiContainerChoice = QtiContainerChoice && Object.prototype.hasOwnProperty.call(QtiContainerChoice, 'default') ? QtiContainerChoice['default'] : QtiContainerChoice;

    var QtiInlineChoice = QtiContainerChoice.extend({
        qtiClass: 'inlineChoice'
    });

    return QtiInlineChoice;

});
