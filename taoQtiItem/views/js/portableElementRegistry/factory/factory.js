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
define(['lodash', 'core/promise', 'core/eventifier'], function (_, Promise, eventifier){
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

            if(_.isArray(manifest.runtime.config) && manifest.runtime.config.length){
                _.forEach(manifest.runtime.config, function(pciConfig){
                    if(_.isString(pciConfig)){
                        reqConfigs.push('json!' + baseUrl + '/' + pciConfig);
                    }else{
                        if(pciConfig.data){
                            modules = _.defaults(modules, pciConfig.data.paths || {});
                        }else if(pciConfig.file){
                            reqConfigs.push('json!' + baseUrl + '/' + pciConfig.file);
                        }
                    }
                });
            }

            require(reqConfigs, function(){

                var runtimeModules = {};

                requireConfigAliases[manifest.typeIdentifier] = baseUrl;

                if(manifest.model === 'IMSPCI'){

                    modules = _.reduce(arguments, function(acc, conf){
                        return _.defaults(acc, conf.paths || {});
                    }, modules);

                    _.forEach(manifest.runtime.modules || {}, function(paths, id){
                        if(paths && (_.isString(paths) || (_.isArray(paths) && paths.length))){
                            runtimeModules[id] = paths;
                        }
                    });

                    modules = _.merge(modules, runtimeModules);

                    _.forEach(modules, function(paths, id){
                        paths = _.isArray(paths) ? paths : [paths];
                        requireConfigAliases[id] = _.map(paths, function(path){
                            return baseUrl+'/'+path.replace(/\.js$/, '');
                        });
                    });
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
        return (provider && _.isFunction(provider.load));
    };

    return function portableElementRegistry(methods){

        var _loaded = false;
        var __providers = {};

        /**
         * The portable element registry instance
         * @typedef {portableElementRegistry}
         */
        return eventifier(_.defaults(methods || {}, {
            _registry : {},

            /**
             * Get a register portable element
             * @param {String} typeIdentifier
             * @param {String} version
             * @returns {Object}
             */
            get : function get(typeIdentifier, version){

                if(this._registry[typeIdentifier]){
                    //check version
                    if(version){
                        return _.find(this._registry[typeIdentifier], {version : version});
                    }else{
                        //latest
                        return _.last(this._registry[typeIdentifier]);
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
                        var providerLoadingStack = [];
                        _.forIn(__providers, function(provider, id){
                            if(provider === null){
                                providerLoadingStack.push(id);
                            }
                        });
                        _requirejs(providerLoadingStack, function(){
                            _.forEach([].slice.call(arguments), function(provider){
                                if(isPortableElementProvider(provider)){
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
                _.forIn(this._registry, function (versions, id){
                    all[id] = _.map(versions, 'version');
                });
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
                    return _.assign(portableElement.runtime, {
                        id : portableElement.typeIdentifier,
                        label : portableElement.label,
                        baseUrl : portableElement.baseUrl,
                        model : portableElement.model
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
                    return _.assign(portableElement.creator, {
                        id : portableElement.typeIdentifier,
                        label : portableElement.label,
                        baseUrl : portableElement.baseUrl,
                        response : portableElement.response,
                        model : portableElement.model,
                        xmlns : portableElement.xmlns
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
                _.forIn(this._registry, function (versions, id){
                    var lastVersion = _.last(versions);

                    //check if the portable element is creatable:
                    if(lastVersion.creator && lastVersion.creator.hook && lastVersion.enabled){
                        all[id] = lastVersion;
                    }
                });
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

                options = _.defaults(options||{}, _defaultLoadingOptions);

                    loadPromise = self.loadProviders(options).then(function(providers){

                        var loadStack = [];

                        _.forEach(providers, function (provider){
                            if(provider){//check that the provider is loaded
                                loadStack.push(provider.load());
                            }
                        });

                        //performs the loadings in parallel
                            return Promise.all(loadStack).then(function (results){//TODO could remove one level of promise

                                var configLoadingStack = [];

                                //update registry
                                self._registry = _.reduce(results, function (acc, _pcis){
                                    return _.merge(acc, _pcis);
                                }, self._registry || {});//incremental loading

                                //pre-configuring the baseUrl of the portable element's source
                                _.forIn(self._registry, function (versions, typeIdentifier){
                                    if(_.isArray(options.include) && _.indexOf(options.include, typeIdentifier) < 0){
                                        return true;
                                    }
                                    configLoadingStack.push(loadModuleConfig(self.get(typeIdentifier)));
                                });

                                return Promise.all(configLoadingStack).then(function(moduleConfigs){
                                    var requireConfigAliases = _.reduce(moduleConfigs, function(acc, paths){
                                        return _.merge(acc, paths);
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

                options = _.defaults(options||{}, _defaultLoadingOptions);

                loadPromise = self.loadRuntimes(options).then(function(){
                    var requiredCreatorHooks = [];

                    _.forIn(self._registry, function (versions, typeIdentifier){
                        var portableElementModel = self.get(typeIdentifier);//currently use the latest version only
                        if(portableElementModel.creator && portableElementModel.creator.hook){
                            if(portableElementModel.enabled){
                                if(_.isArray(options.include) && _.indexOf(options.include, typeIdentifier) < 0){
                                    return true;
                                }
                            }else{
                                if(!_.isArray(options.include) || _.indexOf(options.include, typeIdentifier) < 0){
                                    return true;
                                }
                            }
                            requiredCreatorHooks.push(portableElementModel.creator.hook.replace(/\.js$/, ''));
                        }
                    });

                    if(requiredCreatorHooks.length){
                        return new Promise(function(resolve, reject){
                            //@todo support caching?
                            _requirejs(requiredCreatorHooks, function (){
                                var creators = {};
                                _.forEach(arguments, function (creatorHook){
                                    var id = creatorHook.getTypeIdentifier();
                                    var portableElementModel = self.get(id);
                                    var i = _.findIndex(self._registry[id], {version : portableElementModel.version});
                                    if(i < 0){
                                        self.trigger('error', 'no creator found for id/version ' + id + '/' + portableElementModel.version);
                                    }else{
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