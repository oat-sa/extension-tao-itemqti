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
        reload: false,
        enabledOnly : false,//to be removed?
        runtimeOnly : [],//replace by includeOnly,
        reloadProvider : false,
        reloadInteraction : false
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

    var isCreatable = function isCreatable(pciModel){
        return pciModel.creator && pciModel.creator.hook && pciModel.enabled;
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

        return eventifier(_.defaults(methods || {}, {
            _registry : {},
            get : function get(typeIdentifier, version){

                if(this._registry[typeIdentifier]){
                    //check version
                    if(version){
                        return _.find(this._registry[typeIdentifier], version);
                    }else{
                        //latest
                        return _.last(this._registry[typeIdentifier]);
                    }
                }
            },
            registerProvider : function registerProvider(moduleName, provider){
                __providers[moduleName] = isPortableElementProvider(provider) ? provider : null;
                return this;
            },
            resetProviders : function resetProviders(){
                __providers = {};
                _loaded = false;
                return this;
            },
            loadProviders : function loadProviders(options){
                var self = this;
                var loadPromise;

                if(_loaded && !options.reloadProvider){//rename to reloadAll
                    loadPromise = Promise.resolve();
                } else {
                    loadPromise = new Promise(function(resolve, reject) {
                        var providerLoadingStack = [];
                        _.forIn(__providers, function(provider, id){
                            if(provider === null){
                                providerLoadingStack.push(id);
                            }
                        });
                        _requirejs(providerLoadingStack, function(){
                            _.each([].slice.call(arguments), function(provider){
                                if(isPortableElementProvider(provider)){
                                    __providers[providerLoadingStack.shift()] = provider;
                                }
                            });
                            resolve();
                            self.trigger('providersloaded');
                        }, reject);
                    });
                }

                return loadPromise;
            },
            getAllVersions : function getAllVersions(){
                var all = {};
                _.forIn(this._registry, function (versions, id){
                    all[id] = _.map(versions, 'version');
                });
                return all;
            },
            getRuntime : function getRuntime(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                if(pci){
                    return _.assign(pci.runtime, {
                        id : pci.typeIdentifier,
                        label : pci.label,
                        baseUrl : pci.baseUrl,
                        model : pci.model
                    });
                }else{
                    this.trigger('error', {
                        message : 'no portable element runtime found',
                        typeIdentifier : typeIdentifier,
                        version : version
                    });
                }
            },
            getCreator : function getCreator(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                if(pci && pci.creator){
                    return _.assign(pci.creator, {
                        id : pci.typeIdentifier,
                        label : pci.label,
                        baseUrl : pci.baseUrl,
                        response : pci.response,
                        model : pci.model,
                        xmlns : pci.xmlns
                    });
                }else{
                    this.trigger('error', {
                        message : 'no portable element runtime found',
                        typeIdentifier : typeIdentifier,
                        version : version
                    });
                }
            },
            getLatestCreators : function getLatestCreators(){
                var all = {};
                _.forIn(this._registry, function (versions, id){
                    var lastVersion = _.last(versions);
                    if(isCreatable(lastVersion)){
                        all[id] = lastVersion;
                    }
                });
                return all;
            },
            getBaseUrl : function getBaseUrl(typeIdentifier, version){
                var runtime = this.get(typeIdentifier, version);
                if(runtime){
                    return runtime.baseUrl;
                }
                return '';
            },
            loadRuntimes : function loadRuntimes(options){
                var self = this;
                var loadPromise;

                options = _.defaults(options||{}, _defaultLoadingOptions);

                if(_loaded && !options.reload && !options.reloadProvider){//rename to reloadInteraction
                    loadPromise = Promise.resolve();
                } else {
                    loadPromise = self.loadProviders(options).then(function(){

                        var loadStack = [];

                        _.forEach(__providers, function (provider){
                            if(provider){//check that the provider is loaded
                                loadStack.push(provider.load());
                            }
                        });

                        //performs the loadings in parallel
                        return new Promise(function(resolve, reject){
                            Promise.all(loadStack).then(function (results){

                                var configLoadingStack = [];

                                //update registry
                                self._registry = _.reduce(results, function (acc, _pcis){
                                    return _.merge(acc, _pcis);
                                }, {});

                                //pre-configuring the baseUrl of the portable element's source
                                _.forIn(self._registry, function (versions, typeIdentifier){
                                    //currently use latest runtime only
                                    //if(_.isArray(options.exclude) && _.indexOf(options.exclude, typeIdentifier) >= 0){
                                    //    return true;
                                    //}
                                    if(_.isArray(options.include) && _.indexOf(options.include, typeIdentifier) < 0){
                                        return true;
                                    }
                                    configLoadingStack.push(loadModuleConfig(self.get(typeIdentifier)));
                                });

                                console.log(self._registry, configLoadingStack);

                                return Promise.all(configLoadingStack).then(function(moduleConfigs){
                                    var requireConfigAliases = _.reduce(moduleConfigs, function(acc, paths){
                                        return _.merge(acc, paths);
                                    }, {});

                                    //save the required libs name => path to global require alias
                                    //TODO in future planned user story : change this to a local require context to solve conflicts in third party module naming
                                    _requirejs.config({paths : requireConfigAliases});

                                    _loaded = true;

                                    resolve();
                                }).catch(function(err){
                                    reject('error loading module config ' + err);
                                });
                            });
                        });

                    });
                }

                loadPromise
                    .then(function() {
                        self.trigger('runtimesloaded');
                    })
                    .catch(function(err) {
                        self.trigger('error', err);
                    });

                return loadPromise;
            },
            loadCreators : function loadCreators(options){
                var loadPromise;
                var self = this;

                options = _.defaults(options||{}, _defaultLoadingOptions);

                loadPromise = self.loadRuntimes(options).then(function(){
                    var requiredCreatorHooks = [];
                    var requiredCreators = _.isArray(options.runtimeOnly) ? options.runtimeOnly : [];//this may go

                    _.forIn(self._registry, function (versions, typeIdentifier){
                        var pciModel = self.get(typeIdentifier);//currently use the latest version only
                        if(pciModel.creator && pciModel.creator.hook && (pciModel.enabled || requiredCreators.indexOf(typeIdentifier) !== -1)){

                            //if(_.isArray(options.exclude) && _.indexOf(options.exclude, typeIdentifier) >= 0){
                            //    return true;
                            //}

                            if(_.isArray(options.include) && _.indexOf(options.include, typeIdentifier) < 0){
                                return true;
                            }

                            requiredCreatorHooks.push(pciModel.creator.hook.replace(/\.js$/, ''));
                        }
                    });

                    if(requiredCreatorHooks.length){
                        return new Promise(function(resolve, reject){
                            //@todo support caching?
                            _requirejs(requiredCreatorHooks, function (){
                                var creators = {};
                                _.each(arguments, function (creatorHook){
                                    var id = creatorHook.getTypeIdentifier();
                                    var pciModel = self.get(id);
                                    var i = _.findIndex(self._registry[id], {version : pciModel.version});
                                    if(i < 0){
                                        self.trigger('error', 'no creator found for id/version ' + id + '/' + pciModel.version);
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
            enable: function enable(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                if(pci){
                    pci.enabled = true;
                }
            },
            disable: function disable(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                if(pci){
                    pci.enabled = false;
                }
            },
            isEnabled: function isEnabled(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                return (pci && pci.enabled === true);
            }
        }));
    };
});