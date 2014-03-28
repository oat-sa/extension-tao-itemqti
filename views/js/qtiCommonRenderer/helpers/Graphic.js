/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['lodash'], function(_){

    //contains the different states for the shapes
    var states = {
        'basic' : {
            'stroke' : '#8D949E',
            'stroke-width' : '2',
            'fill' : '#cccccc',
            'fill-opacity' : 0.5,
            'cursor' : 'pointer'
        },
        'hover'  : {
            'stroke' : '#3E7DA7',
        },
        'active' : {
            'stroke' : '#3E7DA7',
            'fill' :  '#0E5D91'  
        },
        'error' : {
            'stroke' : '#C74155',
            'fill' :  '#661728'  
        }
    };

    //maps the QTI shapes to Raphael shapes
    var shapeMap = {
        'default' : 'rect',
        'poly'    : 'path'
    };

    //length constraints to validate coords
    var coordsValidator = {
        'rect' : 4,
        'ellipse' : 4,
        'circle' : 3,
        'poly' : 6,
        'default' : 0
    };

    //transform the coords from the QTI system to Raphael system
    var coordsMapper = {

        /**
         * Rectangle coordinate mapper:  from left-x,top-y,right-x-bottom-y to x,y,w,h
         * @param {Array} coords - QTI coords
         * @returns {Array} raphael coords
         */
        'rect' : function(coords){
           return [
                coords[0],
                coords[1],
                coords[2] - coords[0],
                coords[3] - coords[1]
            ];
        },
        
        /**
         * Creates the coords for a default shape (a rectangle that covers all the paper)
         * @param {Raphael.Paper} paper - the paper
         * @returns {Array} raphael coords
         */
        'default' : function(paper){
           return [ 0, 0, paper.width, paper.height ];
        },
        
        /**
         * polygone coordinate mapper:  from x1,y1,...,xn,yn to SVG path format
         * @param {Array} coords - QTI coords
         * @returns {Array} path desc
         */
        'poly' : function(coords){
            var a;
            var size = coords.length;

            // autoClose if needed
            if((coords[0] !== coords[size - 2]) && (coords[1] !== coords[size - 1])){
                coords.push(coords[0]);
                coords.push(coords[1]);
            }
            
            // move to first point
            coords[0] = "M" + coords[0];
            for(a = 1; a < size; a++){
                if(a % 2 === 0){
                    coords[a] = "L" + coords[a];
                }
            }
            return [coords.join(" ")];
        }
    };

    /**
     * Get the Raphael coordinate from QTI coordinate
     * @param {Raphael.Paper} paper - the interaction paper
     * @param {String} type - the shape type
     * @param {String|Array.<Number>} coords - qti coords as a string or an array of number
     * @returns {Array} the arguments array of coordinate to give to the approriate raphael shapre creator
     */
    var getCoords =  function getCoords(paper, type, coords){
        var shapeCoords;
        if(_.isString(coords)){
            coords = _.map(coords.split(','), function(coord){
                return parseInt(coord, 10);
            });
        }
        if(!_.isArray(coords) || coords.length < coordsValidator[type]){
            throw new Error('Invalid coords ' + JSON.stringify(coords) + '  for type ' + type);
        } 
        switch(type){
            case 'rect' : shapeCoords = coordsMapper.rect(coords); break; 
            case 'default' : shapeCoords = coordsMapper['default'].call(null, paper); break; 
            case 'poly' : shapeCoords = coordsMapper.poly(coords); break; 
            default : shapeCoords = coords; break;
        }
        return shapeCoords;
    };

    /**
     * Graphic interaction helper
     * @exports qtiCommonRenderer/helpers/Graphic
     */
    return {
   
        /**
         * Shape states (default, active, error, etc.)
         * @type {Object}
         */
        states : states,
  
        /**
         * Create a new Element into a raphael paper
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {String} type - the shape type
         * @param {String|Array.<Number>} coords - qti coords as a string or an array of number
         * @returns {Raphael.Element} the created element
         */
        createElement : function(paper, type, coords){
                           
            var shaper = shapeMap[type] ? paper[shapeMap[type]] : paper[type];
            var shapeCoords = getCoords(paper, type, coords);

            if(typeof shaper === 'function'){
               return shaper.apply(paper, shapeCoords);
            } else {
                throw new Error('Unable to find method ' + type + ' on paper');
            } 
        },
  
        
        /**
         * Update the visual state of an Element
         * @param {Raphael.Element} element - the element to change the state
         * @param {String} state - the name of the state (from states) to switch to
         */
        updateElementState : function(element, state){
            if(element && element.animate){
                element.animate(states[state], 200, 'linear');
            }
        }
    };
});
