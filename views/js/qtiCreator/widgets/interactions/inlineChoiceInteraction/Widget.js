define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/inlineChoiceInteraction',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/inlineChoice'
], function(_, Element, InteractionWidget, ChoiceWidget, states, inlineChoiceInteractionTpl, inlineChoiceTpl){

    var InlineChoiceInteractionWidget = InteractionWidget.clone();

    InlineChoiceInteractionWidget.initCreator = function(options){

        var _this = this;

        this.registerStates(states);

        InteractionWidget.initCreator.call(this);

        this.$choiceOptionForm = options.choiceOptionForm;
        _.each(this.element.getChoices(), function(choice){
            _this.buildChoice(choice);
        });


    };

    InlineChoiceInteractionWidget.renderChoice = function(choice){

        var tplData = {
            tag : choice.qtiClass,
            serial : choice.serial,
            attributes : choice.attributes,
            body : choice.text
        };

        return inlineChoiceTpl(tplData);
    };


    InlineChoiceInteractionWidget.renderInteraction = function(){

        var _this = this,
            interaction = this.element,
            tplData = {
            tag : interaction.qtiClass,
            serial : interaction.serial,
            attributes : interaction.attributes,
            choices : []
        };

        _.each(interaction.getChoices(), function(choice){
            if(Element.isA(choice, 'choice')){
                tplData.choices.push(_this.renderChoice(choice));
            }
        });

        return inlineChoiceInteractionTpl(tplData);
    };


    InlineChoiceInteractionWidget.buildChoice = function(choice, options){

        ChoiceWidget.build(
            choice,
            this.$container.find('.choice[data-serial="' + choice.serial + '"]'),
            this.$choiceOptionForm,
            options
            );
    };

    InlineChoiceInteractionWidget.buildContainer = function(){

        //set the itemContainer where the actual widget should be append and be positioned absolutely
        var item = this.element.getRelatedItem();
        this.$itemContainer = $('.qti-item[data-serial=' + item.getSerial() + ']');

        //prepare html: interaction & choices:
        this.$itemContainer.append(this.renderInteraction());

        this.$container = this.$itemContainer.find('.widget-inlineChoiceInteraction[data-serial=' + this.element.getSerial() + ']');
    };

    return InlineChoiceInteractionWidget;
});