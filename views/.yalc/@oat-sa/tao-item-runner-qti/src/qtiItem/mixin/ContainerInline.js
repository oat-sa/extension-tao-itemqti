import Mixin from 'taoQtiItem/qtiItem/mixin/Mixin';
import Container from 'taoQtiItem/qtiItem/mixin/Container';
import _ from 'lodash';

var methods = {};
_.extend(methods, Container.methods);
_.extend(methods, {
    initContainer: function(body) {
        Container.methods.initContainer.call(this, body);
        this.bdy.contentModel = 'inlineStatic';
    }
});

export default {
    augment: function(targetClass) {
        Mixin.augment(targetClass, methods);
    },
    methods: methods
};
