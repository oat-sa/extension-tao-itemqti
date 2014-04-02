define(['taoQtiItem/qtiCreator/renderers/Renderer'], function(Renderer){
    
    //initialized once only:
    var _creatorRenderer = new Renderer({
        shuffleChoices : false,
        runtimeContext : {
            runtime_base_www : '/taoQtiItem/test/samples/test_base_www/',
            root_url : '',
            debug : true
        },
        interactionOptionForm : $('#item-editor-interaction-property-bar .panel'),
        choiceOptionForm : $('#item-editor-choice-property-bar .panel'),
        responseOptionForm : $('#item-editor-response-property-bar .panel')
    });
    
    return {
        get:function(){
            return _creatorRenderer;
        }
    };

});