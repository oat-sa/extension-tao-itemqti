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
                    mover(start, stop)
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
        rect : function moveRectangle(start, stop){
            return {
                x : start.x + stop.x,
                y : start.y + stop.y
            };
        },
        
        /**
         * Move a circle.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        circle : function moveCircle(start, stop){
            return  {
                cx : start.cx + stop.x,
                cy : start.cy + stop.y
            };
        },

        /**
         * Move an ellipse.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        ellipse : function moveEllipse(start, stop){
            return {
                cx : start.cx + stop.x,
                cy : start.cy + stop.y
            };
        },

        /**
         * Move a path.
         * @param {Raphael.Element} element - the element to move
         * @param {Object} start - the original position
         * @param {Object} stop - the destination position
         * @returns {Object} attributes with the new position, that the Raphael.Element accepts
         */
        path : function movePath(start, stop){
                
            //do not use Raphael.transformPath to prevent using Curves for translation
            var dest = { 
                path :  '' 
            };
            _.forEach(start.path, function(point){
                dest.path += point[0];
                if(point.length === 3){
                    dest.path += (point[1] + stop.x) + ',' + (point[2] + stop.y);
                }                 
            });
            return dest;
        }
    };
    
    return move;
});
