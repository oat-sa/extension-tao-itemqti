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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define(['core/eventifier'], function(eventifier){
    'use strict';

    /**
     * Create an instance of group toggler to manage the toggling of a group of DOM elements
     */
    return function groupToggler(){

        var _registry = [];

        return eventifier({
            /**
             * Register a JQuery element among the list of elements to toggle
             * @param {JQuery} $trigger
             * @returns {groupToggler}
             */
            register : function register($trigger){
                var uniqueId = (function() {
                    var count = {};
                    return function(prefix) {
                        prefix = prefix || '';
                        if (!count[prefix]) {
                            count[prefix] = 0;
                        }
                        count[prefix]++;
                        return prefix + count[prefix];
                    };
                }());

                var self = this,
                    id = uniqueId('group-toggler-');

                if(!$trigger || !$trigger.length){
                    this.trigger('error', 'trigger does not exist');
                    return this;
                }

                if(!$trigger.data('group-toggler-id')){
                    $trigger
                        .data('group-toggler-id', id)
                        .on('show.grouptoggler', function(){
                            //an individual element has been shown
                            self.trigger('show', id);
                        });

                    _registry.push({
                        id : id,
                        dom : $trigger
                    })
                }

                return this;
            }
        }).on('show', function(id){

            for (var key in _registry) {
                if (_registry.hasOwnProperty(key)) {
                    var element = _registry[key];
                    if (element.id !== id) {
                        // a single element has been shown, inform the others
                        element.dom.trigger('showanother.grouptoggler', id);
                    }
                }
            }
        });
    }
});
