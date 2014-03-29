define([
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'lodash',
    'i18n'
], function(CommonRenderer, helper, _, __){

    var ResponseWidget = {
        create : function(widget, callback){
            
            var _this = this;
            var interaction = widget.element;
            var $placeholder = $('<select>');
            widget.$container.find('.widget-response').append($placeholder);
            
            this.commonRenderer = new CommonRenderer({shuffleChoices:false});
            this.commonRenderer.load(function(){
                
                interaction.render({}, $placeholder, '', this);
                interaction.postRender({
                    allowEmpty:false,
                    placeholderText:__('select correct choice')
                }, '', this);

                callback.call(_this, this);
                
            }, ['inlineChoice', 'inlineChoiceInteraction']);
                        
        },
        setResponse : function(widget, response){
            this.commonRenderer.setResponse(widget.element, this.formatResponse(response));
        },
        destroy : function(widget){
            widget.$container.find('.widget-response').empty();
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