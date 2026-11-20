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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA
 */
define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/object'], function(_, tpl){
    'use strict';
    return {
        qtiClass : 'object',
        template : tpl,
        getData: function (object, data) {
            data.attributes = _.mapValues(data.attributes, function (value) {
                return _.isString(value) ? _.escape(value) : value;
            });
            return data;
        }
    };
});
