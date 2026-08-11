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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * Mock the itemCreator for the plugins tests
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/eventifier'
], function(eventifier){
    'use strict';

    return function itemCreatorMock ($container, config, item){

        return eventifier({

            init: function init(){
                this.trigger('init', item);
            },

            render : function render(){
                this.trigger('render');
            },

            destroy : function destroy(){
                this.trigger('destroy');
            },

            getAreaBroker : function getAreaBroker(){
                return {
                    getContainer : function getContainer(){
                        return $container;
                    }
                };
            },

            getConfig : function getConfig(){
                return config;
            },

            getItem : function getItem(){
                return item;
            }
        });
    };
});
