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
            'fill' :  '#0E5D91', 
            'fill-opacity' : 0.3
        },
        'active' : {
            'fill-opacity' : 0.5,
            'stroke' : '#3E7DA7',
            'fill' :  '#0E5D91'  
        },
        'error' : {
            'stroke' : '#C74155',
            'fill-opacity' : 0.5,
            'fill' :  '#661728'  
        },
        'success' : {
            'stroke' : '#C74155',
            'fill-opacity' : 0.5,
            'fill' :  '#0E914B'  
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
         * @param {String} [title] - a title linked to this step
         */
        updateElementState : function(element, state, title){
            if(element && element.animate){
                element.animate(states[state], 200, 'linear');
        
                if(title){
                    this.updateTitle(element, title);
                }
            }
        },

        /**
         * Update the title of an element (the attr method of Raphael adds only new node instead of updating exisitings).
         * @param {Raphael.Element} element - the element to update the title
         * @param {String} [title] - the new title
         */
        updateTitle : function(element, title){
    
            //removes all remaining titles nodes
            _.forEach(element.node.children, function(child){
                if(child.nodeName.toLowerCase() === 'title'){
                    element.node.removeChild(child);
                }
            });
            
            //then set the new title
            element.attr('title', title);
        },

        /**
         * Returns the SVG path for a target shape
         * @return {String} the path
         */
        getTargetPath : function(){
            return "m 18,8.4143672 -1.882582,0 C 15.801891,4.9747852 13.071059,2.2344961 9.63508,1.9026738 L 9.63508,0 8.2305176,0 l 0,1.9026387 C 4.7947148,2.2343027 2.0637246,4.9746621 1.7481973,8.4143672 l -1.7481973,0 0,1.4045625 1.754877,0 c 0.3460429,3.4066753 3.0632871,6.1119843 6.4756406,6.4413813 l 0,1.739689 1.4045624,0 0,-1.739725 c 3.412547,-0.329537 6.129633,-3.034793 6.475641,-6.4413453 l 1.889279,0 z m -8.36492,6.5188648 0,-4.064673 -1.4045624,0 0,4.063882 C 5.5511016,14.612555 3.4232695,12.494619 3.0864551,9.8189297 l 4.0449512,0 0,-1.4045625 -4.0546368,0 C 3.3788672,5.6984941 5.5228887,3.5393379 8.2305176,3.2161113 l 0,3.9153125 1.4045624,0 0,-3.9160859 c 2.711162,0.3203965 4.858576,2.4808887 5.160955,5.1990293 l -3.927441,0 0,1.4045625 3.917773,0 C 14.449289,12.496957 12.318363,14.616158 9.63508,14.933232 z";
        }
    };
});
