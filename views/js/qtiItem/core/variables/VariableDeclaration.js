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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define(['taoQtiItem/qtiItem/core/IdentifiedElement'], function(IdentifiedElement){
    'use strict';
    /**
     * It is the top abstract class for all variable classes
     * (so not renderable and qtiClass undefined)
     */
    var VariableDeclaration = IdentifiedElement.extend({
        init : function init(serial, attributes){
            this._super(serial, attributes);
            this.defaultValue = null;
        },
        is : function is(qtiClass){
            return (qtiClass === 'variableDeclaration') || this._super(qtiClass);
        },
        toArray : function toArray(){
            var arr = this._super();
            arr.defaultValue = this.defaultValue;
            return arr;
        },
        setDefaultValue : function setDefaultValue(value){
            this.defaultValue = value;
        },
        getDefaultValue : function getDefaultValue(){
            return this.defaultValue;
        },
    });

    return VariableDeclaration;
});