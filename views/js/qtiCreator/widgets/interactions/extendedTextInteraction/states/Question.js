/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2013-2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/patternMask',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/extendedText'
], function($, _, __, stateFactory, Question, formElement, renderer, patternMaskHelper, formTpl){
    'use strict';

    var initState = function initState(){
        // Disable inputs until response edition.
        renderer.disable(this.widget.element);
    };

    var exitState = function exitState(){
        // Enable inputs until response edition.
        renderer.enable(this.widget.element);
    };

    var ExtendedTextInteractionStateQuestion = stateFactory.extend(Question, initState, exitState);

    ExtendedTextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            $inputs,
            interaction = _widget.element,
            format = interaction.attr('format'),
            patternMask = interaction.attr('patternMask'),
            expectedLength = parseInt(interaction.attr('expectedLength'), 10),
            expectedLines = parseInt(interaction.attr('expectedLines'),10),
            maxWords = parseInt(patternMaskHelper.parsePattern(patternMask,'words'),10),
            maxChars = parseInt(patternMaskHelper.parsePattern(patternMask,'chars'),10);

        var formats = {
            plain : {label : __("Plain text"), selected : false},
            preformatted : {label : __("Pre-formatted text"), selected : false},
            xhtml : {label : __("XHTML"), selected : false}
        };

        var constraints = {
            none : {label : __("None"), selected : true},
            maxLength : {label : __("Max Length"), selected : false},
            maxWords : {label : __("Max Words"), selected : false},
            pattern : {label : __("Pattern"), selected : false}
        };

        /**
         * Set the selected on the right items before sending it to the view for constraints
         */
        if ( !isNaN(maxWords) && maxWords > 0) {
            constraints.none.selected = false;
            constraints.maxWords.selected = true;
        }else if (!isNaN(maxChars) && maxChars > 0) {
            constraints.none.selected = false;
            constraints.maxLength.selected = true;
        }else if( patternMask !== null && patternMask !== undefined && patternMask !== ""){
            constraints.none.selected = false;
            constraints.pattern.selected = true;
        }
        /**
         * Set the selected on the right items before sending it to the view for formats
         */
        if(formats[format]){
            formats[format].selected = true;
        }

        $form.html(formTpl({
            formats : formats,
            patternMask : patternMask,
            maxWords : maxWords,
            maxLength : maxChars,
            expectedLength : expectedLength,
            expectedLines : expectedLines,
            constraints : constraints
        }));

        formElement.initWidget($form);

        $inputs = {
            maxLength : $form.find('[name="maxLength"]'),
            maxWords : $form.find('[name="maxWords"]'),
            patternMask : $form.find('[name="patternMask"]')
        };

        //  init data change callbacks
        var callbacks = {};

        // -- format Callback
        callbacks.format = function(interaction, attrValue){
            var response = interaction.getResponseDeclaration();
            var correctResponse = _.values(response.getCorrect());
            var previousFormat = interaction.attr('format');

            //remove the interaction
            renderer.destroy(interaction);

            //change the format and rerender
            interaction.attr('format', attrValue);
            renderer.render(interaction);

            if(previousFormat === 'xhtml'){
                if(typeof correctResponse[0] !== 'undefined'){
                    // Get a correct response with all possible html tags removed.
                    // (Why not let jquery do that :-) ?)
                    response.setCorrect($('<p>' + correctResponse[0] + '</p>').text());
                }
            }
        };
        callbacks.constraint = function(interaction,attrValue){
            $('.constraint', $form).hide('500');
            $('.constraint-' + attrValue, $form).show('1000');
            if (attrValue === "none") {
                //Reset all constraints
                $('input', $form).val('');
                interaction.attr('patternMask',null);
            }
        };
        callbacks.maxWords = function(interaction, attrValue){
            var newValue = parseInt(attrValue,10);
            if (! isNaN(newValue)) {
                interaction.attr('patternMask', patternMaskHelper.createMaxWordPattern(newValue));
            }
            $inputs.maxLength.val('');
            $inputs.patternMask.val(interaction.attr('patternMask'));
        };
        callbacks.maxLength = function(interaction, attrValue){
            var newValue = parseInt(attrValue,10);
            if(! isNaN(newValue)){
                interaction.attr('patternMask', patternMaskHelper.createMaxCharPattern(newValue));
            }
            $inputs.maxWords.val('');
            $inputs.patternMask.val(interaction.attr('patternMask'));
        };
        callbacks.patternMask = function(interaction, attrValue){
            interaction.attr('patternMask', attrValue);
            /**
             * If anything is entered inside the patternMask, reset maxWords / maxLength(interaction, attrValue)
             */
            $inputs.maxWords.val('');
            $inputs.maxLength.val('');
        };

        callbacks.expectedLength = function(interaction, attrValue){
            var newValue = parseInt(attrValue,10);
            if(! isNaN(newValue)){
                interaction.attr('expectedLength', attrValue);
            }else{
                interaction.attr('expectedLength', -1);//invalid qti, 0
            }
        };

        callbacks.expectedLines = function(interactions, attrValue){
            var newValue = parseInt(attrValue,10);
            if(! isNaN(newValue)){
                interaction.attr('expectedLines', attrValue);
            }else{
                interaction.attr('expectedLines',-1);//invalid qti, 0
            }
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return ExtendedTextInteractionStateQuestion;
});
