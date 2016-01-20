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
    'jquery',
    'i18n',
    'ui/selecter',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/rule',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/panel',
    'taoQtiItem/qtiCreator/editor/response/choiceSelector'
], function(_, $, __, selecter, formElement, ruleTpl, panelTpl, choiceSelector){
    'use strict';
    
    function _resetScore(fbRule, $select){
        $select.siblings('.feedbackRule-compared-value').val('0');
    }
    
    function onSetScore(fbRule, $select){
        var response = fbRule.comparedOutcome;
        var condition = this.name;
        var $comparedValue = $select.siblings('.feedbackRule-compared-value');
        formElement.setScore($comparedValue, {
            required : true,
            set : function(key, value){
                response.setCondition(fbRule, condition, value);
            }
        });
    }
    
    function onUnsetCorrect(fbRule, $select){
        _resetScore(fbRule, $select);
    }
    
    function initCorrect(fbRule, $select){
        $select.siblings('.feedbackRule-compared-value').hide();
    }
    
    function initCompare(fbRule, $select){
        $select.siblings('.feedbackRule-compared-value').show();
    }
    
    var _availableConditions = [
        {
            name : 'correct',
            label : __('correct'),
            init : initCorrect,
            onSet : onSetScore,
            onUnset : onUnsetCorrect
        },
        {
            name : 'incorrect',
            label : __('incorrect'),
            init : initCorrect,
            onSet : onSetScore,
            onUnset : onUnsetCorrect
        },
        {
            name : 'choices',
            label : __('choices'),
            init : function initChoice(fbRule, $select){
                
                $select.siblings('.feedbackRule-compared-value').hide();
                
                var condition = this.name;
                
                //@TODO : create the choice selecter
                //sample code ...
                var $choiceSelectorContainer = $('<div>', {'class' : 'choiceSelectorContainer'}).insertAfter($select);
                var response = fbRule.comparedOutcome;
                var interaction = response.getInteraction();
                var cSelector = choiceSelector({
                    renderTo: $choiceSelectorContainer,
                    interaction : interaction,
                    choices: fbRule.comparedValue || []
                });
                $choiceSelectorContainer.data('choice-selector', cSelector);
                console.log(cSelector);
                
                cSelector.on('change', function(){
                    //on change, assign selected choices (identifiers)
                    var selectedChoices = ['choice_1', 'choice_3', 'choice_2'];
                    response.setCondition(fbRule, condition, selectedChoices);
                }).trigger('change');
                
            },
            onSet : function onSetChoices(fbRule, $select){
                fbRule.comparedOutcome.setCondition(fbRule, this.name, []);
            },
            onUnset : function onUnsetChoices(fbRule, $select){
                var condition = this.name;
                //this needs to be executed to restore the feedback rule value
                _resetScore(fbRule, $select);
                
                //@TODO : destroy the choice selecter
                //sample code ...
                var $choiceSelectorContainer = $select.siblings('.choiceSelectorContainer');
                $choiceSelectorContainer.data('choice-selector').destroy();
                $choiceSelectorContainer.remove();
                
            },
            filter : function filterChoices(response){
                var interaction = response.getInteraction();
                return (interaction.is('choiceInteraction') || interaction.is('inlineChoiceInteraction'));
            }
        },    
        {
            name : 'lt',
            label : '<',
            init : initCompare,
            onSet : onSetScore
        },
        {
            name : 'lte',
            label : '<=',
            init : initCompare,
            onSet : onSetScore
        },
        {
            name : 'equal',
            label : '=',
            init : initCompare,
            onSet : onSetScore
        },
        {
            name : 'gte',
            label : '>=',
            init : initCompare,
            onSet : onSetScore
        },
        {
            name : 'gt',
            label : '>',
            init : initCompare,
            onSet : onSetScore
        }
    ];
    
    function getAvailableConditions(response){
        
        return _.filter(_availableConditions, function(condition){
            if(_.isFunction(condition.filter)){
                return condition.filter(response);
            }
            return true;
        });
        
        return _availableConditions;
    }
    
    var _renderFeedbackRule = function(feedbackRule){
        
        var feedbackElseSerial,
            addElse,
            feedbackElse = feedbackRule.feedbackElse,
            addElse = !feedbackElse;
        
        if(feedbackElse){
            feedbackElseSerial = feedbackElse.serial;
        }
        var availableConditions = getAvailableConditions(feedbackRule.comparedOutcome);
        var rule =  ruleTpl({
            availableConditions : availableConditions,
            serial : feedbackRule.serial,
            condition : feedbackRule.condition,
            comparedValue : feedbackRule.comparedValue,
            feedbackThen : feedbackRule.feedbackThen.serial,
            feedbackElse : feedbackElseSerial,
            addElse : addElse,
            hideScore : (feedbackRule.condition === 'correct' || feedbackRule.condition === 'incorrect')//@todo remove this, put in init()
        });
        
        var $rule = $(rule);
        selecter($rule);
        
        //init rule editing
        var condition = _.find(availableConditions, {name : feedbackRule.condition});
        condition.init(feedbackRule, $rule.find('.feedbackRule-condition'));
        
        return $rule;
    };

    var _initFeedbackEventListener = function($feedbacksPanel, response){

        var $feedbacks = $feedbacksPanel.find('.feedbackRules');
        $feedbacksPanel.on('click', '.feedbackRule-add', function(e){
            e.preventDefault();

            var feedbackRule = response.createFeedbackRule(),
                $lastRule = $feedbacks.children('.feedbackRule-container:last');

            if($lastRule.length){
                $lastRule.after(_renderFeedbackRule(feedbackRule));
            }else{
                $feedbacks.html(_renderFeedbackRule(feedbackRule));
            }
        }).on('click', '.feedbackRule-add-else', function(e){
            
            e.preventDefault();
            
            var $fbContainer = $(this).parents('.feedbackRule-container'),
                fbSerial = $fbContainer.data('serial'),
                fbRule = response.getFeedbackRule(fbSerial),
                fbModal = response.createFeedbackElse(fbRule);

            $fbContainer.replaceWith(_renderFeedbackRule(fbRule));

        }).on('click', '.feedbackRule-button-delete', function(){

            var $deleteButton = $(this),
                $fbContainer = $deleteButton.parents('.feedbackRule-container'),
                fbSerial = $fbContainer.data('serial'),
                fbRule = response.getFeedbackRule(fbSerial);

            switch($deleteButton.data('role')){
                case 'rule':
                    response.deleteFeedbackRule(fbRule);
                    $fbContainer.remove();
                    break;
                case 'else':
                    response.deleteFeedbackElse(fbRule);
                    $fbContainer.replaceWith(_renderFeedbackRule(fbRule));//replace all to display the add "else" button
                    break;
            }
        }).on('change', '.feedbackRule-condition', function(){

            var $select = $(this),
                condition = $select.val(),
                availableConditions = getAvailableConditions(response),
                fbRule = response.getFeedbackRule($(this).parents('.feedbackRule-container').data('serial')),
                newCondition = _.find(availableConditions, {name : condition}),
                oldCondition = _.find(availableConditions, {name : fbRule.condition});
            
            //exec unset old condition callback
            if(oldCondition && _.isFunction(oldCondition.onUnset)){
                oldCondition.onUnset(fbRule, $select);
            }
            
            //exec set new condition callback
            if(newCondition && _.isFunction(newCondition.onSet)){
                newCondition.onSet(fbRule, $select);
            }
            
            //init the new condition editing
            newCondition.init(fbRule, $select);
            
        }).on('keyup', '.feedbackRule-compared-value', function(){

            var fbRule = response.getFeedbackRule($(this).parents('.feedbackRule-container').data('serial'));

            formElement.setScore($(this), {
                required : true,
                set : function(key, value){
                    response.setCondition(fbRule, fbRule.condition, value);
                }
            });

        }).on('click', '[data-feedback]', function(){

            var $btn = $(this),
                fbRule = response.getFeedbackRule($btn.parents('.feedbackRule-container').data('serial')),
                modalFeedback,
                modalFeedbackWidget;
            
            switch($btn.data('feedback')){
                case 'then':
                    modalFeedback = fbRule.feedbackThen;
                    break;
                case 'else':
                    modalFeedback = fbRule.feedbackElse;
                    break;
            }

            if(modalFeedback){
                //show modal feedback editor:
                modalFeedbackWidget = _getModalFeedbackWidget(modalFeedback);
                modalFeedbackWidget.changeState('active');
            }

        });

    };
    
    var _widgets = {};
    
    var _getModalFeedbackWidget = function(modalFeedback){
        
        var $feedbacksContainer = $('#modalFeedbacks');
        if(!_widgets[modalFeedback.serial]){
            $feedbacksContainer.append(modalFeedback.render());
            modalFeedback.postRender();
            _widgets[modalFeedback.serial] = modalFeedback.data('widget');
        }
        
        return _widgets[modalFeedback.serial];
    };

    return {
        initFeedbacksPanel : function($feedbacksPanel, response){

            $feedbacksPanel.html(panelTpl());
            
            var $feedbackRules = $feedbacksPanel.find('.feedbackRules'),
                feedbackRules = response.getFeedbackRules();
            
            if(feedbackRules && _.size(feedbackRules)){
                $feedbackRules.empty();
                _.each(feedbackRules, function(feedbackRule){
                    $feedbackRules.append(_renderFeedbackRule(feedbackRule));
                });
            }

            _initFeedbackEventListener($feedbacksPanel, response);
        },
        renderFeedbackRule : _renderFeedbackRule
    };
});
