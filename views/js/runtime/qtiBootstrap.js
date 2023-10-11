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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'jquery',
    'module',
    'taoQtiItem/qtiRunner/core/QtiRunner',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'iframeNotifier',
    'core/history',
    'taoQtiItem/runner/provider/manager/userModules'
], function($, module, QtiRunner, Renderer, iframeNotifier, history, userModules){
    'use strict';

    //fix backspace going back into the history
    history.fixBrokenBrowsers();

    /**
     * The bootstrap is used to set up a QTI item at runtime. It connects to the itemApi.
     *
     * @author Bertrand Chevrier <bertrand@taotesting.com>
     * @exports taoQtiItem/runtime/qtiBootstrap
     *
     * @param {Object} runnerContext - the item context
     */
    return function bootstrap (runnerContext){

        //reconnect to global itemApi function
        window.onItemApiReady = function onItemApiReady(itemApi) {
            var qtiRunner = new QtiRunner();
            var coreItemData = runnerContext.itemData;
            var variableElementsData = {...runnerContext.variableElements, ...itemApi.params.contentVariables};

            var renderer = new Renderer();

            // Makes the runner interface available from outside the frame
            // for preview.
            window.qtiRunner = qtiRunner;

            qtiRunner.setItemApi(itemApi);
            qtiRunner.setRenderer(renderer);

            qtiRunner.loadItemData(coreItemData, function() {

                qtiRunner.loadElements(variableElementsData, function() {

                    qtiRunner.renderItem(undefined, function() {

                        //userModules loading
                        //we use any user modules bound to this module configuration instead of the ones bound to the new test runner
                        var userModulesOverride;
                        var config = module.config();
                        if (config && config.userModules && Array.isArray(config.userModules) && config.userModules.length > 0) {
                            userModulesOverride = config.userModules;
                        }
                        userModules.load(userModulesOverride)
                            .then(function() {

                                //exec user scripts
                                if (Array.isArray(runnerContext.userScripts)) {
                                    require(runnerContext.userScripts, function(...args) {
                                        args.forEach(dependency => {
                                            if (typeof dependency.exec === "function") {
                                                dependency.exec.call(null, runnerContext.userVars);
                                            }
                                        });
                                    });
                                }

                                iframeNotifier.parent('itemloaded');

                                //IE9/10 loose the iframe focus, so we force getting it back.
                                setTimeout(() => {
                                    window.focus();
                                });
                            })
                            .catch(function(err) {
                                throw new Error('Error in user modules : ' + err.message);
                            });

                    });
                });
            });
        };

        //if the item is longer to load,
        setTimeout(() => {
            //tell the parent to connect the item api
            iframeNotifier.parent('itemready');
        });

    };
});

