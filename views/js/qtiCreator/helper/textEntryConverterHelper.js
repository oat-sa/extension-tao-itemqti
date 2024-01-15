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
 * Copyright (c) 2019-2023 Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'util/locale',
    'util/converter'
], function ($, locale, converter) {
    'use strict';

   function textEntryConverterHelper(value, attributes) {
       const numericBase = attributes.base || 10;
       const convertedValue = converter.convert(value.trim());
       switch (attributes.baseType) {
           case 'integer':
               value = locale.parseInt(convertedValue, numericBase);
               return isNaN(value) ? '' : value;
           case 'float':
               value = locale.parseFloat(convertedValue)
               return isNaN(value) ? '' : value;
           case 'string':
               return convertedValue;
           default:
               return ''; // all unparsable values returns as empty string
       }
   }

   return textEntryConverterHelper;
});
