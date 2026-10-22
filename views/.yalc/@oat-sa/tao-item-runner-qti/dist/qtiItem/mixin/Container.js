define(['taoQtiItem/qtiItem/mixin/Mixin', 'taoQtiItem/qtiItem/core/Container'], function (Mixin, Container$1) { 'use strict';

    Mixin = Mixin && Object.prototype.hasOwnProperty.call(Mixin, 'default') ? Mixin['default'] : Mixin;
    Container$1 = Container$1 && Object.prototype.hasOwnProperty.call(Container$1, 'default') ? Container$1['default'] : Container$1;

    var methods = {
        initContainer: function(body) {
            this.bdy = new Container$1(body || '');
            this.bdy.setRootElement(this.getRootElement() || null);
            this.bdy.contentModel = 'blockStatic';
        },
        getBody: function() {
            return this.bdy;
        },
        body: function(body) {
            var ret = this.bdy.body(body);
            return body ? this : ret; //for method chaining on get
        },
        setElement: function(element, body) {
            this.bdy.setElement(element, body);
            return this;
        },
        removeElement: function(element) {
            return this.bdy.removeElement(element);
        },
        getElements: function(qtiClass) {
            return this.bdy.getElements(qtiClass);
        },
        getElement: function(serial) {
            return this.bdy.getElement(serial);
        }
    };

    var Container = {
        augment: function(targetClass) {
            Mixin.augment(targetClass, methods);
        },
        methods: methods
    };

    return Container;

});
