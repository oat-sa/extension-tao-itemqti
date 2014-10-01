define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function(_, qtiElements){

    var requirejs = window.require,
        interactions = {};

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

    /**
     * Load manifest and baseUrl data
     * 
     * @param {Object} customInteractionHooks
     */
    function register(customInteractionHooks){

        var paths = {};

        _(customInteractionHooks).values().each(function(interactionHook){

            if(isValidHook(interactionHook)){

                var id = interactionHook.typeIdentifier;

                //register the hook
                interactions[id] = interactionHook;

                //load customInteraction namespace in requirejs config 
                paths[id] = interactionHook.baseUrl;

                //for compatiblility
                qtiElements.classes['customInteraction.' + id] = {parents : ['customInteraction'], qti : true};
            }
        });

        //register custom interaction paths
        requirejs.config({
            paths : paths
        });
    }

    /**
     * Load all previously registered creator hooks
     * 
     * @param {Function} callback
     */
    function loadAll(callback){

        var required = [];
        _.each(interactions, function(interaction){
            required.push(interaction.file);
        });

        requirejs(required, function(){
            var pciCreators = {};
            _.each(arguments, function(pciCreator){
                var id = pciCreator.getTypeIdentifier();
                pciCreators[id] = pciCreator;
                interactions[id].pciCreator = pciCreator;
            });
            callback(pciCreators);
        });
    }

    /**
     * Load one single creator hook  identified by its typeIdentifier
     * 
     * @param {String} typeIdentifier
     * @param {Function} callback
     */
    function loadOne(typeIdentifier, callback){

        var interaction = interactions[typeIdentifier];
        if(interaction){
            requirejs([interaction.file], function(pciCreator){
                interaction.pciCreator = pciCreator;
                callback(pciCreator);
            });
        }else{
            throw 'cannot load the interaction because it is not registered';
        }

    }

    function getCreator(typeIdentifier){

        var interaction = interactions[typeIdentifier];
        if(interaction){
            if(interaction.pciCreator){
                return interaction.pciCreator
            }else{
                throw 'the custom interaction is not loaded';
            }
        }else{
            throw 'the custom interaction is not registered';
        }
    }

    function isDev(typeIdentifier){
        return interactions[typeIdentifier] && interactions[typeIdentifier].dev;
    }

    function get(typeIdentifier){
        return interactions[typeIdentifier];
    }

    function getBaseUrl(typeIdentifier){
        return get(typeIdentifier).baseUrl;
    }
    
    /**
     * Get authorign data for a custom interaction
     * 
     * @param {String} typeIdentifier
     * @returns {Object}
     */
    function getAuthoringData(typeIdentifier){

        var manifest = getManifest(typeIdentifier);

        return {
            label : manifest.label, //currently no translation available 
            icon : getBaseUrl(typeIdentifier) + manifest.icon, //use baseUrl from context
            short : manifest.short,
            description : manifest.description,
            qtiClass : 'customInteraction.' + manifest.typeIdentifier, //custom interaction is block type
            tags : _.union(['Custom Interactions'], manifest.tags)
        };
    }
    
    /**
     * Get complete manifest object for a custom interaction
     * 
     * @param {String} typeIdentifier
     * @returns {Object}
     */
    function getManifest(typeIdentifier){
        return get(typeIdentifier).manifest;
    }
    
    function isDev(typeIdentifier){
        return interactions[typeIdentifier] && interactions[typeIdentifier].dev;
    }
    
    return {
        register : register,
        loadAll : loadAll,
        loadOne : loadOne,
        getBaseUrl : getBaseUrl,
        getCreator : getCreator,
        isDev : isDev,
        get : get,
        getAuthoringData : getAuthoringData,
        getManifest : getManifest
    };

});