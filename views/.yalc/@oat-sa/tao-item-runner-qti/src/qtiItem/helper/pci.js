import _ from 'lodash';

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

export default pci;
