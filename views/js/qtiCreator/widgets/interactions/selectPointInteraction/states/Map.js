/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/SelectPointInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/incrementer',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, SelectPointInteraction, helper, graphicHelper, PciResponse, answerStateHelper, shapeEditor, grahicScorePopup, mappingFormTpl, formElement, incrementer, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget      = this.widget;
        var interaction = widget.element;
        var response    = interaction.getResponseDeclaration();

        if(!interaction.paper){
            return;
        }

        //really need to destroy before ? 
        SelectPointInteraction.destroy(interaction);
        
        //add a specific instruction
        helper.appendInstruction(interaction, __('Please create areas that correspond to the response and associate them a score. You can also position the target to the exact point as the correct response.'));
        interaction.responseMappingMode = true;
        if(_.isPlainObject(response.mapEntries)){
            response.mapEntries = _.values(response.mapEntries);
        }

        //here we do not use the common renderer but the creator's widget to get only a basic paper with the choices
        widget.createPaper(); 

        _.forEach(response.mapEntries, function(area){
            var id = areaId(area);        
            var shape = widget.createResponseArea(area.shape, area.coords); 
            var scoreElt = graphicHelper.createShapeText(interaction.paper, shape, {
                        id          : 'score-' + id,
                        content     : area.mappedValue + '',
                        style       : 'score-text-default',
                        title       : __('Score value'),
                        shapeClick  : true
                    });
            shape.id = id; 
        });

        //instantiate the shape editor, attach it to the widget to retrieve it during the exit phase
        widget._editor = shapeEditor(widget, {
            currents : response.mapEntries.map(areaId),
            target : true,
            shapeCreated : function(shape, type){

                if(type === 'target'){
                    
                    var point = shape.data('target');
                    response.setCorrect(point.x + ',' + point.y);
                } else {

                    //create an area for the mapping
                    var area = {
                        shape  : type === 'path' ? 'poly' : type,
                        coords : graphicHelper.qtiCoords(shape),
                        mappedValue :  response.mappingAttributes.defaultValue || '0'
                    };
                    var id = areaId(area);

                    //display thedefault  score
                    var scoreElt = graphicHelper.createShapeText(interaction.paper, shape, {
                        id          : 'score-' + id,
                        content     : area.mappedValue + '',
                        style       : 'score-text-default',
                        title       : __('Score value'),
                        shapeClick  : true
                    });

                    //the score use the default value
                    scoreElt.data('default', true); 

                    //add an id to the shape                    
                    shape.id = areaId(area);

                    response.mapEntries.push(area);
                }
            },
            shapeRemoved : function(id){
                _.remove(response.mapEntries, function(area){
                    return id && areaId(area) === id;
                });
            },
            enterHandling : function(shape){
                shape.toFront();
            },
            quitHandling : function(shape){
                var scoreElt = interaction.paper.getById('score-' + shape.id);
                if(scoreElt){
                    scoreElt.show().toFront();
                }
            },
            shapeChanging : function(shape){
                var scoreElt = interaction.paper.getById('score-' + shape.id);
                if(scoreElt){
                    scoreElt.hide();
                }
            },
            shapeChange : function(shape){
                var found = false;
                _.forEach(response.mapEntries, function(area, index){
                    if(areaId(area) === shape.id){
                        found = index;
                        return false;
                    }
                });
                if(found !== false){
                    response.mapEntries[found].coords = graphicHelper.qtiCoords(shape);

                    //update the scoreTextPosition
                    var scoreElt = interaction.paper.getById('score-' + shape.id);
                    if(scoreElt){
                        var bbox = shape.getBBox();
                        var defaultState = scoreElt.data('default');
                        scoreElt.attr({
                            x : bbox.x + (bbox.width / 2), 
                            y : bbox.y + (bbox.height / 2)
                        }).show()
                          .toFront();
                        scoreElt.id = 'score-' + areaId(response.mapEntries[found]);
                        //need to set data again because of the id change
                        scoreElt.data('default', !!defaultState);
                    }
                    shape.id = areaId(response.mapEntries[found]);
                }


            }
        });

        //and create it
        widget._editor.create();

        //initResponseMapping(widget);          

        //update the elements on attribute changes
        widget.on('mappingAttributeChange', function(data){
            if(data.key === 'defaultValue'){
                interaction.paper.forEach(function(element){
                    if(/^score/.test(element.id) && element.data('default') === true){
                        element.attr({text : data.value });
                    }
                });
            }
        });

        //set the current corrects responses on the paper
        //SelectPointInteraction.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));   

        function areaId(area){
            return area.shape + '-' + area.coords;
        }
        
    }

    /**
     * Exit the map state
     */
    function exitMapState(){
        var widget = this.widget;
        var interaction = widget.element;

        if(!interaction.paper){
            return;
        }

        if(widget._editor){
            widget._editor.destroy();
        }
        
        //destroy the common renderer
        helper.removeInstructions(interaction);
        SelectPointInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
    }


    /**
     * Set up all elements to set the response mapping.
     * TODO this method needs to be split
     * @param {Oject} widget - the current widget
     */
    function initResponseMapping(widget){
        var interaction = widget.element;
        var $container  = widget.$container; 
        var $imageBox   = $('.main-image-box', $container);
        var response    = interaction.getResponseDeclaration();
        var areas       = _.values(response.getMapEntries());
        
        var scoreTexts = {};

        _.forEach(areas, function(area, index){
            var shape = widget.createResponseArea(area.shape, area.coords);  
            var $popup = grahicScorePopup(shape, $imageBox);
            var score = area.mappedValue || response.mappingAttributes.defaultValue || '0'; 

            //create an SVG  text from the default mapping value
            scoreTexts[index] = graphicHelper.createShapeText(interaction.paper, shape, {
                id          : 'score-' + index,
                content     : score,
                style       : 'score-text-default',
                shapeClick  : true
            }).data('default', true); 
                      
            //create manually the mapping form (detached)
            var $form = $(mappingFormTpl({
                score       : score,
                scoreMin    : response.getMappingAttribute('lowerBound'),
                scoreMax    : response.getMappingAttribute('upperBound')
            }));

            //set up the form data binding
            formElement.initDataBinding($form, response, {
                score : function(response, value){
                    var scoreText = scoreTexts[index];
                    if(value === ''){
                        scoreText.attr({text : response.mappingAttributes.defaultValue})
                                 .data('default', true);
                        graphicHelper.updateElementState(scoreText, 'score-text-default');
                    } else {
                        scoreText.attr({text : value})
                                 .data('default', false);
                        graphicHelper.updateElementState(scoreText, 'score-text');
                    }
                    area.mappedValue = parseFloat(value);
                    response.setMapEntry(index, area, true);
                }
            });
            $form.appendTo($popup);
        });

        //set up ui components used by the form
        incrementer($container);
        tooltipster($container);

         
        interaction.paper.getById('bg-image-' + interaction.serial).click(function(){
            $('.graphic-mapping-editor', $container).hide();
        });

        //update the elements on attribute changes
        widget.on('mappingAttributeChange', function(data){
            if(data.key === 'defaultValue'){
                _.forEach(scoreTexts, function(scoreText){
                    if(scoreText.data('default') === true){
                        scoreText.attr({text : data.value });
                    }
                });
            }
        });
    }


    /**
     * The map answer state for the selectPoint interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
