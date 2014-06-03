define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Choice',
    'taoQtiItem/qtiItem/core/Element'
], function(stateFactory, Choice, SimpleAssociableChoice, Element){

    var GapTextStateChoice = stateFactory.extend(Choice, function(){
        
        var _widget = this.widget;
        
        //listener to other siblings choice mode
        _widget.beforeStateInit(function(e, element, state){
            
            if(Element.isA(element, 'choice') && _widget.interaction.getBody().getElement(element.serial)){//@todo hottext an
                
                if(state.name === 'choice' && element.serial !== _widget.serial){
                    _widget.changeState('question');
                }
                
            }
            
        }, 'otherActive');
        
    }, function(){
        
        this.widget.offEvents('otherActive');
    });

    GapTextStateChoice.prototype.initForm = function(){
        SimpleAssociableChoice.prototype.initForm.call(this);
    };

    return GapTextStateChoice;
});