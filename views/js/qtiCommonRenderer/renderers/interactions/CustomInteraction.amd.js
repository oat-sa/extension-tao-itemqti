define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/customInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/runtime/qtiCustomInteractionContext',
    'taoQtiItem/qtiItem/helper/util',
    'context'
], function(_, tpl, Helper, qtiCustomInteractionContext, util, context){
    
    /**
     * Set the customInteractionContext from local to global context to make it available for all pci instances
     * 
     * @returns {undefined}
     */
    var _registerGlobalPciContext = function(){

        window.qtiCustomInteractionContext = window.qtiCustomInteractionContext || qtiCustomInteractionContext;
    };
    
    /**
     * Register the libs from paths to requiresjs in the 'portableCustomInteraction' context
     * 
     * @param {object} paths - the plain abject, key/value of the 
     */
    var _registerLibraries = function(paths){

        window.require.config({
            context : 'portableCustomInteraction',
            paths : paths
        });
    };
    
    /**
     * Use require js in the specific context of 'portableCustomInteraction'
     * 
     * @param {array} modules - list of the amd modules names or scripts names 
     * @param {type} callback
     * @returns {undefined}
     */
    var _pciRequire = function(modules, callback){

        var pciReq = window.require.config({context : 'portableCustomInteraction'});
        pciReq(modules, callback);
    };
    
    /**
     * Get the pci instance associate to the js interaction object
     * If none exists, create a new one based on the pci typeIdentifier
     * 
     * @param {object} interaction - the js object representing the interaction
     * @returns {unresolved}
     */
    var _getPci = function(interaction){

        var pciTypeIdentifier,
            pci = interaction.data('pci') || undefined;

        if(!pci){

            pciTypeIdentifier = interaction.typeIdentifier;
            pci = qtiCustomInteractionContext.getPci(pciTypeIdentifier);

            if(pci){

                //two-way binding for pci hook and tao interaction
                interaction.data('pci', pci);
                pci._taoCustomInteraction = interaction;

            }else{
                throw 'no custom interaction hook found for the type ' + pciTypeIdentifier;
            }
        }

        return pci;
    };
    
    /**
     * Get the list of required module names to be loaded for the interaction
     * 
     * @param {object} interaction
     * @param {string} baseUrl
     * @returns {Array}
     */
    var _getLibraries = function(interaction, baseUrl){

        var libraries = interaction.libraries || [],
            ret = [],
            paths = {};
        
        _.forIn(libraries, function(href, name){

            var hrefFull = util.fullpath(href, baseUrl);

            if(/\.js$/.test(hrefFull)){
                paths[name] = hrefFull.replace(/\.js$/, '');
                ret.push(name);
            }else if(/\.css$/.test(hrefFull)){
                paths[name] = hrefFull.replace(/\.css$/, '');
                ret.push('css!' + name);
            }

        });

        //register:
        _registerLibraries(paths);

        return ret;
    };
    
    /**
     * Execute javascript code to make the interaction come to life.
     * At this point, the html markup must already be ready in the document.
     * 
     * It is done in 3 steps : 
     * 1. register requires libs in the "portableCustomInteraction" context
     * 2. require all required libs
     * 3. get the pci instance and initialize it
     * 
     * @param {type} interaction
     * @returns {undefined}
     */
    var render = function(interaction){

        _registerGlobalPciContext();
        _registerLibraries({
            css : context.root_url + 'tao/views/js/lib/require-css/css'
        });

        //get pci id
        var id = interaction.attr('responseIdentifier');
        var $dom = Helper.getContainer(interaction).find('#' + id);

        //get initialization params :
        var state = null,
            response = null,
            config = interaction.properties,
            libraries = _getLibraries(interaction, this.getOption('baseUrl'));

        //libraries loading (issues)
        _pciRequire(libraries, function(){

            var pci = _getPci(interaction);
            if(pci){
                //call pci initialize();
                pci.initialize(id, $dom[0], config, state, response);
            }
            
        });
        
    };
    
    /**
     * Programmatically set the response following the json schema described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        _getPci(interaction).setResponse(response);
    };
    
    /**
     * Get the response in the json format described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     * 
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){

        return _getPci(interaction).getResponse();
    };
    
    /**
     * Remove all the response set to the interaction
     * The state may not be restored at this point.
     * 
     * @param {object} interaction
     */
    var resetResponse = function(interaction){

        _getPci(interaction).resetResponse();
    };
    
    /**
     * Reverse operation performed by render()
     * After this function is executed, only the naked markup remains 
     * Event listeners are removed and the state is reset
     * 
     * @param {object} interaction
     */
    var destroy = function(interaction){

        _getPci(interaction).destroy();
    };
    
    /**
     * Restore the full state of the interaction from the serializedState.
     * The response should be rest
     * The serialized string is pci-implementation specific.
     * This function will restore the interaction exactly as the last session left it
     * 
     * @param {object} interaction
     * @param {string} serializedState
     */
    var setSerializedState = function(interaction, serializedState){

        _getPci(interaction).setSerializedState(serializedState);
    };
    
    /**
     * Get the full state of the interaction as a string.
     * It enables saving the state for later usage.
     * The serialized string is pci-implementation specific.
     * 
     * @param {object} interaction
     * @returns {string}
     */
    var getSerializedState = function(interaction){

        return _getPci(interaction).getSerializedState();
    };

    return {
        qtiClass : 'customInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : destroy,
        getSerializedState : getSerializedState
    };
});