define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Choice',
    'taoQtiItem/qtiCreator/helper/adaptSize'
], function(stateFactory, Choice, adaptSize){

    var AssociateInteractionStateChoice = stateFactory.extend(Choice, function(){

        var resultArea = this.widget.$container.find('.result-area'),
            choiceArea = this.widget.$container.find('.choice-area'),
            addOption = choiceArea.find('.add-option'),
            getElements = function() {
                return choiceArea.find('.qti-choice').add(resultArea.find('.target'));
            };

        choiceArea.on('keyup', function(e){
            var target = $(e.target).closest('.qti-choice'),
                height,
                previousHeight = target.prop('previous-height') || 0;

//            // resetting may seem silly but trust me it's a must
//            target.height('auto');
            height = target.height();

//            // if height hasn't changed do nothing
//            if(height === previousHeight) {
//                return true;
//            }
            target.prop('previous-height', height);

            adaptSize.height(getElements(), false);
        });

        addOption.on('click', function() {
            adaptSize.height(getElements());
        })
        
    }, function(){
        
    });

    return AssociateInteractionStateChoice;
});