define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/rule',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/panel'
], function(_, $, __, formElement, ruleTpl, panelTpl){
   
   var _availableConditions = [
        {
            name : 'correct',
            label : __('correct')
        },
        {
            name : 'incorrect',
            label : __('incorrect')
        },
        {
            name : 'lt',
            label : '<'
        },
        {
            name : 'lte',
            label : '<='
        },
        {
            name : 'equal',
            label : '='
        },
        {
            name : 'gte',
            label : '>='
        },
        {
            name : 'gt',
            label : '>'
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

        return ruleTpl({
            availableConditions : _availableConditions,
            serial : feedbackRule.serial,
            condition : feedbackRule.condition,
            comparedValue : feedbackRule.comparedValue,
            feedbackThen : feedbackRule.feedbackThen.serial,
            feedbackElse : feedbackElseSerial,
            addElse : addElse,
            hideScore: (feedbackRule.condition === 'correct' || feedbackRule.condition === 'incorrect')
        });
    };
    
    var _initFeedbackEventListener = function($feedbacksPanel, response){
        
        var $feedbacks = $feedbacksPanel.find('.feedbackRules');
        $feedbacksPanel.on('click', '.feedbackRule-add', function(){

            var feedbackRule = response.createFeedbackRule(),
                $lastRule = $feedbacks.children('.feedbackRule-container:last');

            if($lastRule.length){
                $lastRule.after(_renderFeedbackRule(feedbackRule));
            }else{
                $feedbacks.html(_renderFeedbackRule(feedbackRule));
            }
        }).on('click', '.feedbackRule-add-else', function(){

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
                $comparedValue = $select.siblings('.feedbackRule-compared-value'),
                fbRule = response.getFeedbackRule($(this).parents('.feedbackRule-container').data('serial'));
        
            if(fbRule.condition === 'correct' || fbRule.condition === 'incorrect'){
                $comparedValue.val('0');//initialize the value to 0
            }
            
            if(condition === 'correct' || condition === 'incorrect'){
                $comparedValue.hide();
            }else{
                $comparedValue.show();
            }
        
            formElement.setScore($comparedValue, {
                required:true,
                set:function(key, value){
                    response.setCondition(fbRule, condition, value);
                }
            });
            
        }).on('keyup', '.feedbackRule-compared-value', function(){
            
            var fbRule = response.getFeedbackRule($(this).parents('.feedbackRule-container').data('serial'));
            
            formElement.setScore($(this), {
                required:true,
                set:function(key, value){
                    response.setCondition(fbRule, fbRule.condition, value);
                }
            });
            
        }).on('click', '[data-feedback]', function(){
            
            var $feedbacksContainer = $('#modalFeedbacks'),
                $btn = $(this),
                fbRule = response.getFeedbackRule($btn.parents('.feedbackRule-container').data('serial')),
                modalFeedback;
            
            switch($btn.data('feedback')){
                case 'then':
                    modalFeedback = fbRule.feedbackThen;
                    break;
                case 'else':
                    modalFeedback = fbRule.feedbackElse;
                    break;
            }
            
            if(modalFeedback){
                console.log(modalFeedback);
                $feedbacksContainer.append(modalFeedback.render());
                modalFeedback.postRender();
            }
            
        });
            
    };
    
    return {
        initFeedbacksPanel:function($feedbacksPanel, response){
            
            var feedbackRules = [];

            _.each(response.getFeedbackRules(), function(feedbackRule){
                feedbackRules.push(_renderFeedbackRule(feedbackRule));
            });
            
            $feedbacksPanel.html(panelTpl({
                feedbackRules:feedbackRules
            }));
            
            _initFeedbackEventListener($feedbacksPanel, response);
        },
        renderFeedbackRule:_renderFeedbackRule
    };
});