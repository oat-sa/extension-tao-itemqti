define([
    'lodash',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/uploadInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'jquery',
    'jqueryui',
    'i18n',
    'context',
    'filereader'
], function(_, tpl, Helper, $, $ui, __, context) {

	var _response = { "base" : null };
	
    var _setInstructions = function(interaction) {

    };
    
    var _handleSelectedFiles = function(interaction, file) {
    	var $container = Helper.getContainer(interaction);
        
        // Show information about the processed file to the candidate.
        var filename = file.name;
        var filesize = file.size;
        var filetype = file.type;
        
        $container.find('.file-name').empty()
        							 .append(filename);
        
        // Let's read the file to get its base64 encoded content.
        var reader = new FileReader();

        // Update file processing progress.
        
        reader.onload = function (e) {
        	$container.find('.progressbar').progressbar({
        		value: 100
        	});
        	
            var base64Data = e.target.result;
            var commaPosition = base64Data.indexOf(',');
            
            // Store the base64 encoded data for later use.
            base64Raw = base64Data.substring(commaPosition + 1);
            filetype = filetype;
            _response = { "base" : { "file" : { "data" : base64Raw, "mime" : filetype, "name" : filename } } }; 
        }
        
        reader.onloadstart = function (e) {
        	$container.find('.progressbar').progressbar({
        		value: 0
        	});
        };
        
        reader.onprogress = function (e) {
        	var percentProgress = Math.ceil(Math.round(e.loaded) / Math.round(e.total) * 100);
        	$container.find('.progressbar').progressbar({
        		value: percentProgress
        	});
        }
        
        reader.readAsDataURL(file);
    };
    
    var _resetGui = function(interaction) {
    	$container = Helper.getContainer(interaction);
    	$container.find('.file-name').text(__('No file selected'));
    	$container.find('.btn-info').text(__('Browse...'));
    };
    
    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * @param {object} interaction
     */
    var render = function(interaction, options) {
    	$container = Helper.getContainer(interaction);
    	_resetGui(interaction);
    	
    	var changeListener = function (e) {
    		var file = e.target.files[0];
    		_handleSelectedFiles(interaction, file);
    	};
    	
    	if (window.File && window.FileReader && window.FileList) {
    		// Yep ! :D
            $container.find('input').bind('change', changeListener);
        }
        else {
        	// Nope... :/
            $container.find('input').fileReader({
    	        id: 'fileReaderSWFObject',
    	        filereader: context.taobase_www + 'js/lib/polyfill/filereader.swf',
    	        callback: function() {
    	            $container.bind('change', changeListener);
    	        }
    	    });
        }
    };
    
    var resetResponse = function(interaction) {
    	$container = Helper.getContainer(interaction);
    	_resetGui(interaction);
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
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response) {
    	$container = Helper.getContainer(interaction);
    	var filename = (typeof response.base.file.name != 'undefined') ? response.base.file.name : 'previously-uploaded-file';
    	$container.find('.file-name').empty()
    								 .text(filename);
    	_response = response;
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
    var getResponse = function(interaction) {
        return _response;
    };
    
    return {
        qtiClass : 'uploadInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse
    };
});