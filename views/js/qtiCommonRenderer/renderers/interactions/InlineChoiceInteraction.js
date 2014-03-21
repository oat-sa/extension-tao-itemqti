define([
    'lodash',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/inlineChoiceInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'i18n',
    'select2'
], function(_, $, tpl, Helper, __){

    /**
     * The value of the "empty" option
     * @type String
     */
    var _emptyValue = 'empty';

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * @param {object} interaction
     */
    var render = function(interaction){
        var $container = Helper.getContainer(interaction);

        $container.find('option[value=' + _emptyValue + ']').text('--- ' + __('leave empty') + ' ---');
        $container.select2({
            width : 'resolve',
            placeholder : __('select a choice'),
            minimumResultsForSearch : -1
        });

        _setInstructions(interaction);
    };

    var _setInstructions = function(interaction){

        var required = !!interaction.attr('required');

    };

    var _resetResponse = function(interaction){
        _setVal(interaction, _emptyValue);
    };

    var _setVal = function(interaction, choiceIdentifier){
        Helper.getContainer(interaction).val(choiceIdentifier).select2('val', choiceIdentifier);
    };
    
    /**
     * Set the response to the rendered interaction.
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        if(response.base && response.base.identifier){
            _setVal(interaction, response.base.identifier);
        }else if(_.isEmpty(response)){
            _resetResponse(interaction);
        }else{
            throw new Error('wrong response format in argument: ');
        }

    };

    var _getRawReponse = function(interaction){
        var value = Helper.getContainer(interaction).val();
        return (value && value !== _emptyValue) ? value : null;
    };

    /**
     * Return the response of the rendered interaction
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        var ret = {}, value = _getRawReponse(interaction);
        if(value){
            ret = {base : {identifier : value}};
        }else{
            ret = {};//@todo: define the way to represent a null response
        }
        return ret;
    };

    return {
        qtiClass : 'inlineChoiceInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse
    };
});