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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/selectPoint',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage',
    'ui/mediasizer'
], function($, _, __, stateFactory, Question, imageSelector, formElement, minMaxComponentFactory, formTpl, bgImage){
    'use strict';

    /**
     * Question State initialization: set up side bar, editors and shae factory
     */
    var initQuestionState = function initQuestionState(){
    };

    /**
     * Exit the question state, leave the room cleaned up
     */
    var exitQuestionState = function initQuestionState(){
        var widget      = this.widget;
        var interaction = widget.element;
        var valid       = !!interaction.object.attr('data');

        widget.isValid('selectPointInteraction', valid);
    };

    /**
     * The question state for the selectPoint interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Question
     */
    var SelectPointInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    SelectPointInteractionStateQuestion.prototype.initForm = function initForm(){

        var widget      = this.widget;
        var options     = widget.options;
        var interaction = widget.element;
        var $form       = widget.$form;

        $form.html(formTpl({
            baseUrl         : options.baseUrl,
            data            : interaction.object.attr('data'),
            width           : interaction.object.attr('width'),
            height          : interaction.object.attr('height'),
            type            : interaction.object.attr('type')
        }));

        //min and max choices conrols, but without upper bound threshold (spec allows it)
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : {
                value : _.parseInt(interaction.attr('minChoices')) || 0,
                helpMessage : __('The minimum number of choices that the candidate is required to select to form a valid response.')
            },
            max : {
                value : _.parseInt(interaction.attr('maxChoices')) || 0 ,
                helpMessage : __('The maximum number of choices that the candidate is allowed to select.')
            },
            upperThreshold : Infinity
        });

        imageSelector($form, options);

        formElement.initWidget($form);

        bgImage.setupImage(widget);

        //init data change callbacks
        bgImage.setChangeCallbacks(
            widget,
            formElement,
            formElement.getMinMaxAttributeCallbacks($form, 'minChoices', 'maxChoices')
        );
    };

    return SelectPointInteractionStateQuestion;
});
