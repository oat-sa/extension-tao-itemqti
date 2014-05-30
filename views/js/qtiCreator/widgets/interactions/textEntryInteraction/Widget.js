define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/textEntryInteraction'
], function(_, InteractionWidget, states, interactionTpl){

    var TextEntryInteractionWidget = InteractionWidget.clone();

    TextEntryInteractionWidget.initCreator = function(){

        this.registerStates(states);

        InteractionWidget.initCreator.call(this);

        //remove toolbar title, because it is too large
        this.$container.find('.tlb-title').remove();
    };

    TextEntryInteractionWidget.renderInteraction = function(){

        var interaction = this.element,
            tplData = {
            tag : interaction.qtiClass,
            serial : interaction.serial,
            attributes : interaction.attributes
        };

        return interactionTpl(tplData);
    };

    TextEntryInteractionWidget.buildContainer = function(){

        this.$original.before("&nbsp;").after("&nbsp;");

        //set the itemContainer where the actual widget should be append and be positioned absolutely
        this.$itemContainer = this.$original.parents('.item-editor-item');

        //prepare html: interaction & choices:
        this.$itemContainer.append(this.renderInteraction());
        
        this.$container = this.$itemContainer.find('.widget-textEntryInteraction[data-serial=' + this.element.getSerial() + ']');
    };

    return TextEntryInteractionWidget;
});