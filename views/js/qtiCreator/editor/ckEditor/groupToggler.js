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
define(['lodash', 'core/eventifier'], function(_, eventifier){
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

                var self = this,
                    id = _.uniqueId('group-toggler-');

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

            _.forEach(_registry, function(element){
                if(element.id !== id){
                    //a single element has been shown, informe the others
                    element.dom.trigger('showanother.grouptoggler', id);
                }
            });
        });
    }
});
