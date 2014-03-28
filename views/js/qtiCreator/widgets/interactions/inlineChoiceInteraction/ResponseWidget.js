define([
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(commonRenderer, helper, _, __){

    var ResponseWidget = {
        create : function(widget){

            var interaction = widget.element;
            var $placeholder = $('<select>');
            widget.$container.find('.widget-response').empty().append($placeholder);
            return ;
            
            var commonRenderer = Renderer.getRenderer(commonRenderer, interaction);
                
            commonRenderer.render(interaction);
        },
        setResponse : function(interaction, response){
        
            commonRenderer.setResponse(interaction, this.formatResponse(response));
        },
        destroy : function(widget){

        },
        formatResponse : function(response){
            if(!_.isString(response)){
                response = _.values(response);
                if(response && response.length){
                    response = response[0];
                }
            }
            return {base : {identifier : response}};
        },
        unformatResponse : function(formatedResponse){

            var response = [];

            if(formatedResponse.base && formatedResponse.base.identifier){
                response.push(formatedResponse.base.identifier);
            }
            return response;
        }
    };

    return ResponseWidget;
});