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

const { join } = require('path');

module.exports = function (grunt) {
    'use strict';

    const root = grunt.option('root');
    const requirejs = grunt.option('requirejsModule');
    const babel = grunt.option('babelModule');
    const ext = require(join(root, '/tao/views/build/tasks/helpers/extensions.js'))(grunt, root);
    const amdConfig = require(join(root, '/tao/views/build/config/requirejs.build.json'));

    const portableModels = [
        {
            type: 'PCI', //deprecated
            file: 'pciCreator.json',
            searchPattern: '/views/js/pciCreator/**/pciCreator.json'
        },
        {
            type: 'IMSPCI',
            file: 'imsPciCreator.json',
            searchPattern: '/views/js/pciCreator/**/imsPciCreator.json'
        },
        {
            type: 'PIC', //deprecated
            file: 'picCreator.json',
            searchPattern: '/views/js/picCreator/**/picCreator.json'
        }
    ];

    grunt.config.merge({
        portableelement: {
            options: {
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
                shim: amdConfig.shim,
                excludeShallow: ['mathJax'],
                exclude: ['qtiCustomInteractionContext', 'qtiInfoControlContext']
                    .concat(
                        ext.getExtensionSources(
                            'taoQtiItem',
                            ['views/js/qtiItem/**/*.js', 'views/js/qtiCreator/**/*.js'],
                            true
                        )
                    )
                    .concat(ext.getExtensionSources('taoItems', ['views/js/**/*.js'], true)),
                paths: Object.assign(
                    {},
                    amdConfig.paths,
                    {
                        taoItems: `${root}/taoItems/views/js`,
                        taoItemsCss: `${root}/taoItems/views/css`,
                        taoQtiItem: `${root}/taoQtiItem/views/js`,
                        taoQtiItemCss: `${root}/taoQtiItem/views/css`,
                        qtiCustomInteractionContext: `${root}/taoQtiItem/views/js/runtime/qtiCustomInteractionContext`,
                        qtiInfoControlContext: `${root}/taoQtiItem/views/js/runtime/qtiInfoControlContext`,
                        'lib/handlebars/moduleWriter': `${root}/taoQtiItem/views/build/moduleWriter`
                    },
                    require('./paths.json')
                )
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
            return pciRuntimeData.src[0].replace(/\.js$/i, '').replace(/^\.\//, `${prefix}/`);
        }
    }

    /**
     * Get the name of the min file for the portable element
     * @param {Object} pciRuntimeData - the runtime object from the portable element manifest
     * @returns {String}
     */
    function getMinHookFile(pciRuntimeData) {
        let minHookFile;
        if (pciRuntimeData.hook) {
            minHookFile = pciRuntimeData.hook;
        } else if (Array.isArray(pciRuntimeData.libraries) && pciRuntimeData.libraries.length > 0) {
            //by convention the first module is the min file
            minHookFile = pciRuntimeData.libraries[0];
        }
        if (minHookFile) {
            return minHookFile.replace(/^\.\//, '');
        }
    }

    /**
     * Print report when all promises are resolved/rejected
     * @param {Array|Function} report
     */
    function printReport(report) {
        if (Array.isArray(report)) {
            report.forEach(function (r) {
                printReport(r);
            });
        } else if (typeof report === 'function') {
            report.call();
        }
    }

    /**
     * Get the portable element model from its manifest file
     * @param {string} file
     * @returns {*}
     */
    function getPortableModelFromFile(file) {
        let model;
        portableModels.forEach(function (portableModel) {
            if (file.match(new RegExp(`/${portableModel.file}$`))) {
                model = {};
                model.type = portableModel.type;
                model.manifest = grunt.file.readJSON(file);
                model.basePath = file.replace(`/${portableModel.file}`, '');
                model.id = model.manifest.typeIdentifier;
                model.map = [
                    {
                        name: 'RUNTIME',
                        src: getHookFileName(model.manifest.runtime, model.id),
                        min: getMinHookFile(model.manifest.runtime)
                    },
                    {
                        name: 'CREATOR',
                        src: getHookFileName(model.manifest.creator, model.id),
                        min: getMinHookFile(model.manifest.creator)
                    }
                ];
                return false;
            }
        });
        return model;
    }

    function transpile(sourceFilePath, sourceMapFilePath) {
        if (!grunt.file.exists(sourceFilePath)) {
            return Promise.reject(new Error(`Unable to find or read "${sourceFilePath}"`));
        }
        const code = grunt.file.read(sourceFilePath);

        const hasSourceMap = grunt.file.exists(sourceMapFilePath);
        const sourceMap = hasSourceMap ? grunt.file.read(sourceMapFilePath) : null;

        return babel
            .transformAsync(code, {
                presets: [
                    [
                        '@babel/env',
                        {
                            targets: 'extends @oat-sa/browserslist-config-tao',
                            useBuiltIns: false
                        }
                    ],
                    [
                        'minify',
                        {
                            mangle: false,
                            builtIns: false
                        }
                    ]
                ],
                sourceMap: hasSourceMap,
                inputSourceMap: hasSourceMap ? JSON.parse(sourceMap) : void 0,
                comments: false,
                sourceType: 'script'
            })
            .then(transformResult => {
                if (transformResult && transformResult.code) {
                    grunt.file.write(sourceFilePath, transformResult.code);
                }
                if (hasSourceMap && transformResult.map) {
                    grunt.file.write(sourceMapFilePath, JSON.stringify(transformResult.map));
                }
            });
    }

    grunt.registerTask('portableelement', 'Compile Portable Elements', function () {
        const done = this.async();
        const extension = grunt.option('extension') || grunt.option('e');
        const selectedId = grunt.option('identifier') || grunt.option('i');
        const type = grunt.option('type');
        let models, manifests, compileTasks;

        if (!extension) {
            grunt.log.error('Missing the extension in param, e.g. "grunt portableelement -e=qtiItemPci"');
            return done();
        }
        if (type && !portableModels.find(model => model.type === type)) {
            grunt.log.error(`Unrecognised type "${type}"`);
            return done();
        }

        grunt.log.writeln(`Started optimizing portable elements in extension "${extension}"`);

        if (selectedId) {
            grunt.log.writeln(`Only searching portable element "${selectedId}"`);
        }

        models = type ? portableModels.filter(model => model.type === type) : portableModels;

        manifests = models.reduce(
            (acc, model) => grunt.file.expand(join(root, extension, model.searchPattern)).concat(acc),
            []
        );

        compileTasks = manifests.map(file => {
            let config;
            const model = getPortableModelFromFile(file);
            const subcompilationPromises = [];

            if (!model) {
                //not the targeted one
                return Promise.resolve([grunt.log.error.bind(null, `invalid portable manifest file ${file}`)]);
            }

            if (selectedId && selectedId !== model.id) {
                //not the targeted one
                return Promise.resolve([]);
            }

            subcompilationPromises.push([
                grunt.log.subhead.bind(null, `${model.type} "${model.id}" found in manifest "${file}" ...`)
            ]);

            model.map.forEach(compilMap => {
                subcompilationPromises.push(
                    new Promise((resolve, reject) => {
                        const report = [];

                        if (!compilMap.src) {
                            //when no source file has been found, skip the compilation
                            report.push(
                                grunt.log.ok.bind(
                                    null,
                                    `No source file defined for ${model.type} "${model.id}" - ${compilMap.name}`
                                )
                            );
                            return resolve(report);
                        }

                        const outputFile = join(model.basePath, compilMap.min);

                        //extends the default configuration with portable element specific build config
                        config = this.options({
                            name: compilMap.src,
                            out: outputFile,

                            //this wrapping is required to allow self loading portable element module.
                            wrap: {
                                start: '',
                                end: `define(['${compilMap.src}'],function(${model.type}){return ${model.type}});`
                            }
                            //(note: the option "insertRequire" does not work because it is resolved asynchronously)
                        });

                        // Add the path to the given extension for portableLib resolution
                        config.paths[extension] = `${root}/${extension}/views/js`;
                        config.paths[model.id] = model.basePath;

                        requirejs.optimize(
                            config,
                            function (buildResponse) {
                                report.push(
                                    grunt.log.ok.bind(null, `Compiled ${model.type} "${model.id}" - ${compilMap.name}`)
                                );
                                report.push(grunt.log.writeln.bind(null, buildResponse));

                                report.push(grunt.log.writeln.bind(null, `Transpile ${outputFile}`));
                                transpile(outputFile, `${outputFile}.map`)
                                    .then(() => {
                                        report.push(grunt.log.ok.bind(null, `${outputFile} updated.`));
                                        resolve(report);
                                    })
                                    .catch(err => {
                                        report.push(grunt.log.error.bind(null, err));
                                        reject(report);
                                    });
                            },
                            function (err) {
                                report.push(
                                    grunt.log.error.bind(
                                        null,
                                        `${model.type} "${model.id}" ${compilMap.name} cannot be compiled`
                                    )
                                );
                                report.push(grunt.log.error.bind(null, err));
                                reject(report);
                            }
                        );
                    })
                );
            });

            return Promise.all(subcompilationPromises);
        });

        if (compileTasks.length) {
            Promise.all(compileTasks)
                .then(function (report) {
                    printReport(report);
                    done();
                })
                .catch(function (report) {
                    printReport(report);
                    done();
                });
        } else {
            grunt.log.writeln(`no portable element to be compiled in extension "${extension}"`);
            done();
        }
    });
};
