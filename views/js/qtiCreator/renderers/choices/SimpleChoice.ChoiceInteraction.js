define([
    'taoQtiCommonRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
    'taoQtiItemCreator/widgets/choices/simpleChoice/choiceInteraction/Widget'
], function(SimpleChoice, SimpleChoiceWidget){
    return {
        qtiClass : 'simpleChoice.choiceInteraction',
        template : SimpleChoice.template,
        render : function(choice, data){
            //@todo: to be generalized:
            var $container = $('.qti-choice[data-serial="' + choice.getSerial() + '"]');
            SimpleChoiceWidget.build(choice, $container, this.getOption('choiceOptionForm'), data);
        }
    };
});