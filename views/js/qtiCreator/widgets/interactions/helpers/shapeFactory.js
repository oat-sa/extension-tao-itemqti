/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeHandlers',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeResizer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeMover',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/pathBuilder'
], function($, _, graphicHelper, shapeHandlers, shapeResizer, shapeMover, pathBuilder){

    var shapeFactory = function shapeFactory(options){
        var paper = options.paper;
        var background = options.background;
        var $container = options.$container;
        var isResponsive = options.isResponsive || false;
        var type = options.type || 'rect';

        var shaper = {

            shape : null,

            handlers : [],

            states : {
                drawing : false,
                handling : false,
                resizing : false,
                moving : false
            },

            _events : {},

            on : function on(eventName, cb){
                if(_.isFunction(cb)){
                    this._events[eventName] = cb;
                }
            },

            is : function is(state){
                return this.states[state] === true;
            },
            
            setState : function setState(state, value){
                this.states[state] = value;
            },

            startDrawingPath : function startDrawingPath(){
                var self = this;
                var builder = pathBuilder(paper);
                
                self.setState('drawing', true);
                
                builder.onClose(created);
                background.click(function(event){
                    event.preventDefault();                    
                    if(self.is('drawing')){
                        builder.add(
                            graphicHelper.getPoint(event, paper, $container, isResponsive)
                        );
                    }
                });

                function created(){
                    self.setState('drawing', false);
                    background.unclick();
                    self.updateableShape(builder.getPath());
                }
            },
          
            startWithMouse : function startWithMouse(){            
                var self = this;
                var smoothResize = _.throttle(resize, 10);
                var startPoint;
                var shape;
                
                background.mousedown( function startDrawing(event){
                    event.preventDefault();


                    if(!self.is('drawing')){
                        self.setState('drawing', true);

                        startPoint = graphicHelper.getPoint(event, paper, $container, isResponsive);

                        //create a base shape
                        shape = graphicHelper.createElement(paper, type, [startPoint.x, startPoint.y, 25, 25], { hover : false, touchEffect : false, qtiCoords : false});
                        shape.attr(graphicHelper._style.active);
    
                        shape.mouseup(created);
                        background.mouseup(created);
                        
                        //resize it now
                        shape.mousemove(smoothResize);
                        background.mousemove(smoothResize);    
                    }

                });

                function created(){
                    self.setState('drawing', false);
                    background
                        .unmousedown()
                        .unmousemove()
                        .unmouseup();
                    shape
                        .unmousedown()
                        .unmouseup()
                        .unmousemove();
                    self.updateableShape(shape);               
                }

                function resize(event){
                    if(self.is('drawing')){
                        shapeResizer(shape, {
                            start   : startPoint,
                            stop    : graphicHelper.getPoint(event, paper, $container, isResponsive)
                        });
                    }
                }
            },

            updateableShape : function(shape){
                var self = this;
                if(shape && shape.type){
                    self.shape = shape;
                    background.click(function(){
                         if(!self.is('resizing') && self.is('handling')){
                            self.quitHandling();  
                         }
                    });
                    self.shape.click(function(){
                         if(!self.is('resizing')){
                            if(!self.is('handling')){
                                self.enterHandling();  
                            } else {
                                self.quitHandling();  
                            }    
                        }
                    });
                }
            },

            enterHandling : function enterHandling(){
                var self = this;
                
               self.setState('handling', true);

               if(self._events['enterhandling.qti-widget']){
                   self._events['enterhandling.qti-widget'].apply(this); 
               }

               self.handlers = shapeHandlers(paper, self.shape);
                
               _.forEach(self.handlers, function(handler){
                    handler.drag(resize, startResize, resized);
                });

               self.shape.drag(move, startMove, moved);
   
                function startResize (){ 
                    var handler  = this; 
                    self.setState('resizing', true);
                    
                    //create a layer to be reiszed
                    self.layer = self.shape.clone();
                    self.layer.attr(graphicHelper._style.basic);
                    self.layer.attr('cursor', handler.attrs.cursor);

                    if(self.shape.type === 'path'){
                       _.forEach(self.shape.attr('path'), function(point, index){
                           if(point.length === 3 && point[1] === this.attr('cx') && point[2] === this.attr('cy')){
                                this.pointIndex = index;
                                return false; 
                           }                 
                       }, handler); 
                    }

                    //hide others
                    _.invoke(_.reject(_.clone(self.handlers), function(elt){
                        return elt === handler;
                    }), 'hide');                              
                }
                 
               function resize(dx, dy, x, y, event){
                    var stopPoint, options;
                    if(self.is('resizing')){

                        stopPoint = graphicHelper.getPoint(event, paper, $container, isResponsive);
                        options =  {
                            stop        : stopPoint,
                            constraints : this.data('constraints')
                        };

                        if(self.shape.type === 'path'){
                            options.start = _.pick(this.attrs, ['cx', 'cy']); 
                            options.path = self.layer.attr('path');
                            options.pointIndex = this.pointIndex;
                        }

                        shapeResizer(self.layer, options);

                        if(this.type === 'circle'){
                            this.animate({
                                cx : stopPoint.x,
                                cy : stopPoint.y
                            });
                        } else {
                            this.animate(stopPoint);
                        }
                    }
                }
               
                function resized(){

                    self.shape.animate(
                        _.pick(self.layer.attrs, ['x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'path'])
                    );

                    self.layer.remove();
                    
                    _.invoke(self.handlers, 'remove');
                    self.handlers = [];
                    
                    self.setState('resizing', false);
                    self.setState('handling', false);
                } 
                
                function startMove(){
                    self.setState('moving', true);
                    this.startPoint = _.pick(self.shape.attrs, ['x', 'y', 'cx', 'cy', 'path']);
                    self.shape.attr('cursor', 'move');
                    background.attr('cursor', 'move');
                    _.invoke(self.handlers, 'hide');                              
                }        
                
                function move(dx, dy){
                    var dest;
                    if(self.is('moving')){
                        
                        shapeMover(this, this.startPoint, { x: dx, y : dy }); 
                    }
                }

                function moved(){
                    self.setState('moving', false);
                    delete this.startPoint;
                    self.shape.attr('cursor', 'pointer');
                    background.attr('cursor', 'default');
                    _.invoke(self.handlers, 'show');                              
                }
            },

            quitHandling : function enterHandling(){
                var self = this;

                self.shape.undrag();
                _.invoke(self.handlers, 'remove');
                self.handlers = [];
                self.setState('resizing', false);
                self.setState('handling', false);

                if(self._events['quithandling.qti-widget']){
                   self._events['quithandling.qti-widget'].apply(this); 
                }
            },

            removeShape : function removeShape(){
                var self = this;

                self.quitHandling();
                if(self.shape){
                    self.shape.remove();
                }
            }
        };

        return shaper;
    };

    return shapeFactory;
});
