define(['taoQtiItem/qtiItem/helper/response'], function(responseHelper){

    var answerStateHelper = {
        forward : function(widget){
            //forward to one of the available sub state:
            var response = widget.element.getResponseDeclaration();
            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                widget.changeState('correct');

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                widget.changeState('map');
            }
        }
    };

    return answerStateHelper;
});