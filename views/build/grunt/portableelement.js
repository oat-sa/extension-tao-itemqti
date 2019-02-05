/**
 * Register the portable element compilation task for a given TAO extension
 *
 * @example compile all portable element in the extension qtiItemPci
 * grunt portableelement --extension=qtiItemPci
 *
 * @example compile only the likertScaleInteraction in the extension qtiItemPci
 * grunt portableelement --extension=qtiItemPci --identifier=likertScaleInteraction
 *
 * @example compile only the likertScaleInteraction in the extension qtiItemPci using short param
 * grunt portableelement -e=qtiItemPci -i=likertScaleInteraction
 */
module.exports = function (grunt) {
    'use strict';

    var root = grunt.option('root');
    var requirejs = grunt.option('requirejsModule');
    var ext = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    var amdConfig = require(root + '/tao/views/build/config/requirejs.build.json');

    var portableModels = [
        {
            type : 'PCI',
            file : 'pciCreator.json',
            searchPattern : '/views/js/pciCreator/**/pciCreator.json'
        },
        {
            type : 'IMSPCI',
            file : 'imsPciCreator.json',
            searchPattern : '/views/js/pciCreator/**/imsPciCreator.json'
        },
        {
            type : 'PIC',
            file : 'picCreator.json',
            searchPattern : '/views/js/picCreator/**/picCreator.json'
        }
    ];

    grunt.config.merge({
        portableelement: {
            options: {
                optimize: 'uglify2',
                uglify2: {
                    mangle: false,
                    output: {
                        'max_line_len': 666
                    }
                },
                preserveLicenseComments: false,
                optimizeAllPluginResources: true,
                findNestedDependencies: true,
                skipDirOptimize: true,
                optimizeCss: 'none',
                buildCss: false,
                inlineText: true,
                skipPragmas: true,
                generateSourceMaps: true,
                removeCombined: true,
                baseUrl: amdConfig.baseUrl,
                shim : amdConfig.shim,
                excludeShallow: ['mathJax'],
                exclude: ['qtiCustomInteractionContext', 'qtiInfoControlContext']
                    .concat(ext.getExtensionSources('taoQtiItem', ['views/js/qtiItem/**/*.js', 'views/js/qtiCreator/**/*.js'], true))
                    .concat(ext.getExtensionSources('taoItems', ['views/js/**/*.js'], true)),
                paths: Object.assign({
                    'taoItems': root + '/taoItems/views/js',
                    'taoItemsCss': root + '/taoItems/views/css',
                    'taoQtiItem': root + '/taoQtiItem/views/js',
                    'qtiCustomInteractionContext': root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
                    'qtiInfoControlContext': root + '/taoQtiItem/views/js/runtime/qtiInfoControlContext'
                }, amdConfig.paths)
            }
        }
    });

    /**
     * Get the name of entry point for the portable element
     * @param {Object} pciRuntimeData - the runtime object from the portable element manifest
     * @param {String} prefix - the prefix identifier of the portable element
     * @returns {String}
     */
    function getHookFileName(pciRuntimeData, prefix) {
        if (Array.isArray(pciRuntimeData.src) && pciRuntimeData.src.length > 0) {
            //by convention the first module is the hook file
            return pciRuntimeData.src[0]
                .replace(/\.js$/i, '')
                .replace(/^\.\//, prefix + '/');
        }
    }

    /**
     * Get the name of the min file for the portable element
     * @param {Object} pciRuntimeData - the runtime object from the portable element manifest
     * @returns {String}
     */
    function getMinHookFile(pciRuntimeData) {
        var minHookFile;
        if (pciRuntimeData.hook) {
            minHookFile = pciRuntimeData.hook;
        } else if (Array.isArray(pciRuntimeData.libraries) && pciRuntimeData.libraries.length > 0) {
            //by convention the first module is the min file
            minHookFile = pciRuntimeData.libraries[0];
        }
        if(minHookFile){
            return minHookFile.replace(/^\.\//, '');
        }
    }

    /**
     * Print report when all promises are resolved/rejected
     * @param {Array|Function} report
     */
    function printReport(report) {
        if(Array.isArray(report)){
            report.forEach(function (r) {
                printReport(r);
            });
        }else if(typeof report === 'function'){
            report.call();
        }
    }

    /**
     * Get the portable element model from its manifest file
     * @param file
     * @returns {*}
     */
    function getPortableModelFromFile(file){
        var model;
        portableModels.forEach(function(portableModel){
            if(file.match(new RegExp('\/' + portableModel.file + '$'))){
                model = {};
                model.type = portableModel.type;
                model.manifest = grunt.file.readJSON(file);
                model.basePath = file.replace('/' + portableModel.file, '');
                model.id = model.manifest.typeIdentifier;
                model.map = [
                    {
                        name : 'RUNTIME',
                        src : getHookFileName(model.manifest.runtime, model.id),
                        min : getMinHookFile(model.manifest.runtime)
                    },
                    {
                        name : 'CREATOR',
                        src : getHookFileName(model.manifest.creator, model.id),
                        min : getMinHookFile(model.manifest.creator)
                    }
                ];
                return false;
            }
        });
        return model;
    }

    grunt.registerTask('portableelement', 'Compile Portable Elements', function () {

        var done = this.async();//async mode because requirejs optimization is an async process
        var extension = grunt.option('extension') || grunt.option('e');
        var selectedId = grunt.option('identifier') || grunt.option('i');
        var manifests, compileTasks;
        var self = this;

        if(!extension){
            grunt.log.error('Missing the extension in param, e.g. "grunt portableelement -e=qtiItemPci"');
            return done();
        }

        grunt.log.writeln('Started optimizing portable elements in extension "' + extension + '"');

        if(selectedId){
            grunt.log.writeln('Only searching portable element "' + selectedId + '"');
        }

        manifests = portableModels.reduce(function(acc, model) {
            return grunt.file.expand(root + '/' + extension + model.searchPattern).concat(acc);
        }, []);

        compileTasks = manifests.map(function(file){

            var config;
            var model = getPortableModelFromFile(file);
            var subcompilationPromises = [];

            if(!model){
                //not the targeted one
                return Promise.resolve([grunt.log.error.bind(null, 'invalid portable manifest file ' + file)]);
            }

            if(selectedId && selectedId !== model.id){
                //not the targeted one
                return Promise.resolve([]);
            }

            subcompilationPromises.push([grunt.log.subhead.bind(null, model.type + ' "' + model.id + '" found in manifest "' + file + '" ...')]);

            model.map.forEach(function(compilMap){
                subcompilationPromises.push(new Promise(function(resolve, reject){
                    var report = [];

                    if (!compilMap.src) {
                        //when no source file has been found, skip the compilation
                        report.push(grunt.log.ok.bind(null, 'No source file defined for ' + model.type +' "' + model.id + '" - '+compilMap.name));
                        return resolve(report);
                    }

                    //extends the default configuration with portable element specific build config
                    config = self.options({
                        name: compilMap.src,
                        out: model.basePath + '/' + compilMap.min,

                        //this wrapping is required to allow self loading portable element module.
                        wrap: {
                            start: '',
                            end: "define(['" + compilMap.src + "'],function(" + model.type + '){return ' + model.type + '});'
                        }
                        //(note: the option "insertRequire" does not work because it is resolved asynchronously)
                    });

                    // Add the path to the given extension for portableLib resolution
                    config.paths[extension] = root + '/' + extension + '/views/js';
                    config.paths[model.id] = model.basePath;

                    requirejs.optimize(config, function (buildResponse) {
                        report.push(grunt.log.ok.bind(null, 'Compiled ' + model.type + ' "' + model.id + '" - ' + compilMap.name));
                        report.push(grunt.log.writeln.bind(null, buildResponse));
                        resolve(report);
                    }, function (err) {
                        report.push(grunt.log.error.bind(null, model.type + ' "' + model.id + '" ' + compilMap.name + ' cannot be compiled'));
                        report.push(grunt.log.error.bind(null, err));
                        reject(report);
                    });
                }));
            });

            return Promise.all(subcompilationPromises);
        });

        if (compileTasks.length) {
            Promise.all(compileTasks).then(function (report) {
                printReport(report);
                done();
            }).catch(function (report) {
                printReport(report);
                done();
            });
        } else {
            grunt.log.writeln('no portable element to be compiled in extension "'+extension+'"');
            done();
        }
    });
};
