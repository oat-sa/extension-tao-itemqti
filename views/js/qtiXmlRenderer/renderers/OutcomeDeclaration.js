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
define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/outcomeDeclaration'], function(_, tpl){
    'use strict';
    return {
        qtiClass : 'outcomeDeclaration',
        template : tpl,
        getData:function(outcomeDeclaration, data){
            var defaultData,
                defaultValue = [];

            if(!_.isUndefined(outcomeDeclaration.defaultValue)){
                if(typeof(outcomeDeclaration.defaultValue) === 'object'){
                    defaultValue = _.values(outcomeDeclaration.defaultValue);
                }else{
                    defaultValue = [outcomeDeclaration.defaultValue];
                }
            }
            defaultData = {
                empty: !_.size(defaultValue),
                defaultValue: defaultValue
            };

            return _.merge(data || {}, defaultData);
        }
    };
});