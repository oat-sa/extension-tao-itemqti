define(['taoQtiItem/qtiItem/core/choices/Hotspot'], function (QtiHotspot) { 'use strict';

    QtiHotspot = QtiHotspot && Object.prototype.hasOwnProperty.call(QtiHotspot, 'default') ? QtiHotspot['default'] : QtiHotspot;

    var QtiAssociableHotspot = QtiHotspot.extend({
        qtiClass: 'associableHotspot'
    });

    return QtiAssociableHotspot;

});
