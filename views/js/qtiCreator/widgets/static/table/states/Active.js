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
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active' //todo: restore static ns
], function(_, $, __, stateFactory, Active){
    'use strict';
    console.log('loading Tables/Static/Active state');

    var TableStateActive = stateFactory.extend(Active, function(){
        //this.initForm();
        console.log('entering Tables/Static/Active state');

    }, function(){
        //this.widget.$form.empty(); //todo: really?
        console.log('exiting Tables/Static/Active state');

    });


        /*
    TableStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            qtiObject = _widget.element,
            baseUrl = _widget.options.baseUrl;

        $form.html(formTpl({
            baseUrl : baseUrl || '',
            src : qtiObject.attr('data'),
            alt : qtiObject.attr('alt'),
            height : qtiObject.attr('height'),
            width : qtiObject.attr('width')
        }));

        //init resource manager
        _initUpload(_widget);

        //init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, qtiObject, {
            src : function(object, value){
                qtiObject.attr('data', value);
                inlineHelper.togglePlaceholder(_widget);
                refreshRendering(_widget);
            },
            width : function(object, value){
                var val = parseInt(value, 10);
                if(_.isNaN(val)){
                    qtiObject.removeAttr('width');
                }else{
                    qtiObject.attr('width', val);
                }
                refreshRendering(_widget);
            },
            height : function(object, value){
                var val = parseInt(value, 10);
                if(_.isNaN(val)){
                    qtiObject.removeAttr('height');
                }else{
                    qtiObject.attr('height', val);
                }
                refreshRendering(_widget);
            },
            alt : function(qtiObject, value){
                qtiObject.attr('alt', value);
            },
            align : function(qtiObject, value){
                inlineHelper.positionFloat(_widget, value);
            }
        });

    };
        */

    return TableStateActive;
});