define(['lodash'], function(_){

    var requirejs = window.require;
    var paths = {};
    var required = [];

    function register(customInteractionHooks){

        _(customInteractionHooks).values().each(function(interactionHook){
            
            //load customInteraction namespace in requirejs config 
            paths[interactionHook.typeIdentifier] = interactionHook.baseUrl;

            //prepare required interaction files
            required.push(interactionHook.file);
        });
        
        //register custom interaction paths
        requirejs.config({
            paths : paths
        });
    }

    function load(callback){

        requirejs(required, function(){
            var hooks = {};
            _.each(arguments, function(hook){
                hooks[hook.getTypeIdentifier()] = hook;
            });
            callback(hooks);
        });
    }

    function getPath(typeIdentifier){
        
        return paths[typeIdentifier];
    }

    return {
        register : register,
        load : load,
        getPath : getPath
    };

});