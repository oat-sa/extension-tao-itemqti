/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function(_, __, stateFactory, Correct, GraphicAssociateInteraction, helper, PciResponse){

    /**
     * Initialize the state: use the common renderer to set the correct response.
     */
    function initCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        //really need to destroy before ? 
        GraphicAssociateInteraction.destroy(interaction);
        
        //add a specific instruction
        helper.appendInstruction(interaction, __('Please select the correct graphicAssociate choices below.'));
        
        //use the common Renderer
        GraphicAssociateInteraction.render.call(interaction.getRenderer(), interaction);

        GraphicAssociateInteraction.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));

        widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(PciResponse.unserialize(data, interaction)); 
        });

    }

    /**
     * Exit the correct state
     */
    function exitCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;

        //stop listening responses changes
        widget.$container.off('responseChange.qti-widget');
        
        //destroy the common renderer
        helper.removeInstructions(interaction);
        GraphicAssociateInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
    }

    /**
     * The correct answer state for the graphicAssociate interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Correct
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Correct
     */
    return stateFactory.create(Correct, initCorrectState, exitCorrectState);
});
