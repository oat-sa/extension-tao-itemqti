/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 *
 */
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

       //remove toolbar title, because it is too large
       this.$container.find('.tlb-title').remove();
    };

    InlineChoiceInteractionWidget.renderChoice = function(choice, shuffleChoice){

        const dir = choice.getRootElement().getBody().attributes.dir;
        const tplData = {
            tag : choice.qtiClass,
            serial : choice.serial,
            attributes : choice.attributes,
            body : _.unescape(choice.text),
            interactionShuffle:shuffleChoice,
            dir : dir
        };

        return inlineChoiceTpl(tplData);
    };


    InlineChoiceInteractionWidget.renderInteraction = function(){

        const _this = this;
        const interaction = this.element;
        const shuffleChoice = interaction.attr('shuffle');
        const dir = this.element.getRootElement().getBody().getAttributes().dir;
        const    tplData = {
                tag : interaction.qtiClass,
                serial : interaction.serial,
                attributes : interaction.attributes,
                choices : [],
                dir: dir
            };

        _.each(interaction.getChoices(), function(choice){
            if(Element.isA(choice, 'choice')){
                tplData.choices.push(_this.renderChoice(choice, shuffleChoice));
            }
        });

        return inlineChoiceInteractionTpl(tplData);
    };


    InlineChoiceInteractionWidget.buildChoice = function(choice, options){

        ChoiceWidget.build(
            choice,
            this.$container.find('.widget-inlineChoice[data-serial="' + choice.serial + '"]'),
            this.$choiceOptionForm,
            options
            );
    };

    InlineChoiceInteractionWidget.buildContainer = function(){
        var previous, next;
        //add a space to be able to place the cursor before and after it.
        if(this.$original.length){
            previous = this.$original[0].previousSibling;
            next = this.$original[0].nextSibling;

            if(!previous || (previous.nodeType === 3 && previous.nodeValue === '') || previous.nodeType !== 3){
                this.$original.before('&nbsp;');
            }
            if(!next || (next.nodeType === 3 && next.nodeValue === '') || next.nodeType !== 3){
                this.$original.after('&nbsp;');
            }
        }

        //set the itemContainer where the actual widget should be append and be positioned absolutely
        this.$itemContainer = this.$original.parents('.item-editor-item');

        //prepare html: interaction & choices:
        this.$itemContainer.append(this.renderInteraction());

        this.$container = this.$itemContainer.find('.widget-inlineChoiceInteraction[data-serial=' + this.element.getSerial() + ']');
    };

    return InlineChoiceInteractionWidget;
});
