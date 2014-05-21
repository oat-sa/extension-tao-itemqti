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
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/incrementer',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, SelectPointInteraction, helper, graphicHelper, PciResponse, answerStateHelper, grahicScorePopup, mappingFormTpl, formElement, incrementer, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget      = this.widget;
        var interaction = widget.element;
        var response    = interaction.getResponseDeclaration();


        //really need to destroy before ? 
        SelectPointInteraction.destroy(interaction);
        
        //add a specific instruction
        helper.appendInstruction(interaction, __('Please create areas that correspond to the response and associate them a score'));
        interaction.responseMappingMode = true;

        //here we do not use the common renderer but the creator's widget to get only a basic paper with the choices
        widget.createPaper();     

        initResponseMapping(widget);           

        //set the current corrects responses on the paper
        //SelectPointInteraction.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));   
    }

    /**
     * Exit the map state
     */
    function exitMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        
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
