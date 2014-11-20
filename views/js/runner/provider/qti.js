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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 * 
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 
    'lodash', 
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer'], 
function($, _, QtiLoader, QtiRenderer){
    'use strict';

    var itemData = {};

    /**
     * @exports taoQtiItem/runner/provider/qti
     */
    var qtiItemRuntimeProvider = {

        init : function(itemData, done){
            var self = this; 

            this._loader = new QtiLoader();
            this._renderer = new QtiRenderer({
                baseUrl : '.'
            });
 
            this._loader.loadItemData(itemData, function(item){
                self._item = item;
                self._renderer.load(function(){
                    self._item.setRenderer(this);
    
                    done();
                }, this.getLoadedClasses()); 
            }); 
        },

        render : function(elt, done){
            var self = this;

            if(this._item){
                try {
                    elt.innerHTML = this._item.render({});

                } catch(e){
                    console.error(e);
                    self.trigger('error', 'Error in template rendering : ' +  e);
                }
                try {
                    this._item.postRender();

                    
                } catch(e){
                    console.error(e);
                    self.trigger('error', 'Error in post rendering : ' +  e);
                }

                $(elt).on('responsechange', function(){
                    console.log('responsechange', arguments);
                }); 

                done();
            }
        },

        clear : function(done){
            if(this._item){
                
               _.invoke(this._item.getInteractions(), 'destroy');
                
                this.container.innerHTML = '';
            }
            done();
        },

        getState : function(){
            var state = {};
            if(this._item){
                _.forEach(this._item.getInteractions(), function(interaction){
                    state[interaction.attr('responseId')] = interaction.getState();
                });
            }
            return state;
        },

        setState : function(state){
            if(this._item && state){
                _.forEach(this._item.getInteractions(), function(interaction){
                    var id = interaction.attr('responseId');
                    if(id && state[id]){
                        interaction.setState(state[id]);
                    }
                });
            }
        },

        getResponses : function(){
            if(this._item){
                return _.reduce(this._item.getInteractions(), function(res, interaction){
                    res.push(interaction.getResponses());
                    return res;
                });
            }
            return [];
        }
    };

    return qtiItemRuntimeProvider;
});
