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
            registerProvider : function registerProvider(moduleName){
                __providers[moduleName] = null;
                return this;
            },
            loadProviders : function loadProviders(callback){
                var self = this;
                var providerLoadingStack = [];
                _.forIn(__providers, function(provider, id){
                    if(provider === null){
                        providerLoadingStack.push(id);
                    }
                });
                _requirejs(providerLoadingStack, function(){
                    _.each([].slice.call(arguments), function(provider){
                        if(provider && _.isFunction(provider.load)){
                            __providers[providerLoadingStack.shift()] = provider;
                    console.log(provider);
                        }
                    });
                    callback();
                    self.trigger('providersloaded');
                });
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
                    return _.assign(pci.runtime, {baseUrl : pci.baseUrl});
                }else{
                    this.trigger('error', 'no portable element runtime found' , typeIdentifier, version);
                }
            },
            getCreator : function getCreator(typeIdentifier, version){
                var pci = this.get(typeIdentifier, version);
                if(pci && pci.creator){
                    return _.assign(pci.creator, {
                        baseUrl : pci.baseUrl,
                        response : pci.response
                    });
                }else{
                    this.trigger('error', 'no portable element creator found' , typeIdentifier, version);
                }
            },
            getBaseUrl : function getBaseUrl(typeIdentifier, version){
                var runtime = this.get(typeIdentifier, version);
                if(runtime){
                    return runtime.baseUrl;
                }
                return '';
            },
            loadRuntimes : function loadRuntimes(callback, reload){

                var self = this;
                var loadStack = [];

                if(_loaded && !reload){
                    callback.call(this);
                    this.trigger('runtimesloaded');
                }else{
                    this.loadProviders(function(){

                        _.each(__providers, function (provider){
                            if(provider){//check that the provider is loaded
                                loadStack.push(provider.load());
                            }
                        });

                        //performs the loadings in parallel
                        Promise.all(loadStack).then(function (results){

                            var requireConfigAliases = {};

                            //update registry
                            self._registry = _.reduce(results, function (acc, _pcis){
                                return _.merge(acc, _pcis);
                            }, {});

                            //pre-configuring the baseUrl of the portable element's source
                            _.forIn(self._registry, function (versions, typeIdentifier){
                                //currently use latest runtime path
                                requireConfigAliases[typeIdentifier] = self.getBaseUrl(typeIdentifier);
                            });
                            _requirejs.config({paths : requireConfigAliases});

                            _loaded = true;

                            callback.call(self);
                            self.trigger('runtimesloaded');

                        }).catch(function (err){

                            self.trigger('error', err);
                        });
                    });
                }

                return this;
            },
            loadCreators : function loadCreators(callback, reload){

                var self = this;
                this.loadRuntimes(function (){
                    var requiredCreators = [];

                    _.forIn(self._registry, function (versions, typeIdentifier){
                        var pciModel = self.get(typeIdentifier);//currently use the latest version only
                        if(pciModel.creator && pciModel.creator.hook){
                            requiredCreators.push(pciModel.creator.hook.replace(/\.js$/, ''));
                        }
                    });

                    if(requiredCreators.length){
                        //@todo support caching
                        _requirejs(requiredCreators, function (){
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

                            callback.call(self, creators);
                            self.trigger('creatorsloaded', creators);
                        });
                    }else{

                        callback.call(self, {});
                        self.trigger('creatorsloaded', {});
                    }

                }, reload);

                return this;
            }
        }));
    }
});