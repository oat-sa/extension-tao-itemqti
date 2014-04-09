define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/Widget'
], function(_, SimpleAssociableChoice, SimpleChoiceWidget){
    
    var CreatorSimpleAssociableChoice = _.clone(SimpleAssociableChoice);

    CreatorSimpleAssociableChoice.render = function(choice, options){
        
        SimpleAssociableChoiceWidget.build(
            choice,
            SimpleAssociableChoice.getContainer(choice),
            this.getOption('choiceOptionForm'),
            options
        );
    };

    return CreatorSimpleAssociableChoice;
});