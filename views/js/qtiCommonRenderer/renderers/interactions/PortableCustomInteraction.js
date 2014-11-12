define([
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/customInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
    'taoQtiItem/runtime/qtiCustomInteractionContext',
    'taoQtiItem/qtiItem/helper/util',
    'lodash',
    'context'
], function(tpl, Helper, PortableElement, qtiCustomInteractionContext, util, _, context){

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

        var id = interaction.attr('responseIdentifier'),
            typeIdentifier = interaction.typeIdentifier,
            baseUrl = this.getOption('baseUrl') || PortableElement.getDocumentBaseUrl(), //require a base url !
            runtimeLocations = options.runtimeLocations ? options.runtimeLocations : this.getOption('runtimeLocations'),
            config = _.clone(interaction.properties), //pass a clone instead
            entryPoint = this.getAbsoluteUrl(interaction.entryPoint),
            $dom = Helper.getContainer(interaction).children(),
            localRequirePaths = {
                qtiCustomInteractionContext : context.root_url + 'taoQtiItem/views/js/runtime/qtiCustomInteractionContext'
            },
            localRequireConfig = {},
            state = {}, //@todo pass state and response to renderer here:
            response = {base : null};

        if(runtimeLocations && runtimeLocations[typeIdentifier]){
            //we are overwriting the runtime libs location:
            localRequireConfig.runtimeLocation = runtimeLocations[typeIdentifier];
//            if(interaction.entryPoint.indexOf(typeIdentifier) === 0){
//                entryPoint = interaction.entryPoint.replace(typeIdentifier, runtimeLocations[typeIdentifier]);
//            }
        }

        //create a new require context to load the libs: 
        var localRequire = PortableElement.getCachedLocalRequire(typeIdentifier, baseUrl, localRequirePaths, localRequireConfig);

        localRequire([entryPoint], function(){

            var pci = _getPci(interaction);
            if(pci){
                //call pci initialize() to render the pci
                pci.initialize(id, $dom[0], config);
                //restore context (state + response)
                pci.setSerializedState(state);
                pci.setResponse(response);
                //call callback function
                interaction.triggerPciReady(pci);
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
        getData : function(customInteraction, data){

            data.markup = PortableElement.replaceMarkupMediaSource(data.markup, this.getOption('baseUrl'));

            return data;
        },
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