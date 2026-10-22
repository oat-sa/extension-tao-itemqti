define(['taoQtiItem/qtiItem/core/choices/Choice', 'taoQtiItem/qtiItem/core/Object'], function (QtiChoice, QtiObject) { 'use strict';

    QtiChoice = QtiChoice && Object.prototype.hasOwnProperty.call(QtiChoice, 'default') ? QtiChoice['default'] : QtiChoice;
    QtiObject = QtiObject && Object.prototype.hasOwnProperty.call(QtiObject, 'default') ? QtiObject['default'] : QtiObject;

    var QtiGapImg = QtiChoice.extend({
        qtiClass: 'gapImg',
        //common methods to object containers (start)
        initObject: function(object) {
            this.object = object || new QtiObject();
        },
        getObject: function() {
            return this.object;
        }
        //common methods to object containers (end)
    });

    return QtiGapImg;

});
