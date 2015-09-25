/**
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'jquery',
    'lodash',
    'module',
    'history',
    'taoQtiItem/apipCreator/apipCreator',
    'xmlEdit/editor'
], function(
    $,
    _,
    module,
    history,
    ApipCreator
    ){
    
    'use strict';

    return {
        /**
         *
         * @param {object} config (baseUrl, uri, lang)
         */
        start : function(config){
            
            config = config || module.config();
            
            //back button
            $('#authoringBack').on('click', function(e){
                e.preventDefault();

                if (history) {
                    history.back();
                }
            });
            
            var apipCreator = new ApipCreator($('#apip-creator-scope'), config);
            apipCreator.initLabel();
            apipCreator.initSave();
            apipCreator.initInclusionOrderSelector();
            apipCreator.initInclusionOrderListing();
            apipCreator.initQtiElementSelector();
            apipCreator.initEvents();
            
            //init hooks
            if(_.isArray(config.hooks)){
                _.each(config.hooks, function(hookAmd){
                    require([hookAmd], function(hook){
                        hook.init(apipCreator);
                    });
                });
            }
            
        }
    };
});
