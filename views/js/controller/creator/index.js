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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'module',
    'core/promise',
    'ui/feedback',
    'layout/loading-bar',
    'taoQtiItem/qtiCreator/itemCreator',
    'taoQtiItem/qtiCreator/editor/areaBroker'
], function($, _, module, Promise, feedback, loadingBar, itemCreatorFactory, areaBrokerFactory){
    'use strict';

    /**
     * Set up the areaBroker mapping from the actual DOM
     * @returns {areaBroker} already mapped
     */
    var loadAreaBroker = function loadAreaBroker(){
        var $container = $('#item-editor-scope');
        return areaBrokerFactory($container, {
            'menu':              $('.item-editor-action-bar .item-editor-menu', $container),
            'menuLeft':          $('.left-bar .item-editor-menu', $container),
            'menuRight':         $('.right-bar .item-editor-menu', $container),
            'interactionPanel':  $('#item-editor-interaction-bar', $container),
            'propertyPanel':     $('#item-editor-item-widget-bar', $container),
            'itemPanel':         $('#item-editor-scroll-inner', $container),
            'itemPropertyPanel': $('#sidebar-right-item-properties', $container),
            'itemStylePanel':    $('#item-style-editor-bar', $container),
            'modalContainer':    $('#modal-container', $container),
        });
    };

    var indexController = {

        start : function start(){
            //TODO move module config away from controllers
            var config = module.config();


            itemCreatorFactory(config, loadAreaBroker())
                .on('error', function(err){
                    feedback().error(err.message);
                })
                .on('init', function(){

                    feedback().info('init');

                })
                .on('render', function(){

                    feedback().info('render');
                })

                .init();



        }

    };

    return indexController;
});

