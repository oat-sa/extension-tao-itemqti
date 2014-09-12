define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/customInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/runtime/qtiCustomInteractionContext',
    'taoQtiItem/qtiItem/helper/util',
    'context'
], function(_, tpl, Helper, qtiCustomInteractionContext, util, context){

    /**
     * Set the customInteractionContext from a local context to the global one to make it available to all PCI instances
     * 
     * @returns {undefined}
     */
    var _registerGlobalPciContext = function(){

        window.qtiCustomInteractionContext = window.qtiCustomInteractionContext || qtiCustomInteractionContext;
    };

    /**
     * Register the libraries in 'paths' into requiresjs
     * The requirejs config will be specific to PCIs, the sepcific context 'portableCustomInteraction' is defined as a consequence
     * 
     * @param {Object} paths - the plain object, key/value of the 
     */
    var _registerLibraries = function(paths){

        window.require.config({
            context : 'portableCustomInteraction',
            paths : paths
        });
    };

    /**
     * Call requirejs.require() in the specific context of 'portableCustomInteraction'
     * 
     * @param {array} modules - list of the amd modules names or scripts names 
     * @param {type} callback
     */
    var _pciRequire = function(modules, callback){

        var pciReq = window.require.config({context : 'portableCustomInteraction'});
        pciReq(modules, callback);
    };

    /**
     * Get the PCI instance associated to the interaction object
     * If none exists, create a new one based on the PCI typeIdentifier
     * 
     * @param {Object} interaction - the js object representing the interaction
     * @returns {Object} PCI instance
     */
    var _getPci = function(interaction){

        var pciTypeIdentifier,
            pci = interaction.data('pci') || undefined;

        if(!pci){

            pciTypeIdentifier = interaction.typeIdentifier;
            pci = qtiCustomInteractionContext.createPciInstance(pciTypeIdentifier);

            if(pci){

                //binds the PCI instance to TAO interaction object and vice versa
                interaction.data('pci', pci);
                pci._taoCustomInteraction = interaction;

            }else{
                throw 'no custom interaction hook found for the type ' + pciTypeIdentifier;
            }
        }

        return pci;
    };

    /**
     * Get the list of required modules to be loaded for interaction rendering
     * 
     * @param {Object} interaction
     * @param {String} baseUrl
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
     * Execute javascript codes to bring the interaction to life.
     * At this point, the html markup must already be ready in the document.
     * 
     * It is done in 5 steps : 
     * 1. register required libs in the "portableCustomInteraction" context
     * 2. require all required libs
     * 3. create a pci instance based on the interaction model
     * 4. initialize the rendering 
     * 5. restore full state if applicable (state and/or response)
     * 
     * @param {Object} interaction
     */
    var render = function(interaction, options){
        
        options = options || {};
        
        _registerGlobalPciContext();
        _registerLibraries({
            css : context.root_url + 'tao/views/js/lib/require-css/css'
        });

        //get pci id
        var id = interaction.attr('responseIdentifier');
        var $dom = Helper.getContainer(interaction).find('#' + id);
        
        //get initialization params :
        var state = null, //@todo
            response = null, //@todo 
            config = interaction.properties,
            libraries = _getLibraries(interaction, options.baseUrl ? options.baseUrl : this.getOption('baseUrl'));

        /**
         * The libraries (js or css) will all be loaded asynchronously
         * The sequence they have been defined indeed does not matter
         */
        _pciRequire(libraries, function(){

            var pci = _getPci(interaction);
            if(pci){
                //call pci initialize() to render the pci
                pci.initialize(id, $dom[0], config);

                //restore context (state + response)
                pci.setSerializedState(state);
                pci.setResponse(response);
            }

        });

    };

    /**
     * Programmatically set the response following the json schema described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     * 
     * @param {Object} interaction
     * @param {Object} response
     */
    var setResponse = function(interaction, response){

        _getPci(interaction).setResponse(response);
    };

    /**
     * Get the response in the json format described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     * 
     * @param {Object} interaction
     * @returns {Object}
     */
    var getResponse = function(interaction){

        return _getPci(interaction).getResponse();
    };

    /**
     * Remove the current response set in the interaction
     * The state may not be restored at this point.
     * 
     * @param {Object} interaction
     */
    var resetResponse = function(interaction){

        _getPci(interaction).resetResponse();
    };

    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains 
     * Event listeners are removed and the state and the response are reset
     * 
     * @param {Object} interaction
     */
    var destroy = function(interaction){

        _getPci(interaction).destroy();
    };

    /**
     * Restore the state of the interaction from the serializedState.
     * 
     * @param {Object} interaction
     * @param {Object} serializedState - json format
     */
    var setSerializedState = function(interaction, serializedState){

        _getPci(interaction).setSerializedState(serializedState);
    };

    /**
     * Get the current state of the interaction as a string.
     * It enables saving the state for later usage.
     * 
     * @param {Object} interaction
     * @returns {Object} json format
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
        getSerializedState : getSerializedState,
        setSerializedState : setSerializedState
    };
});