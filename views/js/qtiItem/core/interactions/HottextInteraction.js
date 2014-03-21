define(['taoQtiItem/core/interactions/ContainerInteraction', 'taoQtiItem/core/Element'], function(ContainerInteraction, Element){
    var HottextInteraction = ContainerInteraction.extend({
        qtiClass : 'hottextInteraction',
        getChoices : function(){
            return this.getBody().getElements('Hottext');
        },
        removeChoice:function(hottext){
            var serial = '';
            if(typeof(hottext) === 'string'){
                serial = hottext;
            }else if(Element.isA('hottext')){
                serial = hottext.getSerial();
            }
            this.getBody().removeElement(serial);
            return this;
        }
    });
    return HottextInteraction;
});


