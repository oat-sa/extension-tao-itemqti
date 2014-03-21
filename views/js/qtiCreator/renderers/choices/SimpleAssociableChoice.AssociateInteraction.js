define([
    'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/Widget'
], function(SimpleAssociableChoice, SimpleChoiceWidget){
    return {
        qtiClass : 'simpleAssociableChoice.associateInteraction',
        template : SimpleAssociableChoice.template,
        render : function(choice, data){
            //@todo: to be generalized:
            var $container = $('.qti-choice[data-serial="' + choice.getSerial() + '"]');
            SimpleChoiceWidget.build(choice, $container, this.getOption('choiceOptionForm'), data);
        }
    };
});