define(['taoQtiItem/qtiItem/core/choices/Choice'], function (QtiChoice) { 'use strict';

    QtiChoice = QtiChoice && Object.prototype.hasOwnProperty.call(QtiChoice, 'default') ? QtiChoice['default'] : QtiChoice;

    var QtiGap = QtiChoice.extend({
        qtiClass: 'gap'
    });

    return QtiGap;

});
