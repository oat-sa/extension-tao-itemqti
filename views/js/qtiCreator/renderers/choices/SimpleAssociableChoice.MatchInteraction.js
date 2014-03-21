define([
    'taoQtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
    'taoQtiItemCreator/widgets/choices/simpleAssociableChoice/Widget'
], function(SimpleAssociableChoice, SimpleChoiceWidget){
    return {
        qtiClass : 'simpleAssociableChoice.matchInteraction',
        template : SimpleAssociableChoice.template,
        render : function(choice, data){
            //@todo: to be generalized:
            var $container = $('.qti-choice[data-serial="' + choice.getSerial() + '"]');
            SimpleChoiceWidget.build(choice, $container, this.getOption('choiceOptionForm'), data);
        }
    };
});