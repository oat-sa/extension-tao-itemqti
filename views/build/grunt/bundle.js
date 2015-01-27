module.exports = function(grunt) { 

    var requirejs   = grunt.config('requirejs') || {};
    var clean       = grunt.config('clean') || {};
    var copy        = grunt.config('copy') || {};
    var replace     = grunt.config('replace') || {};
    var uglify      = grunt.config('uglify') || {};

    var root        = grunt.option('root');
    var libs        = grunt.option('mainlibs');
    var ext         = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);

    /**
     * Resolve AMD modules in the current extension
     */
    var creatorLibsPattern  = ['views/js/qtiCreator/**/*.js', 'views/js/qtiXmlRenderer/renderers/**/*.js', '!views/js/qtiCreator/test/**/*.js'];
    var creatorLibs         = ext.getExtensionSources('taoQtiItem', creatorLibsPattern, true);

    var runtimeLibsPattern  = ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js',  'views/js/qtiCommonRenderer/helpers/**/*.js'];
    var runtimeLibs         = ext.getExtensionSources('taoQtiItem', runtimeLibsPattern, true);

    /**
     * Remove bundled and bundling files
     */
    clean.taoqtiitembundle = ['output',  root + '/taoQtiItem/views/js/controllers.min.js'];
    clean.qtiruntime = ['output',  root + '/taoQtiItem/views/js/runtime/qtiLoader.min.js', root + '/taoQtiItem/views/js/runtime/qtiBoostrap.min.js'];
    
    /**
     * Controller 
     */
    requirejs.taoqtiitembundle = {
        options: {
            baseUrl : '../js',
            dir : 'output',
            mainConfigFile : './config/requirejs.build.js',
            paths : { 'taoQtiItem' : root + '/taoQtiItem/views/js', 'taoQtiItemCss' :  root + '/taoQtiItem/views/css', 'taoItems' : root + '/taoItems/views/js'},
            modules : [{
                name: 'taoQtiItem/controller/routes',
                include : ext.getExtensionsControllers(['taoQtiItem']).concat(creatorLibs),
                exclude : ['mathJax', 'mediaElement'].concat(libs)
            }]
        }
    };

    /**
     * Compile the qti runtime
     */
    requirejs.qtiruntime = {
        options: {
            baseUrl : '../js',
            dir: 'output',
            mainConfigFile : './config/requirejs.build.js',
            paths : { 'taoQtiItem' : root + '/taoQtiItem/views/js', 'taoQtiItemCss' :  root + '/taoQtiItem/views/css'},
            modules : [{
                name: 'taoQtiItem/runtime/qtiBootstrap',
                include: runtimeLibs,
                exclude : ['json!i18ntr/messages.json', 'mathJax', 'mediaElement'],
            }]
        }
    };

    /**
     * copy the bundles to the right place
     */
    copy.taoqtiitembundle = {
        files: [
            { src: ['output/taoQtiItem/controller/routes.js'],  dest: root + '/taoQtiItem/views/js/controllers.min.js' },
            { src: ['output/taoQtiItem/controller/routes.js.map'],  dest: root + '/taoQtiItem/views/js/controllers.min.js.map' }
        ]
    };

    //the qti loader is uglify outside the r.js to split the file loading (qtiLoader.min published within the item and qtiBootstrap shared)
    uglify.qtiruntime = {
        files : { 
            'output/qtiLoader.min.js' : ['../js/lib/require.js', root + '/taoQtiItem/views/js/runtime/qtiLoader.js']
        }
    };
    
    //we need to change the names of AMD modules to referr to minimified verrsions
    replace.qtiruntime = {
         options: {
             patterns: [{
                match : 'taoQtiItem/runtime/qtiBootstrap',
                replacement:  'taoQtiItem/runtime/qtiBootstrap.min',
                expression: false
             }],
             force : true,
             prefix: ''
         },
         files : [ 
             { src: ['output/taoQtiItem/runtime/qtiBootstrap.js'],  dest: root + '/taoQtiItem/views/js/runtime/qtiBootstrap.min.js' },
             { src: ['output/qtiLoader.min.js'],  dest: root + '/taoQtiItem/views/js/runtime/qtiLoader.min.js' }
         ]
    };

    grunt.config('clean', clean);
    grunt.config('requirejs', requirejs);
    grunt.config('copy', copy);
    grunt.config('uglify', uglify);
    grunt.config('replace', replace);

    // bundle task
    grunt.registerTask('qtiruntime', ['clean:qtiruntime', 'requirejs:qtiruntime', 'uglify:qtiruntime', 'replace:qtiruntime']);
    grunt.registerTask('taoqtiitembundle', ['clean:taoqtiitembundle', 'requirejs:taoqtiitembundle', 'copy:taoqtiitembundle']);

};
