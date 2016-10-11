define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiItem/mixin/Container'], function(Element, Container){

    var RubricBlock = Element.extend({
        qtiClass : 'rubricBlock',
        isEmpty : function isEmpty(){
            return !(this.bdy && this.bdy.body());
        }
    });
    
    Container.augment(RubricBlock);
    
    return RubricBlock;
});