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
 * Copyright (c) 2015 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * The mapResponsePoint expression processor.
 *
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10581
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, errorHandler, preProcessor){
    'use strict';

    /**
     * The MapResponsePoint Processor
     * @type {ExpressionProcesssor}
     * @exports taoQtiItem/scoring/processor/expressions/mapResponsePoint
     */
    var mapResponseProcessor = {

        /**
         * Process the expression
         * @returns {ProcessingValue} the value from the expression
         */
        process : function(){

            var self = this;
            var points,
                defaultValue,
                lowerBound,
                upperBound,
                filtered;
            var identifier = this.expression.attributes.identifier;
            var variable   = this.state[identifier];
            var result     = {
                cardinality : 'single',
                baseType    : 'float'
            };

            if(typeof variable === 'undefined' || variable === null){
                 return errorHandler.throw('scoring', new Error('No variable found with identifier ' + identifier ));
            }

            if(typeof variable.mapping === 'undefined' || variable.mapping.qtiClass !== 'areaMapping'){
                 return errorHandler.throw('scoring', new Error('The variable ' + identifier + ' has no areaMapping, how can I execute a mapResponsePoint on it?'));
            }

            if(variable.baseType !== 'point'){
                 return errorHandler.throw('scoring', new Error('The variable ' + identifier + ' must be of type point, but it is a ' + variable.baseType));
            }

            //cast the variable value
            variable = this.preProcessor.parseVariable(variable);


            //retrieve attributes
            defaultValue = parseFloat(variable.mapping.attributes.defaultValue) || 0;
            if(typeof variable.mapping.attributes.lowerBound !== 'undefined'){
                lowerBound = parseFloat(variable.mapping.attributes.lowerBound);
            }
            if(typeof variable.mapping.attributes.upperBound !== 'undefined'){
                upperBound = parseFloat(variable.mapping.attributes.upperBound);
            }

            //points are in an array
            if(variable.cardinality === 'single'){
                points = [variable.value];
            } else {
                points = variable.value;
            }

            //resolve the mapping

            //filter entries that match
            filtered = _.filter(variable.mapping.areaMapEntries, function(mapEntry){
                    var found = _.filter(points, function(point){
                        var coords = _.map(mapEntry.coords.split(','), parseFloat);

                        return isPointInShape(mapEntry.shape, point, coords);
                    });
                    return found.length > 0;
                });

            //then sum the entries values
            if(filtered.length){
                result.value = _.reduce(filtered, function(acc, mapEntry){
                    var value = parseFloat(mapEntry.mappedValue);
                    return acc + (_.isNaN(value) ? 0 : value);
                }, 0);
            }

            // apply attributes
            if(!_.isNumber(result.value)){
                result.value = defaultValue;
            }
            if(_.isNumber(lowerBound) && result.value < lowerBound){
               result.value = lowerBound;
            }
            if(_.isNumber(upperBound) && result.value > upperBound){
               result.value = upperBound;
            }

            return result;
        }
    };


    /**
     * Check wheter a point is in a shape
     * @param {String} shape - the QTI shape (rect, circle, ellipse or poly)
     * @param {Array<Number>} point - [x,y] point
     * @param {Array<Number>} coords - the shape coordinates as per QTI standard
     * @returns {Boolean} true if the point is inside the shape.
     */
    function isPointInShape(shape, point, coords){

        var x = point[0];
        var y = point[1];

        var p2      = _.partialRight(Math.pow, 2);

        //to be called dynamically like isPointIn['rect']();
        var isPointIn = {
            rect : function isPointInRect(){
                var left    = coords[0];
                var top     = coords[1];
                var right   = coords[2];
                var bottom  = coords[3];

                return x >= left && x <= right && y >= top && y <= bottom;
            },

            circle : function isPointInCircle(){

                var centerx = coords[0];
                var centery = coords[1];
                var radius  = coords[2];

                return p2(x - centerx) + p2(y - centery) < p2(radius);
            },

            ellipse : function isPointInEllipse(){

                var centerx = coords[0];
                var centery = coords[1];
                var radiush = coords[2];
                var radiusv = coords[3];
                var distx   = x - centerx;
                var disty   = y - centery;

                return ( p2(distx) / p2(radiush) ) + ( p2(disty) / p2(radiusv) ) <= 1;
            },

            poly : function isPointInPoly(){
                var i, j, xi, yi, xj, yj;
                var inside = false;
                var intersect = false;

                //transform the coords in vertices
                var vertx = _.reduce(coords, function(acc, coord, index){
                    if (index % 2 === 0) {
                         acc.push([coord]);
                    } else {
                        acc[acc.length -1][1] = coord;
                    }
                    return acc;
                }, []);

                var vSize = vertx.length;

                /*
                 * ray-casting algorithm based on
                 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
                 * and a js implentation from https://github.com/substack/point-in-polygon
                 */
                for (i = 0, j = vSize - 1; i < vSize; j = i++) {
                    xi = vertx[i][0];
                    yi = vertx[i][1];
                    xj = vertx[j][0];
                    yj = vertx[j][1];

                    intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                    if (intersect) {
                        inside = !inside;
                    }
                }
                return inside;
            },

            'default' : function(){
                return true;
            }
        };

        if(_.isFunction(isPointIn[shape])){
            return isPointIn[shape]();
        }

        return false;
    }

    return mapResponseProcessor;
});
