define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Choice',
    'taoQtiItem/qtiCreator/helper/adaptSize',
    'jquery.sizeChange'
], function(stateFactory, Choice, adaptSize){

    var AssociateInteractionStateChoice = stateFactory.extend(Choice, function(){
        
        var $container = this.widget.$container;
        
        var resultArea = this.widget.$container.find('.result-area'),
            choiceArea = this.widget.$container.find('.choice-area'),
            addOption = choiceArea.find('.add-option'),
            getElements = function() {
                return choiceArea.find('.qti-choice').add(resultArea.find('.target')).add(addOption);
            };

//        $container.on('keyup.choice contentChange.gridEdit.choice contentChange.qti-widget.choice', '.choice-area', function(){
//            adaptSize.height(getElements(), false);
//        }).on('click.choice', '.add-option', function(){
//            adaptSize.height(getElements());
//        });

        $container.sizeChange(function() {
            adaptSize.height(getElements());
        });
        
    }, function(){
        
        this.widget.$container.off('.choice');
        
    });

    return AssociateInteractionStateChoice;
});