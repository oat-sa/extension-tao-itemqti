define([
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule',
    'tooltipster'
], function(responseHelper, formElement, responseFormTpl, modalFeedbackRule){

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
                upperBound : response.getMappingAttribute('upperBound')
            }));

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