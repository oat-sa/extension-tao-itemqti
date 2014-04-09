define([
    'lodash',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/matchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'i18n'
], function(_, $, tpl, Helper, pciResponse, __) {
	
	/**
	 * Flag to not throw warning instruction if already
	 * displaying the warning. If such a flag is not used,
	 * disturbances can be seen by the candidate if he clicks
	 * like hell on choices.
	 */
	var inWarning = false;
	
    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * @param {object} interaction
     */
    var render = function(interaction) {
        var $container = Helper.getContainer(interaction);

        // Initialize instructions system.
        _setInstructions(interaction);
        
        $container.find('input[type=checkbox]').click(function(e) {
        	_onCheckboxSelected(interaction, e);
        });
        
        Helper.validateInstructions(interaction);
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
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response) {

    	response = _filterResponse(response);
    	
    	if (typeof response.list !== 'undefined' && typeof response.list.directedPair !== 'undefined') {
    		_(response.list.directedPair).forEach(function (directedPair) {
    			var x = $('th[data-identifier=' + directedPair[0] + ']').index() - 1;
    			var y = $('th[data-identifier=' + directedPair[1] + ']').parent().index();

    			$('.matrix > tbody tr').eq(y).find('input[type=checkbox]').eq(x).attr('checked', true);
    		});
    	}
    	
    	Helper.validateInstructions(interaction);
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
    var getResponse = function(interaction) {
    	var response = pciResponse.serialize(_getRawResponse(interaction), interaction);
    	return response;
    };
    
    var resetResponse = function(interaction) {
        
    	Helper.getContainer(interaction).find('input[type=checkbox]:checked').each(function() {
    		$(this).prop('checked', false);
    	});
    	
    	Helper.validateInstructions(interaction);
    };
    
    var _filterResponse = function(response){
    	if (typeof response.list == 'undefined') {
    		// Maybe it's a base?
    		if (typeof response.base == 'undefined') {
    			// Oops, it is even not a base.
    			throw 'The given response is not compliant with PCI JSON representation.';
    		}
    		else {
    			// It's a base, Is it a directedPair?
    			if (typeof response.base.directedPair == 'undefined') {
    				// Oops again, it is not a directedPair.
    				throw 'The matchInteraction only accepts directedPair values as responses.';
    			}
    			else {
    				return { "list": { "directedPair": [response.base.directedPair] } };
    			}
    		}
    	}
    	else if (typeof response.list.directedPair == 'undefined') {
    		// Oops, not a directedPair.
    		throw 'The matchInteraction only accept directedPair values as responses.';
    	}
    	else {
    		return response;
    	}
    }
    
    var _getRawResponse = function(interaction){
    	var $container = Helper.getContainer(interaction);
    	var values = [];
    	
        $container.find('input[type=checkbox]:checked').each(function() {
        	values.push(_inferValue(this));
        });
        
        return values;
    };
    
    var _inferValue = function(element) {
    	var $element = $(element);
    	var y = $element.closest('tr').index();
    	var x = $element.closest('td').index();
    	var firstId = $('.matrix > thead th').eq(x).data('identifier');
    	var secondId = $('.matrix > tbody th').eq(y).data('identifier');
    	return [firstId, secondId];
    };
    
    var _onCheckboxSelected = function(interaction, e) {

    	var currentResponse = _getRawResponse(interaction);
    	var minAssociations = interaction.attr('minAssociations');
    	var maxAssociations = interaction.attr('maxAssociations');
    	
    	if (maxAssociations === 0) {
    		maxAssociations = _countChoices(interaction);
    	}
    	
    	if (_.size(currentResponse) > maxAssociations) {
    		e.preventDefault();
    	}
    	
    	Helper.validateInstructions(interaction);
    };
    
    var _countChoices = function(interaction) {
    	var $container = Helper.getContainer(interaction);
    	return $container.find('input[type=checkbox]').length;
    };
    
    var _setInstructions = function(interaction) {
    	
    	var minAssociations = interaction.attr('minAssociations');
    	var maxAssociations = interaction.attr('maxAssociations');
    	var choiceCount = _countChoices(interaction);
    	
    	// Super closure is here again to save our souls! Houray!
    	// ~~~~~~~ |==||||0__
    	
    	var superClosure = function() {

    		var onMaxChoicesReached = function(report, msg) {
    			if (inWarning === false) {
    				inWarning = true;
    				
        			report.update({
                        level: 'warning',
                        message: __('Maximum number of choices reached.'),
                        timeout: 2000,
                        stop: function() {
                            report.update({level : 'success', message: msg});
                            inWarning = false;
                        }
                    });
    			}
    		};
    		
        	if (minAssociations == 0 && maxAssociations > 0) {
        		// No minimum but maximum.
        		var msg = __('You must select 0 to %d choices.').replace('%d', maxAssociations);
        		
        		Helper.appendInstruction(interaction, msg, function() {
        			var responseCount = _.size(_getRawResponse(interaction));
        			
                    if (responseCount <= maxAssociations) {
                        this.setLevel('success');
                    }
                    else if (responseCount > maxAssociations) {
                    	onMaxChoicesReached(this, msg);
                    }
                    else {
                    	this.reset();
                    }
                });
        	}
        	else if (minAssociations == 0 && maxAssociations == 0) {
        		// No minimum, no maximum.
        		var msg = __('You must select 0 to %d choices.').replace('%d', choiceCount);
        		
        		Helper.appendInstruction(interaction, msg, function() {
        			this.setLevel('success');
        		});
        	}
        	else if (minAssociations > 0 && maxAssociations == 0) {
        		// minimum but no maximum.
        		var msg = __('You must select %1$d to %2$d choices.');
        		msg = msg.replace('%1$d', minAssociations);
        		msg = msg.replace('%2$d', choiceCount);
        		
        		Helper.appendInstruction(interaction, msg, function() {
        			var responseCount = _.size(_getRawResponse(interaction));
        			
        			if (responseCount < minAssociations) {
        				this.setLevel('info');
        			}
        			else if (responseCount > choiceCount) {
        				onMaxChoicesReached(this, msg);
        			}
        			else {
        				this.setLevel('success');
        			}
        		});
        	}
        	else if (minAssociations > 0 && maxAssociations > 0) {
        		// minimum and maximum.
        		if (minAssociations != maxAssociations) {
        			var msg = __('You must select %1$d to %2$d choices.');
            		msg = msg.replace('%1$d', minAssociations);
            		msg = msg.replace('%2$d', maxAssociations);
        		}
        		else {
        			var msg = __('You must select exactly %d choice(s).');
        			msg = msg.replace('%d', minAssociations);
        		}
        		
        		Helper.appendInstruction(interaction, msg, function() {
        			
        			var responseCount = _.size(_getRawResponse(interaction));
        			
        			if (responseCount < minAssociations) {
        				this.setLevel('info');
        			}
        			else if (responseCount > maxAssociations) {
        				onMaxChoicesReached(this, msg);
        			}
        			else if (responseCount >= minAssociations && responseCount <= maxAssociations) {
        				this.setLevel('success');
        			}
        		});
        	}
    	};
    	
    	superClosure();
    }

    return {
        qtiClass: 'matchInteraction',
        template: tpl,
        render: render,
        getContainer: Helper.getContainer,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse
    };
});