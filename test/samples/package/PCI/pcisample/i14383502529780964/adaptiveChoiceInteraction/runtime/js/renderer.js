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
 * Copyright (c) 2015 (original work) Open Assessment Technologies;
 *               
 */
define([
    'jquery',
    'ui/feedback',
    'i18n',
    'util/url',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement'
], function ($, feedback, __, urlUtil, containerEditor, PortableElement) {
    'use strict';
    return function adaptiveChoiceRenderer(options) {
        var renderer,
            defaultOptions = {},
            markup;

        /**
         * Function returns Handlebars template options (helpers) that will be used when rendering.
         * @returns {object} - Handlebars template options
         */
        function getTemplateData() {
            var data = _.cloneDeep(renderer.options.interaction.properties);
            data.states = {
                'question' : renderer.options.state === 'question'
            };
            data.addChoiceButton = renderer.options.state === 'question' && data.choices.length < 3;

            return data;
        }

        renderer = {
            options : {},
            eventNs : 'adaptiveChoiceInteraction',
            init : function init() {
                _.assign(this.options, defaultOptions, options);
            },
            /**
             * Function sets interaction state.
             * @param {string} state name (e.g. 'question' | 'answer')
             * @return {object} this
             */
            setState: function setState(state) {
                this.options.state = state;
                if (state === 'runtime') {
                    this.initEliminator();
                }

                return this;
            },
            /**
             * Initialize the answer eliminator.
             * @returns {object} this
             */
            initEliminator : function initEliminator() {
                var self = this,
                    checkedChoice,
                    result,
                    incorrectChoices;

                //I know that this is not very good hack, but i didn't find different way to get delivery exec iframe.
                window.parent.parent.$('[data-control="move-forward"] *, #preview-submit-button').on('click', function () {
                    checkedChoice = self.options.$container.find('.js-answer-input:checked');

                    if (checkedChoice.length === 0) {
                        feedback().info(__('Please make choice.'));
                        result =  false;
                    } else {
                        if (checkedChoice.hasClass('correct')) {
                            result = true;
                        } else {
                            incorrectChoices = self.options.$container.find('.js-answer-input:not(.correct)');
                            if (incorrectChoices.length) {
                                incorrectChoices.eq(0).closest('.qti-choice').css({'visibility' : 'hidden'});
                                incorrectChoices.eq(0).remove();
                                feedback().info(__('This is the wrong answer. Please try again.'));
                                checkedChoice.prop('checked', false);
                            }
                            result =  false;
                        }
                    }

                    return result;
                });
            },
            /**
             * Render interaction
             * @param {object} data - interaction properties
             * @param {boolean} returnMarkup - 
             * @return {object} this
             */
            render : function render() {
                var self = this,
                    templateData;
            
                if (this.options.templates && this.options.templates.markupTpl) {
                    templateData = getTemplateData();
                    
                    markup = PortableElement.fixMarkupMediaSources(
                        self.options.templates.markupTpl(templateData),
                        self.options.interaction.renderer
                    );
                    this.options.$container
                        .find('.qti-customInteraction')
                        .html(markup);

                    this.options.interaction.triggerPci('render' + this.eventNs + this.options.state);
                }
                
                return this;
            },
            /**
             * Update interaction markup
             * @returns {object} this
             */
            updateMarkup : function updateMarkup() {
                var self = this,
                    templateData;
            
                if (self.options.templates && self.options.templates.markupTpl) {
                    templateData = getTemplateData();
                    templateData.states = {runtime : true};
                    self.options.interaction.markup = self.options.templates.markupTpl(templateData);
                }
                
                return this;
            },
            /**
             * Initialize prompt and cgoice labels editors.
             * @returns {undefined}
             */
            initEditors : function initEditors() {
                var self = this,
                    $prompt = self.options.$container.find('.prompt'),
                    $choiceLabel;
            
                containerEditor.create($prompt, {
                    change : function (text) {
                        self.options.interaction.properties.prompt = text;
                        self.updateMarkup();
                    },
                    markup : self.options.interaction.markup,
                    markupSelector : '.prompt',
                    related : self.options.interaction
                });

                this.options.$container.find('.js-choice-label').each(function (key, val) {
                    $choiceLabel = self.options.$container.find('.js-choice-label[data-choice-index="' + key + '"]');
                    containerEditor.create($choiceLabel, {
                        change : function (text) {
                            self.options.interaction.properties.choices[key].label = text;
                            self.updateMarkup();
                        },
                        markup : self.options.interaction.markup,
                        markupSelector : '.js-choice-label[data-choice-index="' + key + '"]',
                        related : self.options.interaction
                    });
                });
            },
            /**
             * Destroy prompt and cgoice labels editors.
             * @returns {undefined}
             */
            destroyEditors : function destroyEditors() {
                var self = this,
                    $choiceLabel;
            
                self.options.$container.find('.js-choice-label').each(function (key, val) {
                    $choiceLabel = self.options.$container.find('.js-choice-label[data-choice-index="' + key + '"]');
                    containerEditor.destroy($choiceLabel);
                });
                containerEditor.destroy(self.options.$container.find('.prompt'));
            }
        };

        renderer.init();

        return renderer;
    };
});