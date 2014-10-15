define([
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/infoControl',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
    'taoQtiItem/runtime/qtiInfoControlContext',
    'taoQtiItem/qtiItem/helper/util',
    'context'
], function(tpl, Helper, PortableElement, qtiInfoControlContext, util, context){

    var _reqContext = 'portableInfoControl';

    /**
     * Get the PIC instance associated to the infoControl object
     * If none exists, create a new one based on the PIC typeIdentifier
     * 
     * @param {Object} infoControl - the js object representing the infoControl
     * @returns {Object} PIC instance
     */
    var _getPic = function(infoControl){

        var typeIdentifier,
            pic = infoControl.data('pic') || undefined;

        if(!pic){

            typeIdentifier = infoControl.typeIdentifier;
            pic = qtiInfoControlContext.createPciInstance(typeIdentifier);

            if(pic){

                //binds the PIC instance to TAO infoControl object and vice versa
                infoControl.data('pic', pic);
                pic._taoInfoControl = infoControl;

            }else{
                throw 'no custom infoControl hook found for the type ' + typeIdentifier;
            }
        }

        return pic;
    };

    /**
     * Execute javascript codes to bring the infoControl to life.
     * At this point, the html markup must already be ready in the document.
     * 
     * It is done in 5 steps : 
     * 1. register required libs in the "portableInfoControl" context
     * 2. require all required libs
     * 3. create a pic instance based on the infoControl model
     * 4. initialize the rendering 
     * 5. restore full state if applicable
     * 
     * @param {Object} infoControl
     */
    var render = function(infoControl, options){

        options = options || {};

        PortableElement.registerCommonLibraries(_reqContext);
        PortableElement.registerLibraries(_reqContext, {
            qtiInfoControlContext : context.root_url + 'taoQtiItem/views/js/runtime/qtiInfoControlContext'
        });
        
        var id = infoControl.attr('id'),
            $dom = Helper.getContainer(infoControl).children();
        
        //get initialization params :
        //@todo pass state to renderer here:
        var state = {},
            config = infoControl.properties,
            entryPoint = util.fullpath(infoControl.entryPoint, this.getOption('baseUrl'));
        
        /**
         * The libraries (js or css) will all be loaded asynchronously
         * The sequence they have been defined indeed does not matter
         */
        PortableElement.require(_reqContext, [entryPoint], function(){
            
            var pic = _getPic(infoControl);
            if(pic){
                //call pic initialize() to render the pic
                pic.initialize(id, $dom[0], config);

                //restore context (state)
                pic.setSerializedState(state);
            }
            
        });

    };

    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains 
     * Event listeners are removed and the state and the response are reset
     * 
     * @param {Object} infoControl
     */
    var destroy = function(infoControl){

        _getPic(infoControl).destroy();
    };

    /**
     * Restore the state of the infoControl from the serializedState.
     * 
     * @param {Object} infoControl
     * @param {Object} serializedState - json format
     */
    var setSerializedState = function(infoControl, serializedState){

        _getPic(infoControl).setSerializedState(serializedState);
    };

    /**
     * Get the current state of the infoControl as a string.
     * It enables saving the state for later usage.
     * 
     * @param {Object} infoControl
     * @returns {Object} json format
     */
    var getSerializedState = function(infoControl){

        return _getPic(infoControl).getSerializedState();
    };

    return {
        qtiClass : 'infoControl',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        destroy : destroy,
        getSerializedState : getSerializedState,
        setSerializedState : setSerializedState
    };
});