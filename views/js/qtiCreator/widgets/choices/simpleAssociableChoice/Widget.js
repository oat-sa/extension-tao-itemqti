define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/states'
], function(Widget, states){

    var SimpleAssociableChoiceWidget = Widget.clone();

    SimpleAssociableChoiceWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
        
        //need to wrap the container + tlb around a div because in mathInteraction, tlb cannot be position absolutely in <th>
        this.$container.wrapInner($('<div>', {'class' : 'inner-wrapper'}));
    };

    return SimpleAssociableChoiceWidget;
});