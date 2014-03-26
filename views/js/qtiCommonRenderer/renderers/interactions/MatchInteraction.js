define([
    'lodash',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/matchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'i18n'
], function(_, $, tpl, Helper, pciResponse, __){

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * @param {object} interaction
     */
    var render = function(interaction){
        var $container = Helper.getContainer(interaction);
        
        $container.find('input[type=checkbox]').click(function() {
        	// @todo something when you click.
        });
    };

    /**
     * Set the response to the rendered interaction.
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){
    	if (typeof response.list !== 'undefined' && typeof response.list.directedPair !== 'undefined') {
    		_(response.list.directedPair).forEach(function (directedPair) {
    			var x = $('th[data-identifier=' + directedPair[0] + ']').index() - 1;
    			var y = $('th[data-identifier=' + directedPair[1] + ']').parent().index();

    			$('.matrix > tbody tr').eq(y).find('input[type=checkbox]').eq(x).attr('checked', 'checked');
    		});
    	}
    };

    /**
     * Return the response of the rendered interaction
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
    	var response = pciResponse.serialize(_getRawResponse(interaction), interaction);
    	return response;
    };
    
    var _getRawResponse = function(interaction){
    	var $container = Helper.getContainer(interaction);
    	var values = [];
    	
        $container.find('input[type=checkbox]:checked').each(function() {
        	values.push(_inferValue(this));
        });
        
        return values;
    }
    
    var _inferValue = function(element) {
    	$element = $(element);
    	var y = $element.closest('tr').index();
    	var x = $element.closest('td').index();
    	var firstId = $('.matrix > thead th').eq(x).data('identifier');
    	var secondId = $('.matrix > tbody th').eq(y).data('identifier');
    	return [firstId, secondId];
    };

    return {
        qtiClass : 'matchInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse
    };
});