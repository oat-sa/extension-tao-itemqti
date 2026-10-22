define(['taoQtiItem/qtiItem/mixin/Mixin', 'taoQtiItem/qtiItem/mixin/Container', 'lodash'], function (Mixin, Container, _) { 'use strict';

    Mixin = Mixin && Object.prototype.hasOwnProperty.call(Mixin, 'default') ? Mixin['default'] : Mixin;
    Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

    var methods = {};
    _.extend(methods, Container.methods);
    _.extend(methods, {
        initContainer: function(body) {
            Container.methods.initContainer.call(this, body);
            this.bdy.contentModel = 'inlineStatic';
        }
    });

    var ContainerInline = {
        augment: function(targetClass) {
            Mixin.augment(targetClass, methods);
        },
        methods: methods
    };

    return ContainerInline;

});
