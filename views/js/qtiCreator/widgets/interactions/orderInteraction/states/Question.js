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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2014 - 2026 (original work) Open Assessment Technologies SA;
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

    OrderInteractionStateQuestion.prototype.initForm = function initForm(){

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

        const isPositionEnabled = features.isVisible('taoQtiItem/creator/interaction/order/property/position');
        const getDefaultPosition = () =>  interaction.attr('orientation') === 'horizontal' ? 'top' : 'left';

        let position = isPositionEnabled ? interaction.attr("data-position") : getDefaultPosition();

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

        const createMinMaxComponent = () => {
            const minMaxPanel = $form.find('.min-max-panel');
            minMaxPanel.show();
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

        const deleteMinMaxComponent = () => {
            $form.find('.min-max-panel').hide();
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
            $interaction.removeClass('test-preview');
            const $choices = $choiceArea.children('.qti-choice');
            if (!$choices.length) {
                const $resultItems = $resultArea.children('.qti-choice');
                $choiceArea.prepend($resultItems);
            }
            deleteMinMaxComponent();
        }

        const makeSortOrder = () => {
            interaction.attr('data-order', 'sort');
            $interaction.removeClass('qti-single');
            createMinMaxComponent();
        }

        const normalizePositionClass = (className, position) => {
            const classes = (className || '').split(/\s+/).filter(Boolean).filter((c) => !c.startsWith("qti-choices-"));
            classes.push(`qti-choices-${position}`);
            return classes.join(' ');
        }

        const updateArrowDirection =(position) =>{
            if (!position) return;
            const iconAddDirection = {
                top: 'icon-down',
                bottom: 'icon-up',
                left: 'icon-right',
                right: 'icon-left'
            };
            const iconRemoveDirection = {
                top: 'icon-up',
                bottom: 'icon-down', 
                left: 'icon-left',
                right: 'icon-right'
            };
            $iconAdd.removeClass(Object.values(iconAddDirection).join(' ')).addClass(iconAddDirection[position]);
            $iconRemove.removeClass(Object.values(iconRemoveDirection).join(' ')).addClass(iconRemoveDirection[[position]]);
        }

        const applyPosition = (position) => {
            if (!position) return;
            const baseClass = $interaction.attr('class') || '';
            const newClass = normalizePositionClass(baseClass, position);
            $interaction.attr('class', newClass);
            interaction.attr('data-position', position);
            interaction.attr('class', `qti-choices-${position}`);
            updateArrowDirection(position);
        }

        const showPositionPanel = () => {
            if (isPositionEnabled) {
                position = interaction.attr('data-position') || getDefaultPosition();
                applyPosition(position);
                const $panel = getPositionPanel();
                $panel.find('input[name="position"]').prop('checked', false);
                $panel.find(`input[name="position"][value="${position}"]`).prop('checked', true);
                getPositionPanel().show();
            }
        }

        const hidePositionPanel = () => {
            getPositionPanel().hide();
            $interaction.removeClass(`qti-choices-${position}`);
            interaction.removeAttr('data-position');
            position = getDefaultPosition();
        }

        $form.html(formTpl(_.assign({}, {
            shuffle : !!interaction.attr('shuffle'),
            horizontal : interaction.attr('orientation') === 'horizontal',
            single: isSingleOrder,
            position,
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/order/property/shuffle'),
                orientation: features.isVisible('taoQtiItem/creator/interaction/order/property/orientation'),
                position: isPositionEnabled,
            }
        })));

        const getPositionPanel = () => $form.find('.position-panel');

        if (isSingleOrder) {
            makeSingleOrder();
            hidePositionPanel();
        } else {
            makeSortOrder();
            showPositionPanel();
        }

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
            } else {
                $choiceArea.addClass('vertical').removeClass('horizontal');
                $resultArea.addClass('vertical').removeClass('horizontal');
                $interaction.addClass('qti-vertical').removeClass('qti-horizontal');
            }
        };

        // data change for position 
        callbacks.position = function (interaction, value) { 
            position = value; 
            applyPosition(value);
        };

        // data change for order
        callbacks.order = function (interaction, value) {
            // reset position when changing order type
            interaction.removeAttr('data-position');
            interaction.removeAttr('class');
            position = getDefaultPosition();
            applyPosition(position);

            if (value === 'sort') {
                makeSortOrder();
                showPositionPanel();
            } else {
                makeSingleOrder();
                hidePositionPanel();
            }
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
