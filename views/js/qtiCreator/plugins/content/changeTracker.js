
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin tracks item changes and prevents you to loose them.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'core/promise',
    'ui/dialog',
], function($, _, __, pluginFactory, Promise, dialog){
    'use strict';

    //function to remove all global handlers
    var removeChangeHandlers;

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
                            resolve();
                        })
                        .trigger('save', true);
                });
            };

            //are we doing the confirm process ?
            var asking = false;

            /**
             * Display a confirmation dialog,
             * The "ok" button will save and resolve.
             * The "cancel" button will reject.
             *
             * @param {String} message - the confirm message to display
             * @returns {Promise} resolves once saved
             */
            var confirmBefore = function confirmBefore(message){
                return new Promise(function(resolve, reject){
                    if(asking){
                        return reject();
                    }
                    asking = true;
                    if(hasChanged()){

                        dialog({
                            message: message,
                            buttons:  [{
                                id : 'dontsave',
                                type : 'regular',
                                label : __('Don\'t save'),
                                close: true
                            },{
                                id : 'cancel',
                                type : 'regular',
                                label : __('Cancel'),
                                close: true
                            }, {
                                id : 'save',
                                type : 'info',
                                label : __('Save'),
                                close: true
                            }],
                            autoRender: true,
                            autoDestroy: true,
                            onSaveBtn : function onSaveBtn(){
                                silentSave().then(resolve);
                            },
                            onDontsaveBtn : resolve,
                            onCancelBtn : reject
                        })
                        .on('closed.modal', function(){
                            asking = false;
                        });
                    } else {
                        resolve();
                    }
                });
            };

            /**
             * Just unbind some handlers
             */
            removeChangeHandlers = function removeHandlers(){
                $(document).off('stylechange.qti-creator');
                $('.content-wrap').off('click.qti-creator');
                $(window).off("beforeunload.qti-creator");
            };

            //also track style changes
            $(document).on('stylechange.qti-creator', function (e, detail) {
                if(!detail || !detail.initializing){
                    styleChanges = true;
                }
            });

            $(window)
                //add a browser popup to prevent leaving the browser
                .on("beforeunload.qti-creator", function () {
                    if(!asking && hasChanged()){
                        return messages.leave;
                    }
                })
                //since we don't know how to prevent history based events,
                //we just stop the handling
                .on('popstate', function(){

                    removeChangeHandlers();
                });

            //every click outside the authoring
            $('.content-wrap').on('click.qti-creator', function(e){
                if(!$.contains($container.get(0), e.target)){
                    if(hasChanged()){
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        confirmBefore(messages.exit)
                            .then(function(){
                                $(e.target).trigger('click');
                            })
                            .catch(_.noop); //do nothing but prevent uncacthed error
                    }
                }
            });

            itemCreator
                .on('saved', function(){
                    originalItem = getSerializedItem();
                    styleChanges = false;
                })
                .before('exit', function(){
                    return confirmBefore(messages.exit);
                })
                .before('preview', function(){
                    return confirmBefore(messages.preview);
                });
        },

        /**
         * Plugin destroy cycle
         */
        destroy : function destroy(){
            if(_.isFunction(removeChangeHandlers)){
                removeChangeHandlers();
            }
        }
    });
});
