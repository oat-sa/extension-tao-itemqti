define([
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'tpl!taoQtiItem/qtiCreator/tpl/modalFeedback/rule',
    'lodash',
    'i18n'
], function(responseHelper, formElement, responseFormTpl, feedbackRuleTpl, _, __){

    var _saveCallbacks = {
        template : function(elt, key, value){
            elt.setTemplate(value);
        },
        mappingAttr : function(elt, key, value){
            elt.setMappingAttribute(key, value);
        }
    };

    var answerStateHelper = {
        forward : function(widget){

            //forward to one of the available sub state, according to the response processing template
            var response = widget.element.getResponseDeclaration();
            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                widget.changeState('correct');

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                widget.changeState('map');
            }
        },
        initResponseForm : function(widget){

            var template = 'custom',
                response = widget.element.getResponseDeclaration();

            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                template = 'correct';

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                template = 'map';
            }

            widget.$responseForm.html(responseFormTpl({
                template : template,
                defaultValue : response.getMappingAttribute('defaultValue'),
                lowerBound : response.getMappingAttribute('lowerBound'),
                upperBound : response.getMappingAttribute('upperBound'),
                feedbackRules : _getFeedbackRulesData(response)
            }));

            formElement.initWidget(widget.$responseForm);

            formElement.initDataBinding(widget.$responseForm, response, {
                template : _saveCallbacks.template,
                defaultValue : _saveCallbacks.mappingAttr,
                lowerBound : _saveCallbacks.mappingAttr,
                upperBound : _saveCallbacks.mappingAttr
            });

            var $feedbacksPanel = $('.feedbackRules', widget.$responseForm);
            widget.$responseForm.find('.feedbackRule-add').on('click', function(){
                var feedbackRule = response.createFeedbackRule();
                var $lastRule = $feedbacksPanel.find('.feedbackRule-container:last');
                if($lastRule.length){
                    $lastRule.after(_renderFeedbackRule(feedbackRule));
                }else{
                    $feedbacksPanel.html(_renderFeedbackRule(feedbackRule));
                }
            });
        }
    };

    var _renderFeedbackRule = function(feedbackRule){

        var feedbackElseSerial,
            addElse,
            feedbackElse = feedbackRule.feedbackElse;

        if(feedbackElse){
            addElse = !feedbackElse;
            feedbackElseSerial = feedbackElse.serial;
        }

        return feedbackRuleTpl({
            availableConditions : _availableConditions,
            serial : feedbackRule.serial,
            condition : feedbackRule.condition,
            comparedValue : feedbackRule.comparedValue,
            feedbackThen : feedbackRule.feedbackThen.serial,
            addElse : addElse,
            feedbackElse : feedbackElseSerial
        });
    };

    var _getFeedbackRulesData = function(response){

        var feedbackRules = [];

        _.each(response.getFeedbackRules(), function(feedbackRule){
            feedbackRules.push(_renderFeedbackRule(feedbackRule));
        });

        return feedbackRules;
    };

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

    return answerStateHelper;
});