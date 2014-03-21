define([
    'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
    'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/orderInteraction/Widget'
], function(SimpleChoice, SimpleChoiceWidget){
    return {
        qtiClass : 'simpleChoice.orderInteraction',
        template : SimpleChoice.template,
        render : function(choice, data){
            //@todo: to be generalized:
            var $container = $('.qti-choice[data-serial="' + choice.getSerial() + '"]');
            SimpleChoiceWidget.build(choice, $container, this.getOption('choiceOptionForm'), data);
        }
    };
});