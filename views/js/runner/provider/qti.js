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
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/runner/provider/manager/picManager',
    'taoItems/assets/manager',
], function($, _, QtiLoader, QtiRenderer, picManager, assetManagerFactory){
    'use strict';

    /**
     * @exports taoQtiItem/runner/provider/qti
     */
    var qtiItemRuntimeProvider = {

        init : function(itemData, done){
            var self = this;

            this._renderer = new QtiRenderer({
                assetManager : this.assetManager
            });

            new QtiLoader().loadItemData(itemData, function(item){
                if(!item){
                    return self.trigger('error', 'Unable to load item from the given data.');
                }

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

                $(elt)
                    .off('responseChange')
                    .on('responseChange', function(){
                        self.trigger('statechange', self.getState());
                        self.trigger('responsechange', self.getResponses());
                    })
                    .off('endattempt')
                    .on('endattempt', function(e, responseIdentifier){
                        self.trigger('endattempt', responseIdentifier);
                    });


                //TODO use post render cb once implemented
                _.delay(function() {
                    done();

                    /**
                     * Lists the PIC provided by this item.
                     * @event qti#listpic
                     */
                    self.trigger('listpic', picManager.collection(self._item));

                }, 100);
            }
        },

        clear : function(elt, done){
            if(this._item){

               _.invoke(this._item.getInteractions(), 'clear');

                $(elt).off('responseChange').empty();
            }
            done();
        },

        getState : function(){
            var state = {};
            if(this._item){
                _.forEach(this._item.getInteractions(), function(interaction){
                    state[interaction.attr('responseIdentifier')] = interaction.getState();
                });
            }
            return state;
        },

        setState : function(state){
            if(this._item && state){
                _.forEach(this._item.getInteractions(), function(interaction){
                    var id = interaction.attr('responseIdentifier');
                    if(id && state[id]){
                        interaction.setState(state[id]);
                    }
                });
            }
        },

        getResponses : function(){
            var responses = {};
            if(this._item){
                _.reduce(this._item.getInteractions(), function(res, interaction){
                    responses[interaction.attr('responseIdentifier')] = interaction.getResponse();
                    return responses;
                }, responses);
            }
            return responses;
        }
    };

    return qtiItemRuntimeProvider;
});
