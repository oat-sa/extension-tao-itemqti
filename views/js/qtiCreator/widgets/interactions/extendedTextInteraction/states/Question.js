define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/extendedText'
], function($, _, __, stateFactory, Question, formElement, renderer, formTpl){
    'use strict';
    var initState = function initState(){
        // Disable inputs until response edition.
        this.widget.$container.find('input, textarea').attr('disabled', 'disabled');
    };

    var exitState = function exitState(){
        // Enable inputs until response edition.
        this.widget.$container.find('input, textarea').removeAttr('disabled');
    };

    var ExtendedTextInteractionStateQuestion = stateFactory.extend(Question, initState, exitState);

    ExtendedTextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            format = interaction.attr('format');

        var formats = {
            plain : {label : __("Plain text"), selected : false},
            preformatted : {label : __("Pre-formatted text"), selected : false},
            xhtml : {label : __("XHTML"), selected : false}
        };

        if(formats[format]){
            formats[format].selected = true;
        }


        var patternMask = interaction.attr('patternMask');
        var maxWords = parseInt(interaction.attr('maxStrings'), 10);
        var maxLength = parseInt(interaction.attr('expectedLength'), 10);
        // Is those values number ? Else consider as undefined
        if (isNaN(maxWords)) {maxWords = undefined;}
        if (isNaN(maxLength)) {maxLength = undefined;}
        // Set the expectations
        var expectMaxWords = ( maxWords !== 0 && typeof(maxWords) !== 'undefined');
        var expectMaxLength = ( maxLength !== 0 && typeof(maxLength) !== 'undefined');
        var expectPatternMask = ( patternMask !== '' && typeof patternMask !== 'undefined');


        $form.html(formTpl({
            formats : formats,
            patternMask : patternMask,
            maxWords : maxWords,
            maxLength : maxLength,
            expectMaxLength : expectMaxLength,
            expectMaxWords : expectMaxWords,
            expectPatternMask : expectPatternMask

        }));

        formElement.initWidget($form);
        //  init data change callbacks
        var callbacks = {};

        // -- format Callback
        callbacks.format = function(interaction, attrValue){
            var response = interaction.getResponseDeclaration();
            var correctResponse = _.values(response.getCorrect());
            var previousFormat = interaction.attr('format');

            interaction.attr('format', attrValue);
            renderer.updateFormat(interaction, previousFormat);

            if(previousFormat === 'xhtml'){
                if(typeof correctResponse[0] !== 'undefined'){
                    // Get a correct response with all possible html tags removed.
                    // (Why not let jquery do that :-) ?)
                    response.setCorrect($('<p>' + correctResponse[0] + '</p>').text());
                }
            }
        };
        callbacks.maxWords = function(interaction, attrValue){
            var value = parseInt(attrValue,10);
            if (! isNaN(value)) {
                interaction.attr('maxStrings', value);
                if (value < 0) {interaction.attr('expectMaxWords', true);}
                    else {interaction.attr('expectMaxWords', false);}
            }
        };
        callbacks.maxLength = function(interaction, attrValue){
            var value = parseInt(attrValue,10);
            if (! isNaN(value)) {
                interaction.attr('expectedLength', value);
                if (value < 0) {interaction.attr('expectMaxLength', true);}
                    else {interaction.attr('expectMaxLength', false);}
            }
        };
        callbacks.patternMask = function(interaction, attrValue){
            if (attrValue !== '') {interaction.attr('expectPatternMask',true);}
                else {interaction.attr('expectPatternMask', false);}
            interaction.attr('patternMask', attrValue);
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return ExtendedTextInteractionStateQuestion;
});
