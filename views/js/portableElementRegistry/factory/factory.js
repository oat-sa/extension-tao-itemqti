/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define(['core/promise', 'core/eventifier'], function (Promise, eventifier){
    'use strict';

    var _requirejs = window.require;
    var _defaultLoadingOptions = {
        reload: false
    };

    var loadModuleConfig = function loadModuleConfig(manifest){
        return new Promise(function(resolve, reject){
            var requireConfigAliases = {};
            var baseUrl;
            var reqConfigs = [];
            var modules = {};

            if(!manifest || !manifest.runtime){
                return reject('invalid manifest');
            }

            baseUrl = manifest.baseUrl;

            if (Array.isArray(manifest.runtime.config) && manifest.runtime.config.length) {
                for (var i = 0; i < manifest.runtime.config.length; i++) {
                    var pciConfig = manifest.runtime.config[i];

                    if (typeof pciConfig === 'string') {
                        reqConfigs.push('json!' + baseUrl + '/' + pciConfig);
                    } else {
                        if (pciConfig.data) {
                            for (var key in pciConfig.data.paths) {
                                if (pciConfig.data.paths.hasOwnProperty(key) && typeof modules[key] === 'undefined') {
                                    modules[key] = pciConfig.data.paths[key];
                                }
                            }
                        } else if (pciConfig.file) {
                            reqConfigs.push('json!' + baseUrl + '/' + pciConfig.file);
                        }
                    }
                }
            }

            require(reqConfigs, function(){

                var runtimeModules = {};

                requireConfigAliases[manifest.typeIdentifier] = baseUrl;

                if(manifest.model === 'IMSPCI'){

                    var accumulatedModules = modules;
                    for (var i = 0; i < arguments.length; i++) {
                        var conf = arguments[i];
                        for (var key in conf.paths) {
                            if (conf.paths.hasOwnProperty(key) && typeof accumulatedModules[key] === 'undefined') {
                                accumulatedModules[key] = conf.paths[key];
                            }
                        }
                    }
                    modules = accumulatedModules;

                    var runtimeModules = {};
                    for (var id in manifest.runtime.modules) {
                        if (manifest.runtime.modules.hasOwnProperty(id)) {
                            var paths = manifest.runtime.modules[id];
                            if (paths && (typeof paths === 'string' || (Array.isArray(paths) && paths.length))) {
                                runtimeModules[id] = paths;
                            }
                        }
                    }

                    for (var key in runtimeModules) {
                        if (runtimeModules.hasOwnProperty(key)) {
                            modules[key] = runtimeModules[key];
                        }
                    }

                    var requireConfigAliases = {};
                    for (var id in modules) {
                        if (modules.hasOwnProperty(id)) {
                            var paths = modules[id];
                            paths = Array.isArray(paths) ? paths : [paths];
                            requireConfigAliases[id] = paths.map(function(path) {
                                return baseUrl + '/' + path.replace(/\.js$/, '');
                            });
                        }
                    }
                }

                resolve(requireConfigAliases);

            }, reject);


        });
    };

    /**
     * Evaluate if the given object is a proper portable element provider
     * @param {Object} provider
     * @returns {Boolean}
     */
    var isPortableElementProvider = function isPortableElementProvider(provider){
        return (provider && typeof provider.load === 'function');
    };

    return function portableElementRegistry(methods){

        var _loaded = false;
        var __providers = {};

        /**
         * The portable element registry instance
         * @typedef {portableElementRegistry}
         */
        return eventifier(Object.assign(methods || {}, {
            _registry : {},

            /**
             * Get a register portable element
             * @param {String} typeIdentifier
             * @param {String} version
             * @returns {Object}
             */
            get : function get(typeIdentifier, version){

                if (this._registry[typeIdentifier]) {
                    //check version
                    if (version) {
                        return this._registry[typeIdentifier].find(pe => pe.version === version);
                    } else {
                        //latest
                        return this._registry[typeIdentifier][this._registry[typeIdentifier].length - 1];
                    }
                }
            },

            /**
             * Register a portable element provider
             * @param moduleName
             * @param {String|Object }provider - the portable provider object or module name
             * @returns {portableElementRegistry}
             */
            registerProvider : function registerProvider(moduleName, provider){
                __providers[moduleName] = isPortableElementProvider(provider) ? provider : null;
                _loaded = false;
                return this;
            },

            /**
             * Clear all previously registered providers
             * @returns {portableElementRegistry}
             */
            resetProviders : function resetProviders(){
                __providers = {};
                _loaded = false;
                return this;
            },

            /**
             * Load the providers
             * @param {Object} [options]
             * @param {Boolean} [options.reload] - force to reload the registered providers
             * @returns {Promise}
             */
            loadProviders : function loadProviders(options){
                var self = this;
                var loadPromise;

                if(_loaded && !options.reload){
                    loadPromise = Promise.resolve([]);
                } else {
                    loadPromise = new Promise(function(resolve, reject) {
                        var providerLoadingStack = Object.keys(__providers).filter(id => __providers[id] === null);
                        _requirejs(providerLoadingStack, function() {
                            Array.from(arguments).forEach(provider => {
                                if (isPortableElementProvider(provider)) {
                                    __providers[providerLoadingStack.shift()] = provider;
                                }
                            });
                            resolve(__providers);
                            _loaded = true;
                            self.trigger('providersloaded', __providers);
                        }, reject);
                    });
                }

                return loadPromise;
            },

            /**
             * Get all versions of all portable elements registered
             * @returns {Object} - all portable elements and their versions
             */
            getAllVersions : function getAllVersions(){
                var all = {};
                for (let id in this._registry) {
                    all[id] = this._registry[id].map(pe => pe.version);
                }
                return all;
            },

            /**
             * Get the runtime for a given portable element
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {Object} the runtime model
             */
            getRuntime : function getRuntime(typeIdentifier, version){
                var portableElement = this.get(typeIdentifier, version);
                if(portableElement){
                    return Object.assign(portableElement.runtime, {
                        id: portableElement.typeIdentifier,
                        label: portableElement.label,
                        baseUrl: portableElement.baseUrl,
                        model: portableElement.model
                    });
                }else{
                    this.trigger('error', {
                        message : 'no portable element runtime found',
                        typeIdentifier : typeIdentifier,
                        version : version
                    });
                }
            },

            /**
             * Get the creator model for a given portable element
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {Object} the creator model
             */
            getCreator : function getCreator(typeIdentifier, version){
                var portableElement = this.get(typeIdentifier, version);
                if(portableElement && portableElement.creator){
                    return Object.assign(portableElement.creator, {
                        id: portableElement.typeIdentifier,
                        label: portableElement.label,
                        baseUrl: portableElement.baseUrl,
                        response: portableElement.response,
                        model: portableElement.model,
                        xmlns: portableElement.xmlns
                    });
                }else{
                    this.trigger('error', {
                        message : 'no portable element runtime found',
                        typeIdentifier : typeIdentifier,
                        version : version
                    });
                }
            },

            /**
             * Returned all enabled created from the registry
             * @returns {Object} the collection of creators
             */
            getLatestCreators : function getLatestCreators(){
                var all = {};
                for (const [id, versions] of Object.entries(this._registry)) {
                    const lastVersion = versions[versions.length - 1];

                    // check if the portable element is creatable:
                    if (lastVersion.creator && lastVersion.creator.hook && lastVersion.enabled) {
                        all[id] = lastVersion;
                    }
                }
                return all;
            },

            /**
             * Get the baseUrl for a given portable element
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {String} the base url
             */
            getBaseUrl : function getBaseUrl(typeIdentifier, version){
                var runtime = this.get(typeIdentifier, version);
                if(runtime){
                    return runtime.baseUrl;
                }
                return '';
            },

            /**
             * Load the runtimes from registered portable element provider(s)
             *
             * @param {Object} [options]
             * @param {Array} [options.include] - the exact list of portable element typeIdentifier that should be loaded
             * @param {Boolean} [options.reload] - tells if all interactions should be reloaded
             * @returns {Promise}
             */
            loadRuntimes : function loadRuntimes(options){
                var self = this;
                var loadPromise;

                options = {
                    ..._defaultLoadingOptions,
                    ...(options || {})
                };

                loadPromise = self.loadProviders(options).then(function(providers){

                        var loadStack = [];

                    for (let provider of providers) {
                        if (provider) {//check that the provider is loaded
                            loadStack.push(provider.load());
                        }
                    }

                        //performs the loadings in parallel
                            return Promise.all(loadStack).then(function (results){//TODO could remove one level of promise

                                var configLoadingStack = [];

                                //update registry
                                self._registry = results.reduce(function(acc, _pcis) {
                                    return Object.assign(acc, _pcis);
                                }, self._registry || {}); // incremental loading

                                //pre-configuring the baseUrl of the portable element's source
                                for (let typeIdentifier in self._registry) {
                                    if (self._registry.hasOwnProperty(typeIdentifier)) {
                                        if (Array.isArray(options.include) && !options.include.includes(typeIdentifier)) {
                                            continue;
                                        }
                                        configLoadingStack.push(loadModuleConfig(self.get(typeIdentifier)));
                                    }
                                }

                                return Promise.all(configLoadingStack).then(function(moduleConfigs){
                                    var requireConfigAliases = moduleConfigs.reduce(function(acc, paths){
                                        return Object.assign(acc, paths);
                                    }, {});

                                    //save the required libs name => path to global require alias
                                    //TODO in future planned user story : change this to a local require context to solve conflicts in third party module naming
                                    _requirejs.config({paths : requireConfigAliases});
                                });
                            });

                    });


                loadPromise
                    .then(function() {
                        self.trigger('runtimesloaded');
                    })
                    .catch(function(err) {
                        self.trigger('error', err);
                    });

                return loadPromise;
            },

            /**
             * Load the creators from registered portable element provider(s)
             *
             * @param {Object} [options]
             * @param {Array} [options.include] - the exact list of portable element typeIdentifier that should be loaded
             * @param {Boolean} [options.reload] - tells if all interactions should be reloaded
             * @returns {Promise}
             */
            loadCreators : function loadCreators(options){
                var loadPromise;
                var self = this;

                options = Object.assign({}, _defaultLoadingOptions, options || {});

                loadPromise = self.loadRuntimes(options).then(function(){
                    var requiredCreatorHooks = [];

                    for (const [typeIdentifier, versions] of Object.entries(self._registry)) {
                        const portableElementModel = self.get(typeIdentifier); //currently use the latest version only
                        if (portableElementModel.creator && portableElementModel.creator.hook) {
                            if (portableElementModel.enabled) {
                                if (Array.isArray(options.include) && !options.include.includes(typeIdentifier)) {
                                    continue;
                                }
                            } else {
                                if (!Array.isArray(options.include) || !options.include.includes(typeIdentifier)) {
                                    continue;
                                }
                            }
                            requiredCreatorHooks.push(portableElementModel.creator.hook.replace(/\.js$/, ''));
                        }
                    }

                    if(requiredCreatorHooks.length){
                        return new Promise(function(resolve, reject){
                            //@todo support caching?
                            _requirejs(requiredCreatorHooks, function (){
                                var creators = {};
                                Array.from(arguments).forEach(function(creatorHook) {
                                    var id = creatorHook.getTypeIdentifier();
                                    var portableElementModel = self.get(id);
                                    var i = self._registry[id].findIndex(function(element) {
                                        return element.version === portableElementModel.version;
                                    });
                                    if (i < 0) {
                                        self.trigger('error', 'no creator found for id/version ' + id + '/' + portableElementModel.version);
                                    } else {
                                        self._registry[id][i].creator.module = creatorHook;
                                        creators[id] = creatorHook;
                                    }
                                });
                                resolve(creators);
                            }, reject);
                        });
                    }else{
                        return Promise.resolve({});
                    }

                });

                loadPromise
                    .then(function(creators) {
                        self.trigger('creatorsloaded', creators);
                        return creators;
                    })
                    .catch(function(err) {
                        self.trigger('error', err);
                    });

                return loadPromise;
            },

            /**
             * enable a portable element
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {portableElementRegistry}
             */
            enable: function enable(typeIdentifier, version){
                var portableElement = this.get(typeIdentifier, version);
                if(portableElement){
                    portableElement.enabled = true;
                }
                return this;
            },

            /**
             * disable a portable element
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {portableElementRegistry}
             */
            disable: function disable(typeIdentifier, version){
                var portableElement = this.get(typeIdentifier, version);
                if(portableElement){
                    portableElement.enabled = false;
                }
                return this;
            },

            /**
             * check is a portable element is enabled
             * @param {String} typeIdentifier
             * @param {String} [version] - if the version is provided, the method will try to find that version
             * @returns {portableElementRegistry}
             */
            isEnabled: function isEnabled(typeIdentifier, version){
                var portableElement = this.get(typeIdentifier, version);
                return (portableElement && portableElement.enabled === true);
            }
        }));
    };
});