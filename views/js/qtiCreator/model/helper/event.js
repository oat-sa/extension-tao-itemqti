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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * Event helper
 */
define(['jquery', 'lodash'], function($, _){
    "use strict";

    var namespace = '.qti-creator';
    var namespaceModel = '.qti-creator';
    var eventList = [
        'containerBodyChange',
        'containerElementAdded',
        'elementCreated.qti-widget',
        'attributeChange.qti-widget',
        'choiceCreated.qti-widget',
        'correctResponseChange.qti-widget',
        'mapEntryChange.qti-widget',
        'mapEntryRemove.qti-widget',
        'deleted.qti-widget',
        'choiceTextChange.qti-widget',
        'responseTemplateChange.qti-widget',
        'mappingAttributeChange.qti-widget',
        'feedbackRuleConditionChange.qti-widget',
        'feedbackRuleCreated.qti-widget',
        'feedbackRuleRemoved.qti-widget',
        'feedbackRuleElseCreated.qti-widget',
        'feedbackRuleElseRemoved.qti-widget'
    ];

    var event = {

        /**
         * Trigger the choiceCreated event
         * @param {Object} choice - the new choice (model)
         * @param {Object} interaction - the interaction the choice belongs to (model)
         */
        choiceCreated : function choiceCreated(choice, interaction){
            $(document).trigger('choiceCreated.qti-widget', {choice : choice, interaction : interaction});
        },

        /**
         * Trigger the choiceDeleted event
         * @param {Object} choice - the removed choice (model)
         * @param {Object} interaction - the interaction the choice belongs to (model)
         */
        choiceDeleted : function choiceDeleted(choice, interaction){
            $(document).trigger('choiceDeleted.qti-widget', {choice : choice, interaction : interaction});
        },

        deleted : function(element, parent){

            if(element.isset()){
                element.unset();
            }

            $(document).off('.' + element.getSerial());
            $(document).trigger('deleted.qti-widget', {element : element, parent : parent});
        },
        getList : function(addedNamespace){
            var events = _.clone(eventList);
            if(addedNamespace){
                return _.map(events, function(e){
                    return e + '.' + addedNamespace;
                });
            }else{
                return events;
            }
        },
        initElementToWidgetListeners : function(){

            var ns = '.widget-container';

            //forward all event to the widget $container
            $(document).off(ns).on(event.getList(ns).join(' '), function(e, data){
                var element = data.element || data.container || null,
                    widget = data && element && element.data('widget');

                // for backward compatibility reasons, we only look for the widget in parent as the last resort
                if (!widget && data.parent) {
                    element = data.parent;
                    widget = element.data('widget');
                }

                if(widget){
                    widget.$container.trigger(e.type + namespace + namespaceModel, data);
                }
            });

        },
        getNs : function(){
            return namespace;
        },
        getNsModel : function(){
            return namespaceModel;
        }
    };

    return event;
});
