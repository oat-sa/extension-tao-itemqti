/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'lodash'], function($, _){

    /**
     * Move a Raphael shape.
     *
     * @exports taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeMover
     * @param {Raphael.Element} element - the element to move
     * @param {Object} start - the original position
     * @param {Object} stop - the destination position
     */
    var move =  function move (element, start, stop){
        var mover;
        if(element && element.type){
            mover = _.bind(shapeMover[element.type], shapeMover);

            if(_.isFunction(mover)){
                element.animate(
                    mover(start, stop, element)
                );
            }
        }
    };

    /**
     * Provides moving implementation based on the shape type
     */ 
    var shapeMover = {
        
        /**
         * Move a rectangle;
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        rect : function moveRectangle(start, stop, element){
            var max = {
                x: element.paper.w - element.attrs.width,
                y: element.paper.h - element.attrs.height
            };
            var x = Math.min(stop.x - start.x, max.x);
            var y = Math.min(stop.y - start.y, max.y);

            return {
                x : Math.max(x, 0),
                y : Math.max(y, 0),
            };
        },
        
        /**
         * Move a circle.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        circle : function moveCircle(start, stop, element){
            var max = {
                x: element.paper.w,
                y: element.paper.h
            };
            var x = Math.min(stop.x, max.x);
            var y = Math.min(stop.y, max.y);

            return  {
                cx : Math.max(x, 0),
                cy : Math.max(y, 0),
            };
        },

        /**
         * Move an ellipse.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        ellipse : function moveEllipse(start, stop, element){
            var max = {
                x: element.paper.w,
                y: element.paper.h
            };
            var x = Math.min(stop.x, max.x);
            var y = Math.min(stop.y, max.y);

            return {
                cx : Math.max(x, 0),
                cy : Math.max(y, 0),
            };
        },

        /**
         * Move a path.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        path : function movePath(start, stop, element){
            //do not use Raphael.transformPath to prevent using Curves for translation
            // Check user shift
            var x = stop.x - start.x;
            var y = stop.y - start.y;

            // Set client box shift
            var defaultShift = {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
            }
            var clientShift = _.reduce(start.path, (result, point) => {
                if (point.length !== 3) {
                    return result;
                }

                var pointX = point[1] + x;
                var pointY = point[2] + y;
                return {
                    minX: Math.min(result.minX, pointX),
                    maxX: Math.min(result.maxX, element.paper.w - pointX),
                    minY: Math.min(result.minY, pointY),
                    maxY: Math.min(result.maxY, element.paper.h -pointY)
                }
            }, defaultShift);

            // Generate the path
            var path = _.reduce(start.path, function(result, point) {
                var item = point[0];

                if (point.length !== 3) {
                    return result + item;
                }

                var pointX = point[1] + x - clientShift.minX + clientShift.maxX;
                var pointY = point[2] + y - clientShift.minY + clientShift.maxY;
                item += pointX + ',' + pointY;

                return result + item;
            }, '');

            return {
                path: path
            };
        }
    };
    
    return move;
});
