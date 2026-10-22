define(['taoQtiItem/qtiItem/core/choices/TextVariableChoice'], function (QtiTextVariableChoice) { 'use strict';

    QtiTextVariableChoice = QtiTextVariableChoice && Object.prototype.hasOwnProperty.call(QtiTextVariableChoice, 'default') ? QtiTextVariableChoice['default'] : QtiTextVariableChoice;

    var QtiTextEntry = QtiTextVariableChoice.extend({
        qtiClass: 'textEntry'
    });

    return QtiTextEntry;

});
