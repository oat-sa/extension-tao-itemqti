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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/match',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/matchInteraction.adder',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/matchInteraction.row',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/matchInteraction.cell',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'services/features'
], function(
    $,
    _,
    stateFactory,
    Question,
    formElement,
    minMaxComponentFactory,
    formTpl,
    adderTpl,
    rowTpl,
    cellTpl,
    sizeAdapter,
    features
){

    'use strict';

    var MatchInteractionStateQuestion = stateFactory.extend(Question);
    var MODE_TABULAR = 'qti-match-tabular';
    var MODE_NON_TABULAR = 'qti-match-non-tabular';
    var POSITION_CLASSES = ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right'];
    var DEFAULT_POSITION = 'top';

    function getClasses(className) {
        return (className || '').split(/\s+/).filter(Boolean);
    }

    function getMode(className) {
        var classes = getClasses(className);

        if (_.includes(classes, MODE_TABULAR)) {
            return MODE_TABULAR;
        }
        if (_.includes(classes, MODE_NON_TABULAR)) {
            return MODE_NON_TABULAR;
        }

        return null;
    }

    function getPosition(className) {
        var positionClass = _.find(getClasses(className), function(cls) {
            return _.includes(POSITION_CLASSES, cls);
        });

        return positionClass ? positionClass.replace('qti-choices-', '') : null;
    }

    function normalizeClass(className, mode, position) {
        var classes = _.filter(getClasses(className), function(cls) {
            return cls !== MODE_TABULAR && cls !== MODE_NON_TABULAR && !_.includes(POSITION_CLASSES, cls);
        });

        classes.push(mode);

        if (mode === MODE_NON_TABULAR) {
            classes.push(`qti-choices-${position || DEFAULT_POSITION}`);
        }

        return classes.join(' ').trim();
    }

    function setClassAttribute(element, className) {
        if (className) {
            element.attr('class', className);
        } else {
            element.removeAttr('class');
        }
    }

    MatchInteractionStateQuestion.prototype.initForm = function initForm(){
        var widget = this.widget;
        var $form = this.widget.$form;
        var interaction = this.widget.element;
        var $interaction = this.widget.$container.find('.qti-interaction');
        var initialClass = interaction.attr('class');
        var mode = getMode(initialClass) || MODE_NON_TABULAR;
        var position = mode === MODE_NON_TABULAR ? getPosition(initialClass) || DEFAULT_POSITION : DEFAULT_POSITION;
        var callbacks;

        function applyDisplaySettings(newMode, newPosition) {
            var modelClass = normalizeClass(interaction.attr('class'), newMode, newPosition);
            var domClass = normalizeClass($interaction.attr('class'), newMode, newPosition);

            setClassAttribute(interaction, modelClass);
            $interaction.attr('class', domClass);

            mode = newMode;
            position = newPosition || DEFAULT_POSITION;
        }

        function refreshDisplayControls() {
            var isNonTabular = mode === MODE_NON_TABULAR;

            $form.find('.match-non-tabular-info').toggle(isNonTabular);
            $form.find('.position-panel').toggle(isNonTabular);
            $form.find(`input[name="displayMode"][value="${mode}"]`).prop('checked', true);
            $form.find(`input[name="position"][value="${position}"]`).prop('checked', true);
        }

        applyDisplaySettings(mode, position);

        $form.html(formTpl({
            shuffle: !!interaction.attr('shuffle'),
            nonTabular: mode === MODE_NON_TABULAR,
            position: position,
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/match/property/shuffle')
            }
        }));

        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : {
                fieldName: 'minAssociations',
                value: _.parseInt(interaction.attr('minAssociations')) || 0,
                toggler: false
            },
            max : {
                fieldName: 'maxAssociations',
                value: _.parseInt(interaction.attr('maxAssociations')) || 0,
                toggler: false
            },
            lowerThreshold: 0,
            upperThreshold: 100
        });

        formElement.initWidget($form);
        refreshDisplayControls();

        callbacks = formElement.getMinMaxAttributeCallbacks(
            'minAssociations',
            'maxAssociations'
        );
        callbacks.shuffle = formElement.getAttributeChangeCallback();
        callbacks.displayMode = function(matchInteraction, value) {
            var nextPosition = value === MODE_NON_TABULAR && mode === MODE_NON_TABULAR ? position : DEFAULT_POSITION;
            applyDisplaySettings(value, nextPosition);
            refreshDisplayControls();
        };
        callbacks.position = function(matchInteraction, value) {
            applyDisplaySettings(MODE_NON_TABULAR, value);
            refreshDisplayControls();
        };
        formElement.setChangeCallbacks($form, interaction, callbacks);

        sizeAdapter.adaptSize(widget);
        widget.on('choiceCreated', function(){
            sizeAdapter.adaptSize(widget);
        });
    };

    MatchInteractionStateQuestion.prototype.addNewChoiceButton = function(){

        var widget = this.widget,
            interaction = widget.element,
            $matchArea = widget.$container.find('.match-interaction-area'),
            qtiChoiceClassName = 'simpleAssociableChoice.matchInteraction';

        var _postRender = function(choice){
            choice.postRender({
                ready : function(choiceWidget){
                    //transition state directly back to "question"
                    choiceWidget.changeState('question');
                }
            }, qtiChoiceClassName);
        };

        if(!$matchArea.find('.add-option').length){
            $matchArea.append(adderTpl());
            $matchArea.find('.add-options').show();
            $matchArea.find('.add-option[data-role=add-col]').on('click', function(){
                //match set 0
                var choice = interaction.createChoice(0);
                $matchArea.find('thead > tr').append(choice.render(qtiChoiceClassName));
                $matchArea.find('tbody > tr').append(cellTpl({}));
                _postRender(choice);
            });

            $matchArea.find('.add-option[data-role=add-row]').on('click', function(){
                //match set 1
                var choice = interaction.createChoice(1);
                $matchArea.find('tbody').append(rowTpl({
                    choice : choice.render(qtiChoiceClassName),
                    otherMatchSetCount : _.size(interaction.choices[0])
                }));
                _postRender(choice);
            });
        }

        //listen for height changes
        $matchArea.find('tr ').each(function() {
            var $elements = $(this).find('[data-html-editable="true"]');
            widget.on('containerBodyChange', function(){
                sizeAdapter.adaptSize($elements);
            });
        });

    };

    return MatchInteractionStateQuestion;
});
