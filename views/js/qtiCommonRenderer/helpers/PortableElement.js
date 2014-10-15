define(['context', 'lodash'], function(context, _){

    /**
     * Register the libraries in 'paths' into requiresjs
     * The requirejs config will be specific to the portable elements, the sepcific context e.g. 'portableCustomInteraction' is defined as a consequence
     * 
     * @param {String} reqContext - the name of the requirejs context
     * @param {Object} paths
     */
    function registerLibraries(reqContext, paths){
        if(reqContext && _.isString(reqContext)){
            window.require.config({
                reqContext : reqContext,
                paths : paths
            });
        }else{
            throw 'a requirejs reqContext name is required';
        }
    }

    /**
     * Call requirejs.require() in a specific context e.g. 'portableCustomInteraction'
     * 
     * @param {String} reqContext - the name of the requirejs context
     * @param {Array} modules - list of the amd modules names or scripts names 
     * @param {Function} callback - function executed after libs are loaded
     */
    function require(reqContext, modules, callback){

        if(reqContext && _.isString(reqContext)){
            var pciReq = window.require.config({reqContext : reqContext});
            pciReq(modules, callback);
        }else{
            throw 'a requirejs reqContext name is required';
        }
    }
    
    /**
     * Get root url of available vendor specific libraries 
     * 
     * @returns {object} - an "associative" array object
     */
    function getSharedLibrariesPaths(){

        // get pci shared libraries url
        var sharedLibrariesUrl = context.root_url + 'taoQtiItem/views/js/portableSharedLibraries/'

        //@todo make this dynamic somehow
        return {
            IMSGlobal : sharedLibrariesUrl + 'IMSGlobal',
            OAT : sharedLibrariesUrl + 'OAT'
        };
    }
    
    /**
     * Register commonly required libraries to make a portable elment hook runnable
     * 
     * @param {String} reqContext
     */
    function registerCommonLibraries(reqContext){

        var paths = getSharedLibrariesPaths();
        paths = _.defaults(paths, {css : context.root_url + 'tao/views/js/lib/require-css/css'});
        registerLibraries(reqContext, paths);

    }

    /**
     * Get the list of required modules to be loaded for portableElement rendering
     * 
     * @param {Object} portableElement
     * @param {String} libsUrl The base URL to find shared libraries.
     * @param {String} baseUrl
     * @returns {Array}
     */
    function getElementLibraries(portableElement, libsUrl, baseUrl){

        var libraries = _.clone(portableElement.libraries) || [],
            ret = [],
            paths = {};

        //currently, include entryPoint as a lib to be all loaded at once
        libraries[portableElement.typeIdentifier + '.entryPoint'] = portableElement.entryPoint;

        //require the actual shared and shareable libs (that support the implementation of the pci)
        _.forIn(libraries, function(href, name){

            if(name.indexOf('.entryPoint') > -1){
                var hrefFull = util.fullpath(href, baseUrl);

                if(/\.js$/.test(hrefFull)){
                    paths[name] = hrefFull.replace(/\.js$/, '');
                    ret.push(name);
                }else if(/\.css$/.test(hrefFull)){
                    paths[name] = hrefFull.replace(/\.css$/, '');
                    ret.push('css!' + name);
                }
            }
        });

        registerLibraries(paths);

        return ret;
    }

    return {
        registerLibraries : registerLibraries,
        require : require,
        getSharedLibrariesPaths : getSharedLibrariesPaths,
        registerCommonLibraries : registerCommonLibraries,
        getElementLibraries : getElementLibraries
    };
});