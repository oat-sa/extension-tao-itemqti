define(['taoQtiItem/core/Element', 'taoQtiItem/mixin/Container'], function(Element, Container){

    var RubricBlock = Element.extend({
        qtiClass : 'rubricBlock'
    });
    
    Container.augment(RubricBlock);
    
    return RubricBlock;
});