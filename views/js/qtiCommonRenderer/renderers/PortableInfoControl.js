define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/portableInfoControl',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/runtime/qtiInfoControlContext',
    'taoQtiItem/qtiItem/helper/util',
    'context'
], function(_, tpl, Helper, qtiInfoControlContext, util, context){

    /**
     * Set the InfoControlContext from a local context to the global one to make it available to all PIC instances
     * 
     * @returns {undefined}
     */
    var _registerGlobalPciContext = function(){

        window.qtiInfoControlContext = window.qtiInfoControlContext || qtiInfoControlContext;
    };

    /**
     * Register the libraries in 'paths' into requiresjs
     * The requirejs config will be specific to PCIs, the sepcific context 'portableInfoControl' is defined as a consequence
     * 
     * @param {Object} paths - the plain object, key/value of the 
     */
    var _registerLibraries = function(paths){

        window.require.config({
            context : 'portableInfoControl',
            paths : paths
        });
    };

    /**
     * Call requirejs.require() in the specific context of 'portableInfoControl'
     * 
     * @param {array} modules - list of the amd modules names or scripts names 
     * @param {type} callback
     */
    var _portableElementRequire = function(modules, callback){ 

        var portableEltReq = window.require.config({context : 'portableInfoControl'});
        portableEltReq(modules, callback);
    };

    /**
     * Get the PIC instance associated to the portableElement object
     * If none exists, create a new one based on the PIC typeIdentifier
     * 
     * @param {Object} portableElement - the js object representing the portableElement
     * @returns {Object} portableElement instance
     */
    var _getPortableElementInstance = function(portableElement){

        var typeIdentifier,
            hookInstance = portableElement.data('portableElement') || undefined;

        if(!hookInstance){
            
            typeIdentifier = portableElement.typeIdentifier;
            hookInstance = qtiInfoControlContext.createPicInstance(typeIdentifier);

            if(hookInstance){

                //binds the PIC hookInstance to TAO portableElement object and vice versa
                portableElement.data('portableElement', hookInstance);
                hookInstance._taoInfoControl = portableElement;

            }else{
                throw 'no custom portableElement hook found for the type ' + typeIdentifier;
            }
        }

        return hookInstance;
    };

    /**
     * Get the list of required modules to be loaded for portableElement rendering
     * 
     * @param {Object} portableElement
     * @param {String} baseUrl
     * @returns {Array}
     */
    var _getLibraries = function(portableElement, baseUrl){

        var libraries = _.clone(portableElement.libraries) || [],
            ret = [],
            paths = {};
        
        //currently, include entryPoint as a lib to be all loaded at once
        libraries[portableElement.typeIdentifier + '.entryPoint'] = portableElement.entryPoint;
        
        //require the actual shared and shareable libs (that support the implementation of the portableElement)
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
     * Execute javascript codes to bring the portableElement to life.
     * At this point, the html markup must already be ready in the document.
     * 
     * It is done in 5 steps : 
     * 1. register required libs in the "portableInfoControl" context
     * 2. require all required libs
     * 3. create a portableElement instance based on the portableElement model
     * 4. initialize the rendering 
     * 5. restore full state if applicable (state and/or response)
     * 
     * @param {Object} portableElement
     */
    var render = function(portableElement, options){

        options = options || {};

        _registerGlobalPciContext();
        _registerLibraries({
            css : context.root_url + 'tao/views/js/lib/require-css/css'
        });

        //get portableElement id
        var id = portableElement.attr('id');
        var $dom = Helper.getContainer(portableElement).find('#' + id);

        //get initialization params :
        var state = null, //@todo
            config = portableElement.properties,
            libraries = _getLibraries(portableElement, options.baseUrl ? options.baseUrl : this.getOption('baseUrl'));

        /**
         * The libraries (js or css) will all be loaded asynchronously
         * The sequence they have been defined indeed does not matter
         */
        _portableElementRequire(libraries, function(){

            var hookInstance = _getPortableElementInstance(portableElement);
            if(hookInstance){
                //call portableElement initialize() to render the portableElement
                hookInstance.initialize(id, $dom[0], config);

                //restore context (state + response)
                hookInstance.setSerializedState(state);
            }

        });

    };

    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains 
     * Event listeners are removed and the state and the response are reset
     * 
     * @param {Object} portableElement
     */
    var destroy = function(portableElement){

        _getPortableElementInstance(portableElement).destroy();
    };

    /**
     * Restore the state of the portableElement from the serializedState.
     * 
     * @param {Object} portableElement
     * @param {Object} serializedState - json format
     */
    var setSerializedState = function(portableElement, serializedState){

        _getPortableElementInstance(portableElement).setSerializedState(serializedState);
    };

    /**
     * Get the current state of the portableElement as a string.
     * It enables saving the state for later usage.
     * 
     * @param {Object} portableElement
     * @returns {Object} json format
     */
    var getSerializedState = function(portableElement){

        return _getPortableElementInstance(portableElement).getSerializedState();
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