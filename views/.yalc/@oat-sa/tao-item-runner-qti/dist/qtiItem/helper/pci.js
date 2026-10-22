define(['lodash'], function (_) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

    var pci = {
        getRawValues: function (pciVar) {
            if (_.isPlainObject(pciVar)) {
                if (typeof pciVar.base !== 'undefined') {
                    return _.values(pciVar.base);
                } else if (pciVar.list) {
                    return _.values(pciVar.list);
                }
            }
            throw new Error('unsupported type ');
        }
    };

    return pci;

});
