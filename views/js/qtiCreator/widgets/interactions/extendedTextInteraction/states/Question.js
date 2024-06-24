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
    'module',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/patternMask',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/extendedText',
    'services/features'
], function(
    $,
    _,
    __,
    module,
    stateFactory,
    Question,
    formElement,
    renderer,
    patternMaskHelper,
    formTpl,
    features
) {
    'use strict';

    var config = module.config();

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
            $original = _widget.$original,
            $container = _widget.$container,
            $inputs,
            $constraintsBlock,
            $recommendationsBlock,
            $textCounter,
            interaction = _widget.element,
            isMathEntry = interaction.attr('data-math-entry') === 'true',
            format = interaction.attr('format'),
            patternMask = interaction.attr('patternMask'),
            expectedLength = parseInt(interaction.attr('expectedLength'), 10),
            expectedLines = parseInt(interaction.attr('expectedLines'), 10),
            maxWords = parseInt(patternMaskHelper.parsePattern(patternMask, 'words'), 10),
            maxChars = parseInt(patternMaskHelper.parsePattern(patternMask, 'chars'), 10),
            $counterMaxWords = $('.text-counter-words > .count-max-words', $original),
            $counterMaxLength = $('.text-counter-chars > .count-max-length', $original);

        var formats = {
            plain: { label: __('Plain text'), selected: false },
            xhtml: { label: __('Rich text'), selected: false }
        };

        
        if (features.isVisible('taoQtiItem/creator/interaction/extendedText/property/preFormatted')) {
            formats.preformatted = {
                label: __('Pre-formatted text'),
                selected: false
            };
        }

        if (config.hasMath) {
            formats.math = { label: __('Rich text + math'), selected: false };
        }
        
        const constraintsAvailable = features.isVisible('taoQtiItem/creator/interaction/extendedText/property/constraints')
        var constraints = {
            none: { label: __('None'), selected: true },
            maxLength: { label: __('Max Length'), selected: false },
            maxWords: { label: __('Max Words'), selected: false },
            pattern: { label: __('Pattern'), selected: false }
        };

        /**
         * Set the selected on the right items before sending it to the view for constraints
         */
        if (!isNaN(maxWords) && maxWords > 0) {
            constraints.none.selected = false;
            constraints.maxWords.selected = true;
        } else if (!isNaN(maxChars) && maxChars > 0) {
            constraints.none.selected = false;
            constraints.maxLength.selected = true;
        } else if (patternMask !== null && patternMask !== undefined && patternMask !== '') {
            constraints.none.selected = false;
            constraints.pattern.selected = true;
        }

        if (format === 'xhtml' && isMathEntry) {
            format = 'math';
        }

        /**
         * Set the selected on the right items before sending it to the view for formats
         */
        if (formats[format]) {
            formats[format].selected = true;
        }

        $form.html(
            formTpl({
                formats: formats,
                patternMask: patternMask,
                maxWords: maxWords,
                maxLength: maxChars,
                expectedLength: expectedLength,
                expectedLines: expectedLines,
                constraints: constraints,
                constraintsAvailable
            })
        );

        if (!maxWords && !maxChars) {
            $('.text-counter', $original).hide();
        }

        formElement.initWidget($form);

        $inputs = {
            maxLength: $form.find('[name="maxLength"]'),
            maxWords: $form.find('[name="maxWords"]'),
            patternMask: $form.find('[name="patternMask"]')
        };
        $constraintsBlock = $form.find('#constraints');
        $recommendationsBlock = $form.find('#recommendations');
        $textCounter = $container.find('.text-counter');

        if (format === 'xhtml') {
            if (!features.isVisible('taoQtiItem/creator/interaction/extendedText/property/xhtmlConstraints')) {
                $constraintsBlock.hide();
            }
            if (!features.isVisible('taoQtiItem/creator/interaction/extendedText/property/xhtmlRecommendations')) {
                $recommendationsBlock.hide();
            }
        }

        //  init data change callbacks
        var callbacks = {};

        // -- format Callback
        callbacks.format = function (interaction, attrValue) {
            var response = interaction.getResponseDeclaration();
            var correctResponse = _.values(response.getCorrect());
            var previousFormat = interaction.attr('format');
            var isMath = attrValue === 'math';
            var format = isMath ? 'xhtml' : attrValue;

            //remove the interaction
            renderer.destroy(interaction);

            //change the format and rerender
            interaction.attr('format', format);
            interaction.attr('data-math-entry', isMath ? 'true' : 'false');
            renderer.render(interaction);

            if (format === 'xhtml') {
                if (!features.isVisible('taoQtiItem/creator/interaction/extendedText/property/xhtmlConstraints')) {
                    $constraintsBlock.hide();
                    $textCounter.hide();
                }
                if (!features.isVisible('taoQtiItem/creator/interaction/extendedText/property/xhtmlRecommendations')) {
                    $recommendationsBlock.hide();
                    $textCounter.hide();
                }
            } else {
                $constraintsBlock.show();
                $recommendationsBlock.show();
                $textCounter.show();
            }

            if (format !== 'xhtml' && previousFormat === 'xhtml') {
                if (typeof correctResponse[0] !== 'undefined') {
                    // Get a correct response with all possible html tags removed.
                    // (Why not let jquery do that :-) ?)
                    response.setCorrect($('<p>' + correctResponse[0] + '</p>').text());
                }
            }
        };

        callbacks.constraint = function(interaction,attrValue){
            $('.constraint', $form).hide('500');
            $('.constraint-' + attrValue, $form).show('1000');
            $counterMaxWords.text(0);
            $inputs.maxWords.val(0);
            $counterMaxLength.text(0);
            $inputs.maxLength.val(0);
            if (attrValue === 'none' || attrValue === 'pattern') {
                $('.text-counter', $original).hide();
                if (attrValue === 'none') {
                    //Reset all constraints
                    $('input', $form).val('');
                    interaction.attr('patternMask', null);
                }
            } else if (attrValue === 'maxLength' || attrValue === 'maxWords') {
                if (attrValue === 'maxLength') {
                    $('.text-counter-words', $original).hide();
                    $('.text-counter-chars', $original).show();
                } else {
                    $('.text-counter-chars', $original).hide();
                    $('.text-counter-words', $original).show();
                }
                $('.text-counter', $original).show();
            }
        };

        callbacks.maxWords = function(interaction, attrValue){
            var newValue = parseInt(attrValue,10);
            if (! isNaN(newValue)) {
                interaction.attr('patternMask', patternMaskHelper.createMaxWordPattern(newValue));
            }
            $counterMaxWords.text(newValue);
            $inputs.patternMask.val(interaction.attr('patternMask'));
        };

        callbacks.maxLength = function(interaction, attrValue){
            var newValue = parseInt(attrValue,10);
            if(! isNaN(newValue)){
                interaction.attr('patternMask', patternMaskHelper.createMaxCharPattern(newValue));
            }
            $counterMaxLength.text(newValue);
            $inputs.patternMask.val(interaction.attr('patternMask'));
        };

        callbacks.patternMask = function(interaction, attrValue){
            interaction.attr('patternMask', attrValue);
        };

        function setAttributes (attribute, interaction, attrValue) {
            var newValue = parseInt(attrValue,10);
            if(! isNaN(newValue)){
                interaction.attr(attribute, attrValue);
            } else {
                interaction.removeAttr(attribute);
            }
        }

        callbacks.expectedLength = setAttributes.bind(null, 'expectedLength');

        callbacks.expectedLines = setAttributes.bind(null, 'expectedLines');

        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return ExtendedTextInteractionStateQuestion;
});
