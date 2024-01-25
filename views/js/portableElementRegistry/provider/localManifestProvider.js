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
define(['lodash', 'context', 'core/promise'], function(_, context, Promise){
    'use strict';

    var _portableElementManifests = {};
    var _registry = {};
    var _moduleName = 'taoQtiItem/portableElementRegistry/provider/localManifestProvider';

    /**
     * Recursively set the prefix of portable element path
     * e.g. transform a relative local path "./runtime/entrypoint.js" to "prefix/runtime/entrypoint.js"
     *
     * @param {Object|String|Array} obj
     * @param {String} prefix
     * @returns {Object|String|Array}
     */
    function setPortableElementPrefix(obj, prefix){
        var ret;
        if(_.isArray(obj)){
            ret = _.map(obj, function(v){
                return setPortableElementPrefix(v, prefix);
            });
        }else if(_.isPlainObject(obj)){
            ret = {};
            _.forIn(obj, function(v, k){
                ret[k] = setPortableElementPrefix(v, prefix);
            });
        }else if(_.isString(obj)){
            ret = obj.replace('./', prefix+'/');
        }
        return ret;
    }

    /**
     * Use portable element source if exists
     *
     * @param {Object} manifest - the manifest of the pci to be modified
     * @returns {Object} the modified manifest
     */
    function useSource(manifest){
        var runtimeModules,
            runtimeSrc,
            typeIdentifier;

        // Make sure that we use the unbundled runtime
        if (manifest.model === "IMSPCI") {
            runtimeModules = (manifest.runtime || {}).modules;
            runtimeSrc = (manifest.runtime || {}).src || [];

            // in case of a TAO bundled PCI (= we have a "src" entry),
            // we redirect the module to the entry point of the PCI instead of its minified version
            if (runtimeSrc.length) {
                _.forOwn(runtimeModules, function(allModulesFiles, moduleKey) {
                    if (moduleKey.indexOf('.min') === (moduleKey.length - '.min'.length)) {
                        runtimeModules[moduleKey] = allModulesFiles.map(function(filePath) {
                            return filePath.replace('.min.js', '.js');
                        });
                    }
                });
            }

        } else {
            if(manifest.runtime && _.isArray(manifest.runtime.src)){
                delete manifest.runtime.hook;//hook is going to be removed with the support of IMS PCI v1
                manifest.runtime.libraries = manifest.runtime.src;
            }
            if(manifest.creator && _.isArray(manifest.creator.src)){
                delete manifest.creator.hook;//hook is going to be removed with the support of IMS PCI v1
                manifest.creator.libraries = manifest.creator.src;
            }
        }
        return manifest;
    }

    /**
     * Generic portable element provider than loads portable elements from their manifest.
     * It is useful for testing if the portable element source location is easily accessible.
     *
     * Sample usage :
     *
     * localManifestProvider.addManifestPath('pci_A', 'qtiItemPci/pciCreator/dev/pci_A/pciCreator.json');
     * localManifestProvider.addManifestPath('pci_B', 'taoExtB/pciCreator/dev/pci_B/pciCreator.json');
     * localManifestProvider.addManifestPath('pci_C', 'qtiSamples/some/path/pci_C/pciCreator.json');
     * ciRegistry.registerProvider(pciTestProvider.getModuleName());
     *
     */
    return {
        /**
         * Add testing
         * @param id
         * @param pathToManifest
         */
        addManifestPath : function addManifestPath(id, pathToManifest){
            _portableElementManifests[id] = pathToManifest;
            return this;
        },
        /**
         * Get the amd module name
         * @returns {string}
         */
        getModuleName : function getModuleName(){
            return _moduleName;
        },
        /**
         * Implementation of the mandatory method load() of a portable element provider
         *
         * @returns {Promise} resolved when the added pci registered through their manifest are loaded
         */
        load : function load(){
            return new Promise(function(resolve, reject){
                var _requiredManifests = _.map(_portableElementManifests, function(manifest){
                    return 'json!'+manifest;
                });
                require(_requiredManifests, function(){
                    var ok = true;
                    _.forEach([].slice.call(arguments), function(manifest){
                        var id;
                        if(manifest && manifest.typeIdentifier){
                            id = manifest.typeIdentifier;
                            if(!_portableElementManifests[id]){
                                reject('typeIdentifier mismatch');
                                ok = false;
                                return false;
                            }

                            manifest = useSource(manifest);

                            manifest.baseUrl = window.location.origin + '/' +
                                _portableElementManifests[id].replace(/^([a-zA-Z]*)\/(.*)\/([a-zA-Z]*)(Creator.json$)/, '$1/views/js/$2');
                            _registry[id] = [setPortableElementPrefix(manifest, id)];
                        }
                    });
                    if(ok){
                        resolve(_registry);
                    }
                }, reject);
            });
        }
    };
});