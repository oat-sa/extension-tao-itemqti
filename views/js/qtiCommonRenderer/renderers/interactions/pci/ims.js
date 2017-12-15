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
 * Copyright (c) 2017 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'lodash',
    'core/logger',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/instanciator'
], function(_, loggerFactory, containerHelper, instanciator){
    'use strict';

    var logger = loggerFactory('taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/ims');

    var pciReadyCallback = function pciReadyCallback(pci, state){
        //standard callback function to be implemented in a future story
        logger.info('pciReadyCallback called on PCI '+pci.typeIdentifier);
    };

    var pciDoneCallback = function pciDoneCallback(pci, response, state, status){
        //standard callback function to be implemented in a future story
        logger.info('pciDoneCallback called on PCI '+pci.typeIdentifier);
    };

    return function defaultPciRenderer(runtime){
        return {
            getRequiredModules : function getRequiredModules(){
                var requireEntries = [];
                //load modules
                _.forEach(runtime.modules, function(module, name){
                    requireEntries.push(name);
                });
                return requireEntries;
            },
            createInstance : function createInstance(interaction, context){
                var pci = instanciator.getPci(interaction);
                var config;
                var properties = _.clone(interaction.properties);

                // serialize any array or object properties
                _.forOwn(properties, function(propVal, propKey) {
                    properties[propKey] = (_.isArray(propVal) || _.isObject(propVal))
                        ? JSON.stringify(propVal)
                        : propVal;
                });

                config = {
                    properties : properties,
                    templateVariables : {},//not supported yet
                    boundTo : context.response || {},
                    onready : pciReadyCallback,
                    ondone : pciDoneCallback,
                    status : 'interacting'//only support interacting state currently(TODO: solution, review),
                };

                pci.getInstance(containerHelper.get(interaction).get(0), config, context.state);
            },
            destroy : function destroy(interaction){
                instanciator.getPci(interaction).oncompleted();
            },
            setState : _.noop,
            getState : function getState(interaction){
                return instanciator.getPci(interaction).getState();
            }
        };
    };
});