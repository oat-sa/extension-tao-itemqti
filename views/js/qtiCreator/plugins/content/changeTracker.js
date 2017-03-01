
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin displays the item label (from
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'core/promise',
    'ui/dialog/confirm',
], function($, _, __, pluginFactory, Promise, dialog){
    'use strict';

    /**
     * The messages asking to save
     */
    var messages = {
        preview : __('The item needs to be saved before it can be previewed'),
        leave   : __('The item has unsaved changes, are you sure you want to leave ?'),
        exit    : __('The item has unsaved changes, would you like to save it ?')
    };

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : 'changeTracker',

        /**
         * Hook to the host's init
         */
        init : function init(){

            var itemCreator = this.getHost();
            var $container  = this.getAreaBroker().getContainer();

            /**
             * Get a string representation of the current item, used for comparison
             * @returns {String} the item
             */
            var getSerializedItem = function getSerializedItem() {
                var serialized = '';
                try {
                    serialized = JSON.stringify(itemCreator.getItem().toArray());
                } catch(err){
                    serialized = null;
                }
                return serialized;
            };

            //keep the value of the item before changes
            var originalItem = getSerializedItem();

            //does the item styles have changed
            var styleChanges = false;

            /**
             * Does the item have changed ?
             * @returns {Boolean}
             */
            var hasChanged  = function hasChanged(){
                var currentItem = getSerializedItem();
                return styleChanges || originalItem !== currentItem || (_.isNull(currentItem) && _.isNull(originalItem));
            };

            /**
             * Save the current item, quietly (without popup notifications)
             * @returns {Promise} resolves once saved
             */
            var silentSave = function silentSave(){
                return new Promise(function(resolve){
                    itemCreator
                        .on('saved.silent', function(){
                            this.off('saved.silent');
                            originalItem = getSerializedItem();
                            styleChanges = false;
                            resolve();
                        })
                        .trigger('save', true);
                });
            };

            /**
             * Display a confirmation dialog, "ok" means
             * @returns {Promise} resolves once saved
             */
            var confirmBefore = function confirmBefore(message){
                return new Promise(function(resolve, reject){
                    if(hasChanged()){
                        dialog(message, function accept(){
                            return silentSave().then(resolve);
                        }, reject);
                    } else {
                        resolve();
                    }
                });
            };

            $(document).on('stylechange.qti-creator', function (e, detail) {
                if(!detail || !detail.initializing){
                    styleChanges = true;
                }
            });

            //add a browser popup to prevent leaving the browser
            window.addEventListener("beforeunload", function (e) {
                if(hasChanged()){
                    (e || window.event).returnValue = messages.leave;
                    return messages.leave;
                }
            });

            //every click outside the authoring
            $('.content-wrap').on('click', function(e){
                if(!$.contains($container.get(0), e.target)){
                    if(hasChanged()){
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        confirmBefore(messages.exit).then(function(){
                            $(e.target).trigger('click');
                        });
                    }
                }
            });

            itemCreator
                .before('exit', function(){
                    return confirmBefore(messages.exit);
                })
                .before('preview', function(){
                    return confirmBefore(messages.preview);
                });
        }
    });
});
