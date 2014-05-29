/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/pairScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/pairScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/deleter',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, GraphicGapMatchInteraction, helper, graphicHelper, PciResponse, answerStateHelper,  pairScorePopup, mappingFormTpl, formElement, deleter, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        //really need to destroy before ? 
        GraphicGapMatchInteraction.destroy(interaction);
        
        if(!interaction.paper){
            return;
        }

        //add a specific instruction
        helper.appendInstruction(interaction, __('Please the score of each graphicGapMatch choice.'));
        interaction.responseMappingMode = true;

        //here we do not use the common renderer but the creator's widget to get only a basic paper with the choices
        widget.createPaper();     

        mappingForm(widget);

        //set the current corrects responses on the paper
        GraphicGapMatchInteraction.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));   
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
        
        $('.mapping-editor').remove();

        //destroy the common renderer
        helper.removeInstructions(interaction);
        GraphicGapMatchInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
    }

    function mappingForm(widget){
        var $container = widget.$container;

        var $popup = pairScorePopup($container);
        $popup.append(mappingFormTpl({}));
    }



    /**
     * The map answer state for the graphicGapMatch interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
