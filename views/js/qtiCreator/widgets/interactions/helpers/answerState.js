define([
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule',
    'tooltipster'
], function(responseHelper, formElement, responseFormTpl, modalFeedbackRule){

    var _saveCallbacks = {
        template : function(response, value){
            response.setTemplate(value);
        },
        mappingAttr : function(response, value, key){
            if(value === ''){
                response.removeMappingAttribute(key);
            }else{
                response.setMappingAttribute(key, value);
            }
        }
    };

    var answerStateHelper = {
        //forward to one of the available sub state, according to the response processing template
        forward : function(widget){
            
            var response = widget.element.getResponseDeclaration();
            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                widget.changeState('correct');

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                widget.changeState('map');
            }
        },
        initResponseForm : function(widget){

            var template = 'CUSTOM',
                response = widget.element.getResponseDeclaration();

            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                template = 'MATCH_CORRECT';

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                template = 'MAP_RESPONSE';
            }

            widget.$responseForm.html(responseFormTpl({
                defaultValue : response.getMappingAttribute('defaultValue'),
                lowerBound : response.getMappingAttribute('lowerBound'),
                upperBound : response.getMappingAttribute('upperBound')
            }));
            widget.$responseForm.find('select[name=template]').val(template);
            
            formElement.initWidget(widget.$responseForm);

            formElement.initDataBinding(widget.$responseForm, response, {
                template : _saveCallbacks.template,
                defaultValue : _saveCallbacks.mappingAttr,
                lowerBound : _saveCallbacks.mappingAttr,
                upperBound : _saveCallbacks.mappingAttr
            });
            
            modalFeedbackRule.initFeedbacksPanel($('.feedbackRule-panel', widget.$responseForm), response);
            
        }
    };

    return answerStateHelper;
});