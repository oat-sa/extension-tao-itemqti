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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/order',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'services/features',
    'ui/liststyler'
], function (
    _,
    stateFactory,
    Question,
    formElement,
    minMaxComponentFactory,
    formTpl,
    sizeAdapter,
    features
) {
    'use strict';

    var OrderInteractionStateQuestion = stateFactory.extend(Question);

    function getPosition(interaction) {
        return (
            interaction.attr('data-position') ||
            extractPositionFromClass(interaction.attr('class')) ||
            'top'
        );
    }

    function applyPosition($interaction, position) {
        const baseClass = $interaction.attr('class') || '';
        const newClass = normalizePositionClass(baseClass, position);
        $interaction.attr('class', newClass);
    }

    function extractPositionFromClass(classAttr) {
        if (!classAttr) {
            return 'top';
        }
        if (classAttr.includes('qti-choices-bottom')) return 'bottom';
        if (classAttr.includes('qti-choices-left')) return 'left';
        if (classAttr.includes('qti-choices-right')) return 'right';
        return 'top';
    }

   function normalizePositionClass(classAttr, position) {
    const classes = (classAttr || '')
        .split(/\s+/)
        .filter(Boolean)
        .filter(c => !c.startsWith('qti-choices-'));

    if (!classes.length) {
        console.warn('normalizePositionClass: empty base class');
    }

    classes.push(`qti-choices-${position}`);
    return classes.join(' ');
}

    OrderInteractionStateQuestion.prototype.initForm = function initForm () {

        var callbacks;
        var widget      = this.widget;
        var $form       = this.widget.$form;
        var interaction = this.widget.element;
        var $choiceArea = this.widget.$container.find('.choice-area');
        var $resultArea = this.widget.$container.find('.result-area');
        var $interaction = this.widget.$container.find('.qti-interaction');
        var $iconAdd = this.widget.$container.find('.icon-add-to-selection');
        var $iconRemove = this.widget.$container.find('.icon-remove-from-selection');
        let minMaxComponent = null;

        const order = interaction.attr('data-order') || interaction.attr('order'); // legacy attr support
        // legacy attr remove
        if (interaction.attr('order')) {
            interaction.removeAttr('order');
        }
        const isSingleOrder = order === 'single';
        const minValue = interaction.attr('minChoices')
            ? _.parseInt(interaction.attr('minChoices'))
            : 0;
        const maxValue = interaction.attr('maxChoices')
            ? _.parseInt(interaction.attr('maxChoices'))
            : 0;

        const position = getPosition(interaction);
        // Select from list 
        const positionState = {
            positionTop: position === 'top',
            positionBottom: position === 'bottom',
            positionLeft: position === 'left',
            positionRight: position === 'right'
        };


        const enableSortOptions = () => {
            const minMaxPanel = $form.find('.min-max-panel');
            minMaxPanel.show();
            if (features.isVisible('taoQtiItem/creator/interaction/order/property/position')) {
                getPositionPanel().show();
                applyPosition($interaction, position);
            }
            minMaxComponent = minMaxComponentFactory(minMaxPanel, {
                min: { value: minValue },
                max: { value: maxValue },
                upperThreshold: _.size(interaction.getChoices()),
            }).on('render', function () {
                var self = this;
                widget.on('choiceCreated choiceDeleted', function (data) {
                    if (data.interaction.serial === interaction.serial) {
                        self.updateThresholds(1, _.size(interaction.getChoices()));
                    }
                });
            });
        };

        const disableSortOptions = () => {
            $form.find('.min-max-panel').hide();
            getPositionPanel().hide();
            if (minMaxComponent) {
                minMaxComponent.destroy();
                minMaxComponent = null;
            }
        };

        const makeSingleOrder = () => {
            interaction.attr('data-order', 'single');
            interaction.attr('minChoices', 0);
            interaction.attr('maxChoices', 0);
            $interaction.addClass('qti-single');
            $iconAdd.addClass('inactive');
            $interaction.removeClass('test-preview');
            const $choices = $choiceArea.children('.qti-choice');
            if (!$choices.length) {
                const $resultItems = $resultArea.children('.qti-choice');
                $choiceArea.prepend($resultItems);
            }
            disableSortOptions();
        }

        const makeSortOrder = () => {
            interaction.attr('data-order', 'sort');
            $interaction.removeClass('qti-single');
            $iconAdd.removeClass('inactive');
            enableSortOptions();
        }

            $form.html(formTpl(_.assign({}, {
            shuffle: !!interaction.attr('shuffle'),
            horizontal: interaction.attr('orientation') === 'horizontal',
            single: isSingleOrder,
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/order/property/shuffle'),
                orientation: features.isVisible('taoQtiItem/creator/interaction/order/property/orientation'),
                position: features.isVisible('taoQtiItem/creator/interaction/order/property/position')
            }
        }, positionState)));

        const getPositionPanel = () => $form.find('.position-panel');

        !isSingleOrder && applyPosition($interaction, position);

        isSingleOrder ? makeSingleOrder() : makeSortOrder();

        formElement.initWidget($form);


        //data change callbacks with the usual min/maxChoices
        callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', {updateCardinality:false});

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function(interaction, value){
            interaction.attr('orientation', value);
            $interaction.attr('data-orientation', value);

            if(value === 'horizontal'){
                $choiceArea.addClass('horizontal').removeClass('vertical');
                $resultArea.addClass('horizontal').removeClass('vertical');
                $interaction.addClass('qti-horizontal').removeClass('qti-vertical');
                $iconAdd.addClass('icon-down').removeClass('icon-right');
                $iconRemove.addClass('icon-up').removeClass('icon-left');
            } else {
                $choiceArea.addClass('vertical').removeClass('horizontal');
                $resultArea.addClass('vertical').removeClass('horizontal');
                $interaction.addClass('qti-vertical').removeClass('qti-horizontal');
                $iconAdd.addClass('icon-right').removeClass('icon-down');
                $iconRemove.addClass('icon-left').removeClass('icon-up');
            }
        };

        // data change for position
        callbacks.position = function (interaction, value) {
            // persist change
            interaction.attr('data-position', value);
            // reflect in UI
            applyPosition($interaction, value);
        };

        // data change for order
        callbacks.order = function (interaction, value) {
            value === 'sort' ? makeSortOrder() : makeSingleOrder();
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);

        //adapt size
        if(interaction.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(widget);
        }

        widget.on('choiceCreated', function(){
            if(interaction.attr('orientation') === 'horizontal') {
                sizeAdapter.adaptSize(widget);
            }
        });
    };

    return OrderInteractionStateQuestion;
});
