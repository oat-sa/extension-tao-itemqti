define(['lodash'], function(_){

    var requirejs = window.require,
        interactions = {},
        paths = {};

    function isValidHook(interactionHook){
        
        if(!interactionHook.typeIdentifier){
            throw 'invalid hook : missing typeIdentifier';
        }
        if(!interactionHook.baseUrl){
            throw 'invalid hook : missing baseUrl';
        }
        if(!interactionHook.file){
            throw 'invalid hook : missing file';
        }
        return true;
    }

    function register(customInteractionHooks){

        _(customInteractionHooks).values().each(function(interactionHook){
            
            if(isValidHook(interactionHook)){
                
                interactions[interactionHook.typeIdentifier] = interactionHook;

                //load customInteraction namespace in requirejs config 
                paths[interactionHook.typeIdentifier] = interactionHook.baseUrl;
            }
        });

        //register custom interaction paths
        requirejs.config({
            paths : paths
        });
    }

    function loadAll(callback){

        var required = [];
        _.each(interactions, function(interaction){
            required.push(interaction.file);
        });

        requirejs(required, function(){
            var hooks = {};
            _.each(arguments, function(hook){
                hooks[hook.getTypeIdentifier()] = hook;
            });
            callback(hooks);
        });
    }

    function loadOne(typeIdentifier, callback){

        var interaction = interactions[typeIdentifier];
        if(interaction){
            requirejs([interaction.file], function(hook){
                callback(hook);
            });
        }else{
            throw 'cannot load the interaction because it is not registered';

        }

    }

    function getPath(typeIdentifier){

        return paths[typeIdentifier];
    }
    
    function isDev(typeIdentifier){
        return interactions[typeIdentifier] && interactions[typeIdentifier].dev;
    }
    
    return {
        register : register,
        loadAll : loadAll,
        loadOne : loadOne,
        getPath : getPath,
        isDev : isDev
    };

});