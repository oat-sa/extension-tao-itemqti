
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
    'lodash',
    'i18n',
    'core/plugin',
    'core/promise',
    'ui/dialog/confirm',
], function(_, __, pluginFactory, Promise, dialog){
    'use strict';

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
            var getSerializedItem = function getSerializedItem() {
                var serialized = '';
                try {
                    serialized = JSON.stringify(itemCreator.getItem().toArray());
                } catch(err){
                    serialized = null;
                }
                return serialized;
            };
            var originalItem = getSerializedItem();

            var hasChanged  = function hasChanged(){
                var currentItem = getSerializedItem();
                if(originalItem !== currentItem || (_.isNull(currentItem) && _.isNull(originalItem))){
                    originalItem = currentItem;
                    return true;
                }
                return false;
            };

            var silentSave = function silentSave(){
                return new Promise(function(resolve){
                    itemCreator.on('saved.silent', function(){
                        itemCreator.off('saved.silent');
                        resolve();
                    })
                    .trigger('save', true);
                });
            };

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

            window.addEventListener("beforeunload", function (e) {
                (e || window.event).returnValue = messages.leave;
                return messages.leave;
            });

            itemCreator
                .on('saved', function(){
                    originalItem = getSerializedItem();
                })
                .before('exit', function(){
                    return confirmBefore(messages.exit);
                })
                .before('preview', function(){
                    return confirmBefore(messages.preview);
                });
        }
    });
});
