define(['jquery', 'lodash'], function($, _){

    var _picHooks = {};
    
    /**
     * Global object accessible by all PICs (Portable Info Controls)
     * 
     * @type Object
     */
    var taoQtiInfoControlContext = {
        /**
         * register a PIC in global registery
         * 
         * @param {Object} picHook
         * @returns {undefined}
         */
        register : function(picHook){
            //@todo check picHook validity
            _picHooks[picHook.getTypeIdentifier()] = picHook;
        },
        /**
         * notify when a PIC is ready for test taker interaction
         * 
         * @param {string} picInstance
         * @fires infocontrolready
         */
        notifyReady : function(picInstance){
            $(document).trigger('infocontrolready', [picInstance._taoInfoControl]);
        },
        /**
         * Get a cloned object representing the PIC instance
         * 
         * @param {string} picTypeIdentifier
         * @returns {Object} clonedPicHook
         */
        createPicInstance : function(picTypeIdentifier){
            if(_picHooks[picTypeIdentifier]){
                return _.cloneDeep(_picHooks[picTypeIdentifier]);
            }
        }
    };

    return taoQtiInfoControlContext;
});