define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Answer',
    'taoQtiItem/qtiItem/helper/response'
], function(stateFactory, Answer, responseHelper){

    var InteractionStateAnswer = stateFactory.create(Answer, function(){
        
        //forward to one of the available sub state:
        var response = this.widget.element.getResponseDeclaration();
        if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

            this.widget.changeState('correct');

        }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
            responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

            this.widget.changeState('map');
        }

    }, function(){
        
    });

    return InteractionStateAnswer;
});