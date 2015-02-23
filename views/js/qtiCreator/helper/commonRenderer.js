define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function(_, Renderer, commonHelper){
    "use strict";
    //store the curret execution context of the common renderer (preview)
    var _$previousContext = null;
    
    //configure and instanciate once only:
    var _renderer = new Renderer({
        baseUrl : '',
        shuffleChoices : true
    });
    
    
    var commonRenderer = {
        render : function(item, $container){

            commonRenderer.setContext($container);
            
            return _renderer.load(function(){
                
                $container.append(item.render(this));
                item.postRender({}, '', this);
                
            }, item.getUsedClasses());
        },
        get : function(){
            return _renderer;
        },
        setOption : function(name, value){
            return _renderer.setOption(name, value);
        },
        setOptions : function(options){
            return _renderer.setOptions(options);
        },
        setContext : function($context){
            _$previousContext = $context;
            return commonHelper.setContext($context);
        },
        restoreContext : function(){
            commonHelper.setContext(_$previousContext);
             _$previousContext = null;
        },
        load : function(qtiClasses, done){
            return _renderer.load(function(){
                if(_.isFunction(done)){
                    done.apply(this, arguments);
                }
            }, qtiClasses);
        }
    };

    return commonRenderer;

});