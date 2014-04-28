define([
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(commonRenderer, helper, _, __){

    /**
     * The ResponseWidget use the CommonRenderer to set the responses. 
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/ResponseWidget
     */
    var ResponseWidget = {

        /**
         * Creates the ResponseWidget. 
         * Calls the HotspotInteraction Common renderer.
         * @param {HotspotInteractionWidget} widget - the hostpot widget
         * @param {Boolean} responseMappingMode 
         */
        create : function(widget, responseMappingMode){

            var interaction = widget.element;

            if(responseMappingMode){
                helper.appendInstruction(widget.element, __('Please the score of each hotspot choice.'));
                interaction.responseMappingMode = true;
            } else {
                helper.appendInstruction(widget.element, __('Please select the correct hotspot choices below.'));
            }

            commonRenderer.render.call(interaction.getRenderer(), interaction);
        },

        /**
         * Set the response 
         * @param {Object} interaction - the interaction instance
         * @param {Object} pciResponse - the response to set in PCI format
         */
        setResponse : function(interaction, pciResponse){
            commonRenderer.setResponse(interaction, pciResponse);
        },


        /**
         * Destroy the  ResponseWidget. 
         * @param {HotspotInteractionWidget} widget - the hostpot widget
         */
        destroy : function(widget){
            commonRenderer.destroy(widget.element);
        }
    };

    return ResponseWidget;
});
