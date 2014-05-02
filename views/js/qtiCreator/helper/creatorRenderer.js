define(['taoQtiItem/qtiCreator/renderers/Renderer'], function(Renderer){
    
    //configure and instanciate once only:
    var _creatorRenderer = new Renderer({
        baseUrl:'',
        shuffleChoices : false,
        itemOptionForm : $('#item-editor-item-property-bar .panel'),
        interactionOptionForm : $('#item-editor-interaction-property-bar .panel'),
        choiceOptionForm : $('#item-editor-choice-property-bar .panel'),
        responseOptionForm : $('#item-editor-response-property-bar .panel'),
        bodyElementOptionForm : $('#item-editor-body-element-property-bar .panel')
    });
    
    return {
        get:function(){
            return _creatorRenderer;
        },
        setOption:function(name, value){
            _creatorRenderer.setOption(name, value);
        }
    };

});