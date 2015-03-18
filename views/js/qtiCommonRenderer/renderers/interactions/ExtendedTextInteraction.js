define([
    'lodash',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/extendedTextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'i18n',
    'ckeditor',
    'taoQtiItem/qtiCreator/editor/ckEditor/ckConfigurator',
    'polyfill/placeholders'
], function(_, $, tpl, Helper, __, ckEditor ,ckConfigurator){

    'use strict';
    /**
     * Setting the pattern mask for the input, for browsers which doesn't support this feature
     * @param {jQuery} $element
     * @param {string} pattern
     * @returns {undefined}
     */
    var _setPattern = function($element, pattern){
        var patt = new RegExp('^'+pattern+'$');

        //test when some data is entering in the input field
        //@todo plug the validator + tooltip
        $element.on('keyup', function(){
            $element.removeClass('field-error');
            if(!patt.test($element.val())){
                $element.addClass('field-error');
            }
        });
    };

    /**
     * Whether or not multiple strings are expected from the candidate to
     * compose a valid response.
     *
     * @param {object} interaction
     * @returns {boolean}
     */
    var _isMultiple = function(interaction) {
        var attributes = interaction.getAttributes();
        var response = interaction.getResponseDeclaration();
        return !!(attributes.maxStrings && (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered'));
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     *
     * @param {object} interaction
     */
    var render = function(interaction){
        var attributes = interaction.getAttributes();
        var $container = interaction.getContainer();
        var response = interaction.getResponseDeclaration();
        var multiple = _isMultiple(interaction);

        var $el, expectedLength, expectedLines, placeholderType;

        // ckEditor config event.
        ckEditor.on('instanceCreated', function(event) {
            var editor = event.editor,
                toolbarType = 'extendedText';

            editor.on('configLoaded', function(e) {
                editor.config = ckConfigurator.getConfig(editor, toolbarType, ckeOptions);
                editor.disableAutoInline = false; // NOT A GOOD IDEA, JUST TRY
            });

            editor.on('change', function(e) {
                Helper.triggerResponseChangeEvent(interaction, {});
            });
        });


        // if the input is textarea
        if (!multiple) {
            $el = $container.find('textarea');
            var ckeOptions = {
               extraPlugins: 'confighelper',
               resize_enabled: true
            };
            //setting the placeholder for the textarea
            if (attributes.placeholderText) {
                $el.attr('placeholder', attributes.placeholderText);
            }
            // Enable ckeditor only if text format is 'xhtml'.
            if (_getFormat(interaction) === 'xhtml') {
                // replace the textarea with ckEditor
                var editor = ckEditor.replace($container.find('.text-container')[0], ckeOptions);
                // store the instance inside data on the container
                $container.data('editor', editor);


            }
            else {
                $el.bind('keyup change', function(e) {
                    Helper.triggerResponseChangeEvent(interaction, {});
                });
            }
            if (attributes.expectedLength || attributes.expectedLines || attributes.patternMask) {
                var $textarea = $('.text-container', $container),
                    $charsCounter = $('.count-chars',$container),
                    $wordsCounter = $('.count-words',$container);

                if (attributes.patternMask !== "") {
                    var maxWords = _parsePattern(attributes.patternMask, 'words'),
                        maxLength = _parsePattern(attributes.patternMask, 'chars');
                    maxWords = (isNaN(maxWords)) ? undefined : maxWords;
                    maxLength = (isNaN(maxLength) ? undefined : maxLength);
                }

                /**
                 * Prevent the user to enter more text (words or char) than the limit allow
                 * @param  {event} evt the event that is trigged and which call this function
                 */
                var limitUserInput = function(evt){
                    /**
                     * store the keycode regardless the format of the interaction
                     * @type {Number}
                     */
                    var keys = [
                        32, // space
                        13, // enter
                        2228237, // shift + enter in ckEditor
                    ];
                    var keyCode = (typeof evt.data !== "undefined") ? evt.data.keyCode : evt.which ;
                    if ((maxWords && getWordsCount() >= maxWords && _.contains(keys,keyCode)) || (maxLength && getCharsCount() >= maxLength)){
                        if (typeof evt.cancel !== "undefined"){
                            evt.cancel();
                        }else {
                            evt.preventDefault();
                        }
                    }
                    updateCounter();
                };

                /**
                 * Update the rendering of the counters
                 */
                var updateCounter = function(){
                    $charsCounter.text(getCharsCount());
                    $wordsCounter.text(getWordsCount());
                };

                /**
                 * Get the number of words that are actually written in the response field
                 * @return {Number} number of words
                 */
                var getWordsCount = function(){
                    var value = _getTextareaValue(interaction);
                    return value.replace(/\s+/gi, ' ').split(' ').length;
                };

                /**
                 * Get the number of characters that are actually written in the response field
                 * @return {Number} number of characters
                 */
                var getCharsCount = function(){
                    var value = _getTextareaValue(interaction);
                    return value.trim().length;
                };

                /**
                 * Keycode to ignore
                 * @type {Array}
                 */
                var keycodes = [
                    8, // backspace
                    222832, // Shift + backspace in ckEditor
                    1114120, // Ctrl + backspace in ckEditor
                    1114177, // Ctrl + a in ckEditor
                    1114202, // Ctrl + z in ckEditor
                    1114200, // Ctrl + x in ckEditor
                ];

                if (_getFormat(interaction) === "xhtml") {
                    _ckEditor(interaction).on('key',function(e){
                        if (_.contains(keycodes,e.data.keyCode)){
                            updateCounter();
                        }else{
                            limitUserInput(e);
                        }
                    });
                }else{
                    $textarea.on('keydown',function(e){
                       if (_.contains(keycodes,e.which)){
                            updateCounter();
                        }else{
                            limitUserInput(e);
                        }
                    });
                }

            }

        }
        else {
            $el = $container.find('input');

            //setting the checking for minimum number of answers
            if (attributes.minStrings) {

                //get the number of filled inputs
                var _getNumStrings = function($element) {

                    var num = 0;

                    $element.each(function() {
                        if ($(this).val() !== '') {
                            num++;
                        }
                    });

                    return num;
                };

                var minStrings = parseInt(attributes.minStrings);

                if (minStrings > 0) {

                    $el.on('blur', function() {
                        setTimeout(function() {
                            //checking if the user was clicked outside of the input fields
                            if (!$el.is(':focus') && _getNumStrings($el) < minStrings) {
                                Helper.appendNotification(interaction, __('The minimum number of answers is ') + ' : ' + minStrings, 'warning');
                            }
                        }, 100);
                    });
                }
            }

            //set the fields width
            if (attributes.expectedLength) {
                expectedLength = parseInt(attributes.expectedLength, 10);

                if (expectedLength > 0) {
                    $el.each(function() {
                        $(this).css('width', expectedLength + 'em');
                    });
                }
            }

            //set the fileds pattern mask
            if (attributes.patternMask) {
                $el.each(function() {
                    _setPattern($(this), attributes.patternMask);
                });
            }

            //set the fileds placeholder
            if (attributes.placeholderText) {
                /**
                 * The type of the fileds placeholder:
                 * multiple - set placeholder for each field
                 * first - set placeholder only for first field
                 * none - dont set placeholder
                 */
                placeholderType = 'first';

                if (placeholderType === 'multiple') {
                    $el.each(function() {
                        $(this).attr('placeholder', attributes.placeholderText);
                    });
                }
                else if (placeholderType === 'first') {
                    $el.first().attr('placeholder', attributes.placeholderText);
                }
            }
        }
    };

    /**
     * Reset the textarea / ckEditor
     * @param  {object} interaction the interaction
     */
    var resetResponse = function(interaction) {
        if (_getFormat(interaction) === 'xhtml') {
            _ckEditor(interaction).setData('');
        }else{
            interaction.getContainer().find('input, textarea').val('');
        }
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

        var _setMultipleVal = function(identifier, value) {
            interaction.getContainer().find('#'+identifier).val(value);
        };

        var _setVal = function(value) {
            interaction.getContainer().find('textarea').val(value);
        };

        var baseType = interaction.getResponseDeclaration().attr('baseType');

        if (response.base && response.base[baseType] !== undefined) {
            _setVal(response.base[baseType]);
        }
        else if (response.list && response.list[baseType]) {

            for (var i in response.list[baseType]) {
                var serial = (response.list.serial === undefined) ? '' : response.list.serial[i];
                _setMultipleVal(serial + '_' + i, response.list[baseType][i]);
            }

        }
        else {
            throw new Error('wrong response format in argument.');
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
    var getResponse = function(interaction) {

        var $container = interaction.getContainer();
        var attributes = interaction.getAttributes();
        var responseDeclaration = interaction.getResponseDeclaration();
        var baseType = responseDeclaration.attr('baseType');
        var numericBase = attributes.base || 10;
        var multiple = !!(attributes.maxStrings && (responseDeclaration.attr('cardinality') === 'multiple' || responseDeclaration.attr('cardinality') === 'ordered'));
        var ret = multiple ? {list:{}} : {base:{}};

        if (multiple) {

            var values = [];

            $container.find('input').each(function(i) {

                var $el = $(this);

                if (attributes.placeholderText && $el.val() === attributes.placeholderText) {
                    values[i] = '';
                }
                else {
                    if (baseType === 'integer') {
                        values[i] = parseInt($el.val(), numericBase);
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    }
                    else if(baseType === 'float') {
                        values[i] = parseFloat($el.val());
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    }
                    else if(baseType === 'string') {
                        values[i] = $el.val();
                    }
                }
            });

            ret.list[baseType] = values;
        }
        else {

            var value = '';

            if (attributes.placeholderText && _getTextareaValue(interaction) === attributes.placeholderText) {
                value = '';
            }
            else {

                if (baseType === 'integer') {
                    value = parseInt(_getTextareaValue(interaction), numericBase);
                }
                else if (baseType === 'float') {
                    value = parseFloat(_getTextareaValue(interaction));
                }
                else if (baseType === 'string') {
                    value = _getTextareaValue(interaction);
                }
            }

            ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;
        }

        return ret;
    };

    /**
     * return the value of the textarea or ckeditor data
     * @param  {Object} interaction
     * @return {String}             the value
     */
    var _getTextareaValue = function(interaction) {
        if (_getFormat(interaction) === 'xhtml') {
            return _ckEditorData(interaction);
        }
        else {
            return Helper.getContainer(interaction).find('textarea').val();
        }
    };

    /**
     * return the ckEditor instance
     * @param  {object} interaction the interaction
     * @return {object}             ckeditor instance
     */
    var _ckEditor = function(interaction){
        return Helper.getContainer(interaction).data('editor');
    };

    /**
     * get the text content of the ckEditor ( not the entire html )
     * @param  {object} interaction the interaction
     * @return {string}             text content of the ckEditor
     */
    var _ckEditorData = function(interaction) {
        var tempNode = document.createElement('div');
        tempNode.innerHTML = _ckEditor(interaction).getData();
        return  tempNode.textContent;
    };

    var _getFormat = function(interaction) {
        var format = interaction.attr('format');

        switch (format) {
            case 'plain':
            case 'xhtml':
            case 'preformatted':
                return format;

            default:
                return 'plain';
        }
    };

    /**
     * parse the pattern (idealy from patternMask) and return the max words / chars from the pattern
     * @param  {String} pattern String from patternMask
     * @param  {String} type    the type of information you want : words / chars
     * @return {Number|null}    the number extracted of the pattern, or null if not found
     */
    var _parsePattern = function(pattern,type){
        if (pattern === undefined){return null;}

        var regexChar = /\^\[\\s\\S\]\{\d+\,(\d+)\}\$/,
        regexWords =  /\^\(\?\:\(\?\:\[\^\\s\\:\\!\\\?\\\;\\\…\\\€\]\+\)\[\\s\\:\\!\\\?\\;\\\…\\\€\]\*\)\{\d+\,(\d+)\}\$/,
        result;

        if (type === "words") {
            result = pattern.match(regexWords);
            if (result !== null && result.length > 1) {
                return parseInt(result[1],10);
            }else{
                return null;
            }
        }else if (type === "chars"){
            result = pattern.match(regexChar);

            if (result !== null && result.length > 1) {
                return parseInt(result[1],10);
            }else{
                return null;
            }
        }else{
            return null;
        }
    };

    var updateFormat = function(interaction, from) {
        var ckeOptions = {};
        var $container = Helper.getContainer(interaction);

        if ( _getFormat(interaction) === 'xhtml') {
            var editor = ckEditor.replace($container.find('.text-container')[0], ckeOptions);
            $container.data('editor', editor);
        }
        else {
            // preFormatted or plain
            if (from === 'xhtml') {
                _ckEditor(interaction).destroy();
            }
            if ( _getFormat(interaction) === 'preformatted'){$container.find('textarea').addClass('text-preformatted')}
            else{$container.find('textarea').removeClass('text-preformatted')}
        }
    };

    var enable = function(interaction) {
        var ckeOptions = {};
        var $container = Helper.getContainer(interaction);
        $container.find('input, textarea').removeAttr('disabled');

        if ( _getFormat(interaction) === 'xhtml') {
            _ckEditor(interaction).readOnly = false;
        }
    };

    var disable = function(interaction) {
        var $container = Helper.getContainer(interaction);
        $container.find('input, textarea').attr('disabled', 'disabled');

        if ( _getFormat(interaction) === 'xhtml' && $container.data('editor')) {
            _ckEditor(interaction).readOnly = true;
        }
    };

    var clearText = function(interaction) {
        setText(interaction, '');
    };

    var setText = function(interaction, text) {
        var $container = Helper.getContainer(interaction);

        if ( _getFormat(interaction) === 'xhtml') {
            var editor = _ckEditor(interaction);
            editor.setData(text,{
                callback : function(){
                    var range = editor.createRange();
                    range.moveToElementEditEnd( range.root );
                    editor.getSelection().selectRanges( [ range ] );
                }
            });
        }
        else {
            $container.find('textarea').val(text);
        }
    };

    var getCustomData = function(interaction, data){
        var pattern = interaction.attr('patternMask'),
            maxWords = parseInt(_parsePattern(pattern,'words')),
            maxLength = parseInt(_parsePattern(pattern, 'chars')),
            expectedLength = parseInt(interaction.attr('expectedLines'),10);
        return _.merge(data || {}, {
            maxWords : (! isNaN(maxWords)) ? maxWords : undefined,
            maxLength : (! isNaN(maxLength)) ? maxLength : undefined,
            attributes : (! isNaN(expectedLength)) ? { expectedLength :  expectedLength * 72} : undefined
        });

    };

    return {
        qtiClass : 'extendedTextInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        getData : getCustomData,
        resetResponse : resetResponse,
        updateFormat : updateFormat,
        enable : enable,
        disable : disable,
        clearText : clearText,
        setText : setText
    };
});
