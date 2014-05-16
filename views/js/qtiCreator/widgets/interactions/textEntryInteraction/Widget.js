define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/textEntryInteraction',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/textEntry'
], function(_, Element, InteractionWidget, ChoiceWidget, states, textEntryInteractionTpl, textEntryChoiceTpl){

    var TextEntryInteractionWidget = InteractionWidget.clone();

    TextEntryInteractionWidget.initCreator = function(options){

        var _this = this;

        this.registerStates(states);

        InteractionWidget.initCreator.call(this);

        this.$choiceOptionForm = options.choiceOptionForm;
        _.each(this.element.getChoices(), function(choice){
            _this.buildChoice(choice);
        });

       //remove toolbar title, because it is too large
       this.$container.find('.tlb-title').remove();
    };
    
    TextEntryInteractionWidget.renderChoice = function(choice, shuffleChoice){

        var tplData = {
            tag : choice.qtiClass,
            serial : choice.serial,
            attributes : choice.attributes,
            body : choice.text,
            interactionShuffle:shuffleChoice
        };

        return textEntryChoiceTpl(tplData);
    };


    TextEntryInteractionWidget.renderInteraction = function(){
        var _this = this,
            interaction = this.element,
            shuffleChoice = interaction.attr('shuffle'),
            tplData = {
                tag : interaction.qtiClass,
                serial : interaction.serial,
                attributes : interaction.attributes,
                choices : []
            };

        _.each(interaction.getChoices(), function(choice){
            if(Element.isA(choice, 'choice')){
                tplData.choices.push(_this.renderChoice(choice, shuffleChoice));
            }
        });

        return textEntryInteractionTpl(tplData);
    };
    
    TextEntryInteractionWidget.buildChoice = function(choice, options){

        ChoiceWidget.build(
            choice,
            this.$container.find('.widget-textEntry[data-serial="' + choice.serial + '"]'),
            this.$choiceOptionForm,
            options
            );
    };
    
    TextEntryInteractionWidget.buildContainer = function(){
        
        //set the itemContainer where the actual widget should be append and be positioned absolutely
        this.$itemContainer = this.$original.parents('.item-editor-item');

        //prepare html: interaction & choices:
        this.$itemContainer.append(this.renderInteraction());

        this.$container = this.$itemContainer.find('.widget-textEntryInteraction[data-serial=' + this.element.getSerial() + ']');
    };
    
    return TextEntryInteractionWidget;
});