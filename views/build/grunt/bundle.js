module.exports = function (grunt) {
    'use strict';

    var clean     = grunt.config('clean') || {};
    var copy      = grunt.config('copy') || {};
    var creatorLibs;
    var ext;
    var libs      = grunt.option('mainlibs');
    var out       = 'output';
    var paths;
    var replace   = grunt.config('replace') || {};
    var requirejs = grunt.config('requirejs') || {};
    var root      = grunt.option('root');
    var runtimeLibs;
    var uglify    = grunt.config('uglify') || {};

    ext = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    paths = {
        taoQtiItem:                  root + '/taoQtiItem/views/js',
        taoQtiItemCss:               root + '/taoQtiItem/views/css',
        taoItems:                    root + '/taoItems/views/js',
        taoItemsCss:                 root + '/taoItems/views/css',
        qtiCustomInteractionContext: root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
        qtiInfoControlContext:       root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext',
    };

    /**
     * Resolve AMD modules in the current extension
     */
    creatorLibs = ext.getExtensionSources('taoQtiItem', ['views/js/qtiCreator/**/*.js', 'views/js/qtiXmlRenderer/renderers/**/*.js', '!views/js/qtiCreator/test/**/*.js'], true);
    runtimeLibs = ext.getExtensionSources('taoQtiItem', ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js', 'views/js/qtiCommonRenderer/helpers/**/*.js'], true);

    /**
     * Remove bundled and bundling files
     */
    clean.taoqtiitem_bundle = [out];

    /**
     * Controller
     */
    requirejs.taoqtiitem_bundle = {
        options: {
            exclude: ['mathJax'].concat(libs).concat(ext.getExtensionSources('taoItems', ['views/js/**/*.js'])),
            include: ext.getExtensionsControllers(['taoQtiItem']).concat(creatorLibs),
            out: out + '/taoQtiItem/controllers.min.js',
            paths: paths
        }
    };

    /**
     * Compile the qti runtime
     */
    requirejs.taoqtiitem_runtime_bundle = {
        options: {
            exclude: ['json!i18ntr/messages.json', 'mathJax'].concat(libs).concat(ext.getExtensionSources('taoItems', ['views/js/**/*.js'])),
            include: runtimeLibs,
            out: out + '/taoQtiItem/qtiBootstrap.min.js',
            paths: paths
        }
    };

    /**
     * Compile the new item runner as a standalone library
     */
    requirejs.qtinewrunner = {
        options: {
            uglify2: {
                mangle: false,
                output: {
                    'max_line_len': 400
                }
            },
            wrap: {
                start: '',
                end: "define(['taoQtiItem/runner/qtiItemRunner'], function(runner){ return runner; });"
            },
            wrapShim: true,
            inlineCss: true,
            paths: {
                taoQtiItem:                  root + '/taoQtiItem/views/js',
                taoQtiItemCss:               root + '/taoQtiItem/views/css',
                taoItems:                    root + '/taoItems/views/js',
                taoCss:                      root + '/tao/views/css',
                jquery:                      'lib/jqueryamd-1.8.3',
                'taoQtiItemCss/qti':         root + '/taoQtiItem/views/css/qti-runner',
                qtiCustomInteractionContext: root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
                qtiInfoControlContext:       root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext',
            },
            excludeShallow: ['mathJax', 'ckeditor'],
            include: runtimeLibs.concat([ 'tpl', 'json']),
            name: 'taoQtiItem/runner/qtiItemRunner',
            out: out + '/qtiItemRunner.min.js'
        }
    };

    /**
     * Compile the new item runner as a standalone library
     */
    requirejs.qtiscorer = {
        options: {
            //optimize: 'none',
            uglify2: {
                mangle: false,
                output: {
                    max_line_len: 400
                }
            },
            wrap: {
                start: '',
                end: "define(['taoQtiItem/scoring/qtiScorer'], function(scorer){ return scorer; });"
            },
            wrapShim: true,
            paths: paths,
            include: ['lodash'],
            name: 'taoQtiItem/scoring/qtiScorer',
            out: out + '/qtiScorer.min.js'
        }
    };

    /**
     * copy the bundles to the right place
     */
    copy.taoqtiitem_bundle = {
        files: [
            { src: [ out + '/taoQtiItem/controllers.min.js'],     dest: root + '/taoQtiItem/views/dist/controllers.min.js' },
            { src: [ out + '/taoQtiItem/controllers.min.js.map'], dest: root + '/taoQtiItem/views/dist/controllers.min.js.map' }
        ]
    };

    /**
     * copy the bundles to the right place
     */
    copy.taoqtiitem_runtime_bundle = {
        files: [
            { src: [ out + '/taoQtiItem/qtiBootstrap.min.js'],     dest: root + '/taoQtiItem/views/dist/qtiBootstrap.min.js' },
            { src: [ out + '/taoQtiItem/qtiBootstrap.min.js.map'], dest: root + '/taoQtiItem/views/dist/qtiBootstrap.min.js.map' }
        ]
    };

    //the qti loader is uglify outside the r.js to split the file loading (qtiLoader.min published within the item and qtiBootstrap shared)
    // todo: evaluate this
    uglify.qtiruntime = {
        options: {
            force: true
        },
        files: [
            { src: ['../js/lib/require.js', root + '/taoQtiItem/views/js/runtime/qtiLoader.js'], dest: out + '/qtiLoader.min.js', }
        ]
    };

    //we need to change the names of AMD modules to referr to minimified verrsions
    // todo: evaluate this. is it needed anymore?
    // replace.qtiruntime = {
    //     options: {
    //         patterns: [{
    //             match: 'qtiBootstrap',
    //             replacement: 'qtiBootstrap.min',
    //             expression: false
    //         }],
    //         force: true,
    //         prefix: ''
    //     },
    //     files: [
    //          { src: [ out + '/taoQtiItem/runtime/qtiBootstrap.js'], dest: root + '/taoQtiItem/views/js/runtime/qtiBootstrap.min.js' },
    //          { src: [ out + '/qtiLoader.min.js'],                   dest: root + '/taoQtiItem/views/js/runtime/qtiLoader.min.js' }
    //     ]
    // };

    grunt.config('clean', clean);
    grunt.config('requirejs', requirejs);
    grunt.config('copy', copy);
    grunt.config('uglify', uglify);
    grunt.config('replace', replace);

    // bundle task
    grunt.registerTask('qtiruntime', [
        'clean:taoqtiitem_bundle',
        'requirejs:taoqtiitem_runtime_bundle',
        'uglify:qtiruntime',
        // 'replace:qtiruntime',
        'copy:taoqtiitem_runtime_bundle'
    ]);
    grunt.registerTask('taoqtiitembundle', [
        'clean:taoqtiitem_bundle',
        'requirejs:taoqtiitem_bundle', // taoqtiitem_bundle
        'copy:taoqtiitem_bundle',
        'requirejs:taoqtiitem_runtime_bundle', // taoqtiitem_runtime_bundle
        'uglify:qtiruntime',
        // 'replace:qtiruntime',
        'copy:taoqtiitem_runtime_bundle'
    ]);

};
