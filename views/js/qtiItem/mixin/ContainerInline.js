define(['taoQtiItem/mixin/Mixin', 'taoQtiItem/mixin/Container', 'lodash'], function(Mixin, Container, _){
    
    var methods = {};
    _.extend(methods, Container.methods);
    _.extend(methods, {
        initContainer:function(body){
            Container.methods.initContainer.call(this, body);
            this.bdy.contentModel = 'inlineStatic';
        }
    });

    return {
        augment : function(targetClass){
            Mixin.augment(targetClass, methods);
        },
        methods : methods
    };
});