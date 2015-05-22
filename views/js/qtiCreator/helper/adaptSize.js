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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery'
], function($){
    'use strict';

    function ucfirst(str){
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    var adaptSize = (function(){

        var height = function(elements){
            _resize(elements, {height : 0});
        };

        var width = function(elements){
            _resize(elements, {width : 0});
        };

        var both = function(elements){
            _resize(elements, {height : 0, width : 0});
        };

        var _resize = function(elements, dimensions){

            var dimension;

            if(!(elements instanceof $)){
                elements = $(elements);
            }

            // This whole function is based on calculating the largest height/width.
            // Therefor the elements need to have style: height/width to be removed
            // since otherwise we could never track when something is actually getting smaller than before.
            elements.each(function(){
                var element = $(this);
                for(dimension in dimensions){
                    element[dimension]('auto');
                }
            });

            elements.each(function(){
                var element = $(this);
                for(dimension in dimensions){
                    dimensions[dimension] = Math.max(dimensions[dimension], element['outer' + ucfirst(dimension)]());
                }
            });

            elements.css(dimensions);
        };

        return {
            width : width,
            height : height,
            both : both
        };

    })();

    return adaptSize;
});
