define([
    'taoQtiItem/qtiItem/helper/response',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm'
], function(responseHelper, responseFormTpl) {

    var answerStateHelper = {
        forward: function(widget) {
            
            //forward to one of the available sub state, according to the response processing template
            var response = widget.element.getResponseDeclaration();
            if (responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')) {

                widget.changeState('correct');

            } else if (responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                    responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')) {

                widget.changeState('map');
            }
        },
        initResponseForm: function(widget) {
            
            var template = 'custom',
                response = widget.element.getResponseDeclaration();
            
            if (responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')) {
                
                template = 'correct';

            } else if (responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                    responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')) {
                
                template = 'map';
            }
            
            
            widget.$responseForm.html(responseFormTpl({
                template:template
            }));

        }
    };

    return answerStateHelper;
});