define(['context', 'lodash', 'jquery', 'taoQtiItem/qtiItem/helper/util'], function(context, _, $, util){

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
            OAT : sharedLibrariesUrl + 'OAT'
        };
    }
    
    function getCommonLibraries(){
        return {
            css : context.root_url + 'tao/views/js/lib/require-css/css',
            mathJax : context.root_url + 'taoQtiItem/views/js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML-full'
        };
    }

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
    
    function getLocalRequire(typeIdentifier, baseUrl, libs){
        
        libs = libs || {};
        libs = _.defaults(libs, getCommonLibraries());
        libs = _.defaults(libs, getSharedLibrariesPaths());
        
        //add local namespace
        libs[typeIdentifier] = baseUrl + typeIdentifier;
    
        return window.require.config({
            context : typeIdentifier,//use unique typeIdentifier as context name
            baseUrl : baseUrl,
            paths : libs || {},
            shim : {
                mathJax : {
                    exports : "MathJax",
                    init : function(){
                        if(window.MathJax){
                            MathJax.Hub.Config({showMathMenu : false, showMathMenuMSIE : false});//add mathJax config here for now before integrating the amd one
                            MathJax.Hub.Startup.onload();
                            return MathJax;
                        }
                    }
                }
            }
        });
    }
    
    return {
        getSharedLibrariesPaths : getSharedLibrariesPaths,
        getCommonLibraries : getCommonLibraries,
        replaceMarkupMediaSource : replaceMarkupMediaSource,
        getDocumentBaseUrl : getDocumentBaseUrl,
        getLocalRequire : getLocalRequire
    };
});