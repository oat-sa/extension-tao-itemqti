define(['taoQtiItem/qtiItem/core/choices/Choice', 'taoQtiItem/qtiItem/mixin/ContainerInline'], function (Choice, Container) { 'use strict';

    Choice = Choice && Object.prototype.hasOwnProperty.call(Choice, 'default') ? Choice['default'] : Choice;
    Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;

    var Hottext = Choice.extend({
        qtiClass: 'hottext'
    });

    Container.augment(Hottext);

    return Hottext;

});
