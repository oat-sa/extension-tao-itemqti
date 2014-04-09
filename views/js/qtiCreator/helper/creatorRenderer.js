define(['taoQtiItem/qtiCreator/renderers/Renderer'], function(Renderer){
    
    //initialized once only:
    var _creatorRenderer = new Renderer({
        baseUrl:'/taoQtiItem/test/samples/test_base_www/',
        shuffleChoices : false,
        interactionOptionForm : $('#item-editor-interaction-property-bar .panel'),
        choiceOptionForm : $('#item-editor-choice-property-bar .panel'),
        responseOptionForm : $('#item-editor-response-property-bar .panel'),
        bodyElementOptionForm : $('#item-editor-body-element-property-bar .panel')
    });
    
    return {
        get:function(){
            return _creatorRenderer;
        }
    };

});