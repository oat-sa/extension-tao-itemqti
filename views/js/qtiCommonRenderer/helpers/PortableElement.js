define(['context', 'lodash', 'jquery', 'taoQtiItem/qtiItem/helper/util'], function(context, _, $, util){
    
    /**
     * Get the location of the document, useful to define a baseUrl for the required context
     * @returns {String}
     */
    function getDocumentBaseUrl(){
        return window.location.protocol + '//' + window.location.host + window.location.pathname.replace(/([^\/]*)$/, '');
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
            OAT : sharedLibrariesUrl + 'OAT',
            'OAT/MathJax' : sharedLibrariesUrl + 'OAT/math/MathJax.min',
            'OAT/MathJaxAssets' : sharedLibrariesUrl + 'OAT/math/assets/',
        };
    }
    
    /**
     * Get lists of required OAT delivery engine libs
     * 
     * @returns {Object}
     */
    function getCommonLibraries(){
        return {
            css : context.root_url + 'tao/views/js/lib/require-css/css'
        };
    }
    
    /**
     * Replace all identified relative media urls by the absolute one
     * 
     * @param {String} markupStr
     * @param {String} baseUrl
     * @returns {String}
     */
    function replaceMarkupMediaSource(markupStr, baseUrl){

        var $markup = $('<div>', {'class' : 'wrapper'}).html(markupStr);

        $markup.find('img').each(function(){

            var $img = $(this),
                src = $img.attr('src'),
                fullPath = util.fullpath(src, baseUrl);

            $img.attr('src', fullPath);
        });

        return $markup.html();
    }
    
    /**
     * Get a local require js with typeIdentifier as specific context
     * 
     * @param {String} typeIdentifier
     * @param {String} baseUrl
     * @param {Object} libs
     * @returns {Function} - RequireJs instance
     */
    function getLocalRequire(typeIdentifier, baseUrl, libs, config){
        
        libs = libs || {};
        libs = _.defaults(libs, getCommonLibraries());
        libs = _.defaults(libs, getSharedLibrariesPaths());
        
        //add local namespace
        libs[typeIdentifier] = baseUrl + typeIdentifier;
    
        return window.require.config({
            context : typeIdentifier,//use unique typeIdentifier as context name
            baseUrl : baseUrl,
            paths : libs || {},
            config : {
                qtiCustomInteractionContext : {
                    defined : libs
                },
                qtiInfoControlContext : {
                    defined : libs
                }
            }
        });
    }
    
    /**
     * local require js caches
     * 
     * @type Object
     */
    var _localRequires = {};
    
    /**
     * Get a cached local require js with typeIdentifier as specific context
     * If it does not exsits, it creates one.
     * Warning only the typeIdentifier and baseUrl will be used as key (not libs)
     * This means that if you want to ensure that the baseUrl and libs are different,
     * you may want to use getLocalRequire instead
     * 
     * @param {String} typeIdentifier
     * @param {String} baseUrl
     * @param {Object} libs
     * @returns {Function} - RequireJs instance
     */
    function getCachedLocalRequire(typeIdentifier, baseUrl, libs, config){
        
        _localRequires[typeIdentifier] = _localRequires[typeIdentifier] || {};
        if(!_localRequires[typeIdentifier][baseUrl]){
            _localRequires[typeIdentifier][baseUrl] = getLocalRequire(typeIdentifier, baseUrl, libs, config);
        }
        return _localRequires[typeIdentifier][baseUrl];
    }
    
    function purgeCache(){
        _localRequires = {};
    }
    
    return {
        getSharedLibrariesPaths : getSharedLibrariesPaths,
        getCommonLibraries : getCommonLibraries,
        replaceMarkupMediaSource : replaceMarkupMediaSource,
        getDocumentBaseUrl : getDocumentBaseUrl,
        getLocalRequire : getLocalRequire,
        getCachedLocalRequire : getCachedLocalRequire,
        purgeCache : purgeCache
    };
});