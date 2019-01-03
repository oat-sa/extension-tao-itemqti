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
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/pci/instanciator'
], function(_, containerHelper, instanciator){
    'use strict';
    return function commonPciRenderer(runtime){
       return {
           getRequiredModules : function getRequiredModules(){
               var requireEntries = [];
               //load hook if applicable
               if(runtime.hook){
                   requireEntries.push(runtime.hook.replace(/\.js$/, ''));
               }
               //load libs
               _.forEach(runtime.libraries, function(lib) {
                   requireEntries.push(lib.replace(/\.js$/, ''));
               });
               //load stylesheets
               _.forEach(runtime.stylesheets, function(stylesheet){
                   requireEntries.push('css!'+stylesheet.replace(/\.css$/, ''));
               });
               return requireEntries;
           },
           createInstance : function(interaction, context){
               var id = interaction.attr('responseIdentifier');
               var pci = instanciator.getPci(interaction);
               var properties = _.clone(interaction.properties);
               var assetManager = context.assetManager;
               var pciAssetManager = {
                   resolve : function pciAssetResolve(url){
                       var resolved = assetManager.resolveBy('portableElementLocation', url);
                       if(resolved === url || _.isUndefined(resolved)){
                           return assetManager.resolve(url);
                       }else{
                           return resolved;
                       }
                   }
               };
               pci.initialize(id, containerHelper.get(interaction).children().get(0), properties, pciAssetManager);
           },
           /**
            *
            * @param {Object }interaction
            * @returns {Promise?} the interaction destroy step can be async and can return an optional Promise
            */
           destroy : function destroy(interaction){
               return instanciator.getPci(interaction).destroy();
           },
           setState : function setState(interaction, state){
               instanciator.getPci(interaction).setSerializedState(state);
           },
           getState : function getState(interaction){
               return instanciator.getPci(interaction).getSerializedState();
           }
       };
    };
});