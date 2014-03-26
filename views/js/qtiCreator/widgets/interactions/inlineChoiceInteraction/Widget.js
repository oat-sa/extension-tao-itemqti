define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/inlineChoiceInteraction',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/inlineChoice'
], function(_, Element, ChoiceWidget, InteractionWidget, inlineChoiceInteractionTpl, inlineChoiceTpl){

    var InlineInteractionWidget = InteractionWidget.clone();

    InlineInteractionWidget.initCreator = function(options){

        var _this = this;

        InteractionWidget.initCreator.call(this);

        this.$choiceOptionForm = options.choiceOptionForm;
        _.each(this.element.getChoices(), function(choice){
            _this.buildChoice(choice);
        });
    };

    InlineInteractionWidget.renderChoice = function(choice){

        var tplData = {
            'tag' : choice.qtiClass,
            'serial' : choice.serial,
            'attributes' : choice.attributes
        };

        return inlineChoiceTpl(tplData);
    };


    InlineInteractionWidget.renderInteraction = function(){

        var _this = this,
            interaction = this.element,
            tplData = {
            'tag' : interaction.qtiClass,
            'serial' : interaction.serial,
            'attributes' : interaction.attributes,
            'choices' : []
        };

        _.each(this.choices, function(choice){
            if(Element.isA(choice, 'choice')){
                tplData.choices.push(_this.renderChoice(choice));
            }
        });

        return inlineChoiceInteractionTpl(tplData);
    };


    InlineInteractionWidget.buildChoice = function(choice, options){

        ChoiceWidget.build(
            choice,
            this.$container.find('.choice[data-serial="' + choice.serial + '"]'),
            this.$choiceOptionForm,
            options
        );
    };

    InlineInteractionWidget.buildContainer = function(){

        //prepare html: interaction & choices:
        this.$itemContainer.append(this.renderInteraction());
    };

    return InlineInteractionWidget;
});