define(['taoQtiItem/core/Element', 'taoQtiItem/mixin/ContainerInline'], function(Element, Container){
    var Prompt = Element.extend({qtiClass : 'prompt'});
    Container.augment(Prompt);
    return Prompt;
});