/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'lodash', 'raphael', 'scale.raphael'], function($, _, raphael, scaleRaphael){

    //contains the different states for the shapes
    //TODO move to an external file
    var states = {
        'basic' : {
            'stroke' : '#8D949E',
            'stroke-width' : 2,
            'stroke-dasharray': '',
            'stroke-linejoin' : 'round',
            'fill' : '#cccccc',
            'fill-opacity' : 0.5,
            'cursor' : 'pointer'
        },
        'hover'  : {
            'stroke' : '#3E7DA7',
            'fill' :  '#0E5D91', 
            'fill-opacity' : 0.3
        },
        'selectable'  : {
            'stroke-dasharray': '-',
            'stroke' : '#3E7DA7',
            'fill' : '#cccccc',
            'fill-opacity' : 0.5,
        },
        'active' : {
            'fill-opacity' : 0.5,
            'stroke' : '#3E7DA7',
            'stroke-dasharray': '',
            'fill' :  '#0E5D91'  
        },
        'error' : {
            'stroke' : '#C74155',
            'stroke-dasharray': '',
            'fill-opacity' : 0.5,
            'fill' :  '#661728'  
        },
        'success' : {
            'stroke' : '#C74155',
            'stroke-dasharray': '',
            'fill-opacity' : 0.5,
            'fill' :  '#0E914B'  
        },
        'imageSet' : {
           rect : {
                'fill' : '#ffffff',
                'stroke' : '#333333',
                'stroke-width' : 1,
                'stroke-linejoin' : 'round',
                'cursor' : 'pointer'
            },
            image : {
                'cursor' : 'pointer'
            }
        },
        'text' : {
            'fill' : '#ffffff',
            'stroke': '#000000',
            'stroke-width' : 0.7,
            'font-family' : 'sans-serif',
            'font-weight': 'bold', 
            'font-size' : 22,
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
         * Create a Raphael paper with a bg image, that is width responsive
         * @param {String} id - the id of the DOM element that will contain the paper
         * @param {Object} options - the paper parameters
         * @param {String} options.img - the url of the background image
         * @param {jQueryElement} [options.container] - the parent of the paper element (got the closest parent by default)
         * @param {Number} [options.width] - the paper width
         * @param {Number} [options.height] - the paper height
         * @param {String} [options.imgId] - an identifier for the image element
         * @returns {Raphael.Paper} the paper
         */ 
        responsivePaper : function(id, options){
            var paper, image;
            var $container = options.container || $('#' + id).parent();
            var width = parseInt(options.width || $container.width(), 10);
            var height = parseInt(options.height || $container.height(), 10);
            var factory = raphael.type === 'SVG' ? scaleRaphael : raphael; 
    
            paper = factory.call(null ,id, width, height);
            image = paper.image(options.img, 0, 0, width, height);
            if(options.imgId){
                image.id = options.imgId;
            }               

            if(raphael.type === 'SVG'){ 
                
                //scale on creation
                resizePaper();
                
                //execute the resize every 100ms when resizing
                $(window).resize(_.throttle(resizePaper, 100));

            } else {
                paper.canvas.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                $container.find('.main-image-box').width(width);
                if(typeof options.resize === 'function'){
                    options.resize(width);
                }
            }
            
            /**
             * scale the raphael paper
             * @private
             */
            function resizePaper(){
                var containerWidth = $container.width();

                //TODO check where this diff of 22px comes from 
                paper.changeSize(containerWidth - 22, height, false, false);
                if(typeof options.resize === 'function'){
                    options.resize(containerWidth);
                }
            }

            return paper;
        },
 
        /**
         * Create a new Element into a raphael paper
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {String} type - the shape type
         * @param {String|Array.<Number>} coords - qti coords as a string or an array of number
         * @param {Object} [options] - additional creation options
         * @param {String} [options.id] - to set the new element id
         * @param {String} [options.title] - to set the new element title
         * @param {Boolean} [options.hover = true] - to disable the default hover state
         * @returns {Raphael.Element} the created element
         */
        createElement : function(paper, type, coords, options){
            var self = this;
            var element;               
            var shaper = shapeMap[type] ? paper[shapeMap[type]] : paper[type];
            var shapeCoords = getCoords(paper, type, coords);

            if(typeof shaper === 'function'){
               element = shaper.apply(paper, shapeCoords);
               if(element){
                    if(options.id){
                        element.id = options.id;
                    }
                    if(options.title){
                        element.attr('title', options.title);
                    }
                    element.attr(states.basic)
                            .toFront();
                    if(options.hover !== false){
                      element.hover(function(){
                            if(!element.fashing){
                                self.updateElementState(this, 'hover'); 
                            }
                      }, function(){
                            if(!element.fashing){
                                self.updateElementState(this, this.active ? 'active' : this.selectable ? 'selectable' : 'basic');
                            }
                      });
                    }
               }
    
            } else {
                throw new Error('Unable to find method ' + type + ' on paper');
            }
            return element; 
        },

        /**
         * Create an image with a padding and a border, using a set.
         * 
         * @param {Raphael.Paper} paper - the paper
         * @param {Object} options - image options
         * @param {Number} options.left - x coord
         * @param {Number} options.top - y coord
         * @param {Number} options.width - image width
         * @param {Number} options.height - image height
         * @param {Number} options.url - image ulr
         * @param {Number} [options.padding = 4] - a multiple of 2 is welcomed
         * @returns {Raphael.Element} the created set, augmented of a move(x,y) method
         */
        createBorderedImage : function(paper, options){
            var padding = options.padding || 4;
            var halfPad = padding / 2;
 
            var rx = options.left,
                ry = options.top, 
                rw = options.width + padding, 
                rh = options.height + padding;

            var ix = options.left + halfPad,
                iy = options.top + halfPad,
                iw = options.width, 
                ih = options.height;

            var set = paper.set();
    
            //create a rectangle with a padding and a border.
            var rect = paper
                .rect(rx, ry, rw, rh)
                .attr(states.imageSet.rect);

            //and an image centered into the rectangle.
            var image = paper
                .image(options.url, ix, iy, iw, ih)
                .attr(states.imageSet.image);
            
            set.push(rect, image);

            /**
             * Add a move method to set that keep the given coords during an animation
             * @private
             * @param {Number} x - destination
             * @param {Number} y - destination
             * @param {Number} [duration = 400] - the animation duration
             * @returns {Raphael.Element} the set for chaining
             */
            set.move = function move(x, y, duration){
                var animation = raphael.animation({x: x, y : y}, duration || 400);
                var elt = rect.animate(animation);
                image.animateWith(elt, animation, {x : x + halfPad, y : y + halfPad}, duration || 400);
                return set;
            };
        
            return set;
        },
        
        /**
         * Update the visual state of an Element
         * @param {Raphael.Element} element - the element to change the state
         * @param {String} state - the name of the state (from states) to switch to
         * @param {String} [title] - a title linked to this step
         */
        updateElementState : function(element, state, title){
            if(element && element.animate){
                element.animate(states[state], 200, 'linear', function(){
                    element.attr(states[state]); //for attr that don't animate
                    if(element.type === 'path'){
                        element.attr('fill-opacity', 1);
                    }
                });
        
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
         * Highlight an element with the error style
         * @param {Raphael.Element} element - the element to hightlight
         */
        highlightError : function(element, restoredState){
            var self = this;
            if(element){
               element.flashing = true; 
               self.updateElementState(element, 'error');
                _.delay(function(){
                    self.updateElementState(element, restoredState || 'active');
                    element.flashing = false; 
                }, 800);
           }
        },

        /**
         * Trigger an event already bound to a raphael element
         * @param {Raphael.Element} element
         * @param {String} event - the event name
         *
         */
        trigger : function(element, event){

            var evt = _.where(element.events, { name : event});
            if(evt.length && evt[0] && typeof evt[0].f === 'function'){
                evt[0].f.apply(element, Array.prototype.slice.call(arguments, 2));
            }
        },

        /**
         * Get paper position relative to the container 
         * @param {jQueryElement} $container - the paper container
         * @param {Raphael.Paper} paper - the interaction paper
         * @returns {Object} position with top and left
         */
        position : function($container, paper){
            var pw = parseInt(paper.w || paper.width, 10);
            var cw = parseInt($container.width(), 10);
            var ph = parseInt(paper.w || paper.width, 10);
            var ch = parseInt($container.height(), 10);

            return {
                left : ((cw - pw) / 2), 
                top : ((ch - ph) / 2) 
            };
        },

        /**
         * Get a point from a click event
         * @param {jQueryElement} $container - the element that contains the paper
         * @param {MouseEvent} event - the event triggered by the click
         * @returns {Object} the x,y point
         */ 
        clickPoint : function($container, event){
            var x, y; 
            var offset = $container.offset();
             if (event.pageX || event.pageY) {
                x = event.pageX - offset.left;
                y = event.pageY - offset.top;
            } else if (event.clientX || event.clientY) {
                x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - offset.left;
                y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - offset.top;
            }

            return { x : x, y : y };
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
