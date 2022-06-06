/**
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
 * Copyright (c) 2014-2017 Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.content',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function ($, stateFactory, QuestionState, contentToolbarTpl, formElement) {
    'use strict';

    var SimpleAssociableChoiceStateQuestion = stateFactory.extend(QuestionState);

    SimpleAssociableChoiceStateQuestion.prototype.createToolbar = function () {

        var _widget = this.widget,
            $container = _widget.$container,
            choice = _widget.element,
            interaction,
            options = _widget.options,
            $toolbar = $container.find('.mini-tlb').not('[data-html-editable] *');

        if (!$toolbar.length) {

            interaction = choice.getInteraction();
            const shuffleIsVisible = options.shuffleIsVisible;

            //add mini toolbars
            $toolbar = $(contentToolbarTpl({
                choiceSerial: choice.getSerial(),
                interactionSerial: interaction.getSerial(),
                fixed: choice.attr('fixed'),
                interactionShuffle: shuffleIsVisible && interaction.attr('shuffle')
            }));

            $container.children('.inner-wrapper').append($toolbar);

            //set toolbar button behaviour:
            if(shuffleIsVisible) {
                formElement.initShufflePinToggle(_widget);
            }
            
            formElement.initDelete(_widget);
        }

        return $toolbar;
    };

    return SimpleAssociableChoiceStateQuestion;
});
