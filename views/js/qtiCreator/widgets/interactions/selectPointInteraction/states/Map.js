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
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/incrementer',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, SelectPointInteraction, helper, graphicHelper, PciResponse, answerStateHelper,  mappingFormTpl, formElement, incrementer, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        //really need to destroy before ? 
        SelectPointInteraction.destroy(interaction);
        
        //add a specific instruction
        helper.appendInstruction(interaction, __('Please the score of each selectPoint choice.'));
        interaction.responseMappingMode = true;

        //here we do not use the common renderer but the creator's widget to get only a basic paper with the choices
        widget.createPaper();     

        initResponseMapping(widget);           

        //set the current corrects responses on the paper
        SelectPointInteraction.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));   
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
        var $elements = {};
        var scoreTexts = {};
        var interaction = widget.element;
        var $container = widget.$container; 
        var responseDeclaration = interaction.getResponseDeclaration();
        var mapEntries = responseDeclaration.getMapEntries(); 
        var corrects = _.values(responseDeclaration.getCorrect());

        var $imageBox = $('.main-image-box', $container);
        var boxOffset = $imageBox.offset();

        //get the shape of each choice
        _.forEach(interaction.getChoices(), function(choice){    

            var shape = interaction.paper.getById(choice.serial);
            var $shape = $(shape.node);
            var $element = $('<div class="graphic-mapping-editor"></div>'); 
            var offset = $shape.offset();
            var bbox = shape.getBBox();

            //create an SVG  text from the default mapping value
            scoreTexts[choice.serial] = graphicHelper.createShapeText(interaction.paper, shape, {
                id          : 'score-' + choice.serial,
                content     : responseDeclaration.mappingAttributes.defaultValue || '0',
                style       : 'score-text-default',
                shapeClick  : true
            }).data('default', true); 
                      
            //create manually the mapping form (detached)
            var $form = $(mappingFormTpl({
                identifier  : choice.id(),
                correctDefined : answerStateHelper.isCorrectDefined(widget),
                correct     : _.contains(responseDeclaration.getCorrect(), choice.id()),
                score       : mapEntries[choice.id()] || responseDeclaration.mappingAttributes.defaultValue,
                scoreMin    : responseDeclaration.getMappingAttribute('lowerBound'),
                scoreMax    : responseDeclaration.getMappingAttribute('upperBound')
            }));

            //set up the form data binding
            formElement.initDataBinding($form, responseDeclaration, {
                score : function(response, value){
                    var scoreText = scoreTexts[choice.serial];
                    if(value === ''){
                        response.removeMapEntry(choice.id());
                        scoreText.attr({text : responseDeclaration.mappingAttributes.defaultValue})
                                                 .data('default', true);
                        graphicHelper.updateElementState(scoreText, 'score-text-default');
                    } else {
                        response.setMapEntry(choice.id(), value, true);
                        scoreText.attr({text : value})
                                 .data('default', false);
                        graphicHelper.updateElementState(scoreText, 'score-text');
                    }
                }, 
                correct : function(response, value){
                    if(value === true){
                        if(!_.contains(corrects, choice.id())){
                            corrects.push(choice.id());
                            shape.active = true;
                            graphicHelper.updateElementState(shape, 'active');
                        }
                    } else {
                        corrects = _.without(corrects, choice.id());
                        shape.active = false;
                        graphicHelper.updateElementState(shape, 'basic');
                    }
                    response.setCorrect(corrects);
                }
            });

            //TODO move to scss
            //style and attach the form
            $element.css({
                'display'   : 'none',  
                'position'  : 'absolute',
                'width'     : '150px',
                'height'    : '150px',
                'background': 'white',
                'border'    : 'solid 1px grey',
                'text-align': 'left',
                'z-index'   : 10009,
                'top'       : offset.top - boxOffset.top,
                'left'      : offset.left - boxOffset.left + bbox.width 
            }).appendTo($imageBox).append($form);
            $imageBox.css('overflow', 'visible'); 
    
            $elements[choice.serial] = $element; 

    
            shape.click(function(){
                $('.graphic-mapping-editor', $container).hide();
                $element.show();
            });
        });

        //set up ui components used by the form
        incrementer($container);
        tooltipster($container);

        
        interaction.paper.getById('bg-image-' + interaction.serial).click(function(){
            _.invoke($elements, 'hide');
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
