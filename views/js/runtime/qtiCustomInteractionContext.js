define(['IMSGlobal/jquery_2_1_1', 'OAT/lodash'], function($, _){
    
    //need a global reference to have pciHooks shared in two different requirejs context ("default" and "portableCustomInteraction")
    window._pciHooks = window._pciHooks||{};
    
    /**
     * Global object accessible by all PCIs
     * 
     * @type Object
     */
    var taoQtiCustomInteractionContext = {
        /**
         * register a custom interaction (its runtime model) in global registery
         * register a renderer
         * 
         * @param {Object} pciHook
         * @returns {undefined}
         */
        register : function(pciHook){
            //@todo check pciHook validity
            window._pciHooks[pciHook.getTypeIdentifier()] = pciHook;
        },
        /**
         * notify when a custom interaction is ready for test taker interaction
         * 
         * @param {string} pciInstance
         * @fires custominteractionready
         */
        notifyReady : function(pciInstance){
            $(document).trigger('custominteractionready', [pciInstance._taoCustomInteraction]);
        },
        /**
         * notify when a custom interaction is completed by test taker
         * 
         * @param {string} pciInstance
         * @fires custominteractiondone
         */
        notifyDone : function(pciInstance){
            $(document).trigger('custominteractiondone', [pciInstance._taoCustomInteraction]);
        },
        /**
         * Get a cloned object representing the PCI model
         * 
         * @param {string} pciTypeIdentifier
         * @returns {Object} clonedPciModel
         */
        createPciInstance : function(pciTypeIdentifier){
            if(window._pciHooks[pciTypeIdentifier]){
                return _.cloneDeep(window._pciHooks[pciTypeIdentifier]);
            }
        }
    };

    return taoQtiCustomInteractionContext;
});