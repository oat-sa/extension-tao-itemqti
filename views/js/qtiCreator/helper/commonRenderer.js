define([
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function(Renderer, commonHelper){
    
    //store the curret execution context of the common renderer (preview)
    var _$previousContext = null;
    
    //configure and instanciate once only:
    var _renderer = new Renderer({
        baseUrl : '',
        shuffleChoices : true
    });
    
    
    var commonRenderer = {
        render : function(item, $placeholder){

            commonRenderer.setContext($placeholder.parent());
            
            _renderer.load(function(){
                
                item.render(this, $placeholder);
                item.postRender(this);
                
            }, item.getUsedClasses());
            
        },
        get : function(){
            return _renderer;
        },
        setOption : function(name, value){
            _renderer.setOption(name, value);
        },
        setContext : function($context){
            _$previousContext = $context;
            commonHelper.setContext($context);
        },
        restoreContext : function(){
             commonHelper.setContext(_$previousContext);
             _$previousContext = null;
        }    
    };

    return commonRenderer;

});