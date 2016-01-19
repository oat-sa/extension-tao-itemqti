define([
    'lodash',
    'jquery',
    'i18n',
    'ui/selecter',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/rule',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/panel'
], function(_, $, __, selecter, formElement, ruleTpl, panelTpl){
    
    function onSetCorrect($select){
        $select.siblings('.feedbackRule-compared-value').hide();
    }
    
    function onUnsetCorrect($select){
        $select.siblings('.feedbackRule-compared-value').val('0');
    }
    
    function onSetCompare($select){
        $select.siblings('.feedbackRule-compared-value').show();
    }
    
    function getAvailableConditions(){
        return _availableConditions;
    }
    
    var _availableConditions = [
        {
            name : 'correct',
            label : __('correct'),
            onSet : onSetCorrect,
            onUnset : onUnsetCorrect
        },
        {
            name : 'incorrect',
            label : __('incorrect'),
            onSet : onSetCorrect,
            onUnset : onUnsetCorrect
        },
        {
            name : 'lt',
            label : '<',
            onSet : onSetCompare
        },
        {
            name : 'lte',
            label : '<=',
            onSet : onSetCompare
        },
        {
            name : 'equal',
            label : '=',
            onSet : onSetCompare
        },
        {
            name : 'gte',
            label : '>=',
            onSet : onSetCompare
        },
        {
            name : 'gt',
            label : '>',
            onSet : onSetCompare
        }
    ];

    var _renderFeedbackRule = function(feedbackRule){
        
        var feedbackElseSerial,
            addElse,
            feedbackElse = feedbackRule.feedbackElse,
            addElse = !feedbackElse;

        if(feedbackElse){
            feedbackElseSerial = feedbackElse.serial;
        }

        var rule =  ruleTpl({
            availableConditions : getAvailableConditions(),
            serial : feedbackRule.serial,
            condition : feedbackRule.condition,
            comparedValue : feedbackRule.comparedValue,
            feedbackThen : feedbackRule.feedbackThen.serial,
            feedbackElse : feedbackElseSerial,
            addElse : addElse,
            hideScore : (feedbackRule.condition === 'correct' || feedbackRule.condition === 'incorrect')
        });
        
        var $rule = $(rule);
        selecter($rule);
        
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
                availableConditions = getAvailableConditions(),
                $comparedValue = $select.siblings('.feedbackRule-compared-value'),
                fbRule = response.getFeedbackRule($(this).parents('.feedbackRule-container').data('serial')),
                newRule = _.find(availableConditions, {name : condition}),
                oldRule = _.find(availableConditions, {name : fbRule.condition});
            
            console.log(response);
            
            //exec unset old condition callback
            if(oldRule && _.isFunction(oldRule.onUnset)){
                oldRule.onUnset($select);
            }
            
            //exec set new condition callback
            if(newRule && _.isFunction(newRule.onSet)){
                newRule.onSet($select);
            }
            
            formElement.setScore($comparedValue, {
                required : true,
                set : function(key, value){
                    response.setCondition(fbRule, condition, value);
                }
            });

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
