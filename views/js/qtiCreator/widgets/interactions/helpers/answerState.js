/*
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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'services/features',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
], function (
    $,
    _,
    __,
    features,
    responseHelper,
    formElement,
    minMaxComponentFactory,
    responseFormTpl,
    modalFeedbackRule,
    qtiElements,
    xmlRenderer
) {
    'use strict';

    const modalFeedbackConfigKey = 'taoQtiItem/creator/interaction/property/modalFeedback';
    const showResponseIdentifierKey = 'taoQtiItem/creator/interaction/response/property/identifier';

    /**
     * Get the list of all available response processing templates available in the platform
     * @returns {Object}
     */
    const getAvailableTemplates = function getAvailableTemplates() {
        return {
            CUSTOM: __('custom'),
            MATCH_CORRECT: __('match correct'),
            MAP_RESPONSE: __('map response'),
            MAP_RESPONSE_POINT: __('map response'),
            NONE: __('none')
        };
    };

    /**
     * Get the list of all available base types in the platform
     * @returns {Object}
     * @param {String} listOfBaseType
     */
    const _getAvailableListOfBaseTypes = function _getAvailableListOfBaseTypes(listOfBaseType) {
        return [
            {
                label: __('string'),
                value: 'string',
                selected: listOfBaseType === 'string'
            },
            {
                label: __('integer'),
                value: 'integer',
                selected: listOfBaseType === 'integer'
            },
            {
                label: __('float'),
                value: 'float',
                selected: listOfBaseType === 'float'
            }
        ];
    };

    /**
     * Get available rp templates according to interaction type and response processing type
     *
     * @param {Object} interaction - standard interaction object model
     * @param {Array} [filteredTemplates] - shorted listed of templates the interaction can use
     * @param {Boolean} allowCustomTemplate - allow to select custom response processing
     * @returns {Object} templates
     */
    const _getAvailableRpTemplates = function _getAvailableRpTemplates(
        interaction,
        filteredTemplates,
        allowCustomTemplate
    ) {
        const rp = interaction.getRootElement().responseProcessing;
        const allTemplates = getAvailableTemplates();
        let templates = {};
        if (!_.isEmpty(filteredTemplates)) {
            _.forEach(filteredTemplates, function (templateName) {
                if (allTemplates[templateName]) {
                    templates[templateName] = allTemplates[templateName];
                }
            });
        } else {
            templates = allTemplates;
        }

        switch (interaction.qtiClass) {
            case 'orderInteraction':
            case 'graphicOrderInteraction':
            case 'extendedTextInteraction':
            case 'sliderInteraction':
            case 'uploadInteraction':
            case 'mediaInteraction':
            case 'endAttemptInteraction':
                delete templates.MAP_RESPONSE;
                delete templates.MAP_RESPONSE_POINT;
                break;
            case 'selectPointInteraction':
                delete templates.MATCH_CORRECT;
                delete templates.MAP_RESPONSE;
                break;
            default:
                delete templates.MAP_RESPONSE_POINT;
        }

        switch (interaction.typeIdentifier) {
            case 'liquidsInteraction':
                delete templates.MAP_RESPONSE_POINT;
                delete templates.MAP_RESPONSE;
                break;
        }

        if ((rp.processingType === 'templateDriven' && !allowCustomTemplate) || !features.isVisible('taoQtiItem/creator/interaction/response/responseProcessing/custom')) {
            delete templates.CUSTOM;
        } else {
            //consider as custom
        }

        return templates;
    };

    const answerStateHelper = {
        /**
         * forward to one of the available sub-state of the answer, according to the response processing template
         * @param {Object} widget
         */
        forward: function forward(widget) {
            const response = widget.element.getResponseDeclaration();
            if (responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')) {
                widget.changeState('correct');
            } else if (
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')
            ) {
                widget.changeState('map');
            } else if (responseHelper.isUsingTemplate(response, 'NONE')) {
                widget.changeState('norp');
            } else {
                widget.changeState('custom');
            }
        },

        /**
         * Allow getting and setting the possibility to define the correct response in the map response mode
         * @param {Object} response - standard response object
         * @param {boolean} [newDefineCorrectActive] - set the possibility or not to define the correct response
         * @returns {boolean}
         */
        defineCorrect: function defineCorrect(response, newDefineCorrectActive) {
            let defineCorrectActive = false;
            const template = responseHelper.getTemplateNameFromUri(response.template);
            const corrects = response.getCorrect();

            if (_.isUndefined(newDefineCorrectActive)) {
                //get:

                if (template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT') {
                    if (!_.isUndefined(response.data('defineCorrect'))) {
                        defineCorrectActive = !!response.data('defineCorrect');
                    } else {
                        //infer it :
                        defineCorrectActive = corrects && _.size(corrects);
                        response.data('defineCorrect', defineCorrectActive); //set it
                    }
                } else if (template === 'MATCH_CORRECT') {
                    defineCorrectActive = true;
                }
            } else {
                //set:
                if (!newDefineCorrectActive) {
                    //empty correct response
                    response.correctResponse = [];
                }
                response.data('defineCorrect', newDefineCorrectActive);
            }

            return defineCorrectActive;
        },

        /**
         * Init the response form the interaction answer state
         * @param {Object} widget
         * @param {Object} [options]
         * @param {Array} [options.rpTemplates] - the array of response processing templates name to be used
         */
        initResponseForm: function initResponseForm(widget, options) {
            const perInteractionRP = widget.options.perInteractionRp;

            const interaction = widget.element,
                item = interaction.getRootElement(),
                rp = item.responseProcessing,
                response = interaction.getResponseDeclaration();
            let template = responseHelper.getTemplateNameFromUri(response.template);
            const listOfBaseType = response.attributes.baseType,
                editMapping = _.indexOf(['MAP_RESPONSE', 'MAP_RESPONSE_POINT'], template) >= 0,
                defineCorrect = answerStateHelper.defineCorrect(response),
                allQtiElements = qtiElements.getAvailableAuthoringElements();

            const outcome = item.getOutcomeDeclaration(`SCORE_${response.id()}`);

            const _toggleCorrectWidgets = function (show) {
                const $correctWidgets = widget.$container.find('[data-edit=correct]');

                if (show) {
                    $correctWidgets.show();
                } else {
                    $correctWidgets.hide();
                }
            };

            options = _.defaults(options || {}, {
                rpTemplates: []
            });

            if (!template || rp.processingType === 'custom') {
                template = 'CUSTOM';
            }

            widget.$responseForm.html(
                responseFormTpl({
                    identifier: response.id(),
                    showIdentifier: features.isVisible(showResponseIdentifierKey),
                    serial: response.getSerial(),
                    defineCorrect: defineCorrect,
                    editMapping: editMapping,
                    editFeedbacks: template !== 'CUSTOM' && features.isVisible(modalFeedbackConfigKey),
                    mappingDisabled: _.isEmpty(response.mapEntries),
                    template: template,
                    templates: _getAvailableRpTemplates(
                        interaction,
                        options.rpTemplates,
                        widget.options.allowCustomTemplate
                    ),
                    listOfBaseType: listOfBaseType,
                    listOfBaseTypes: _getAvailableListOfBaseTypes(listOfBaseType),
                    textEntryInteraction: interaction.qtiClass === allQtiElements.textEntryInteraction.qtiClass,
                    defaultValue: response.getMappingAttribute('defaultValue')
                })
            );
            widget.$responseForm.find('select[name=template]').val(template);

            if (editMapping) {
                _toggleCorrectWidgets(defineCorrect);
            }

            const lowerBoundValue = response.getMappingAttribute('lowerBound');
            const upperBoundValue = response.getMappingAttribute('upperBound');
            minMaxComponentFactory(widget.$responseForm.find('.response-mapping-attributes > .min-max-panel'), {
                min: {
                    fieldName: 'lowerBound',
                    value: !isNaN(lowerBoundValue) ? parseFloat(lowerBoundValue) : null,
                    helpMessage: __('Minimal  score for this interaction.'),
                    canBeNull: true,
                    lowerThreshold: Number.NEGATIVE_INFINITY,
                },
                max: {
                    fieldName: 'upperBound',
                    value: !isNaN(upperBoundValue) ? parseFloat(upperBoundValue) : null,
                    helpMessage: __('Maximal score for this interaction.'),
                    canBeNull: true,
                    lowerThreshold: 0,
                },
                upperThreshold: Number.MAX_SAFE_INTEGER,
                lowerThreshold: 0,
                syncValues: true,
                allowDecimal: true
            });

            const formChangeCallbacks = {
                identifier: function (res, value) {
                    response.id(value);
                    interaction.attr('responseIdentifier', value);

                    if (perInteractionRP && outcome) {
                        outcome.attr('identifier', `SCORE_${value}`);

                        answerStateHelper.initResponseForm(widget);
                    }
                },
                defaultValue: function (response, value, key) {
                    response.setMappingAttribute(key, value);
                },
                template: function (res, value) {
                    rp.setProcessingType(value === 'CUSTOM' ? 'custom' : 'templateDriven');
                    response.setTemplate(value);
                    answerStateHelper.forward(widget);
                    answerStateHelper.initResponseForm(widget);
                },
                listOfBaseType: function (res, value) {
                    response.attributes.baseType = value;
                    answerStateHelper.initResponseForm(widget);
                },
                defineCorrect: function (res, value) {
                    _toggleCorrectWidgets(value);
                    answerStateHelper.defineCorrect(response, !!value);
                }
            };

            formChangeCallbacks.identifier = _.debounce(formChangeCallbacks.identifier, 500);

            _.assign(
                formChangeCallbacks,
                formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound', {
                    attrMethodNames: {
                        set: 'setMappingAttribute',
                        remove: 'removeMappingAttribute',
                    },
                    floatVal: true,
                    allowNull: true
                })
            );

            formElement.setChangeCallbacks(widget.$responseForm, response, formChangeCallbacks, {
                saveInvalid: true,
                validateOnInit: true
            });

            modalFeedbackRule.initFeedbacksPanel($('.feedbackRule-panel', widget.$responseForm), response);

            widget.$responseForm.trigger('initResponseForm');

            formElement.initWidget(widget.$responseForm);
        },

        /**
         * Check if any correct response is defined
         * @param {Object} widget
         * @returns {Boolean}
         */
        isCorrectDefined: function isCorrectDefined(widget) {
            const response = widget.element.getResponseDeclaration();
            return !!_.size(response.getCorrect());
        },

        /**
         * Create the outcome score if rp required
         * @param {Object} widget
         * @returns {void}
         */
        createOutcomeScore: function createOutcomeScore(widget) {
            const interaction = widget.element;
            const item = interaction.getRootElement();
            const outcomeScore = item.getOutcomeDeclaration('SCORE');
            const rp = item.responseProcessing;
            const rpXml = xmlRenderer.render(rp);

            if (rpXml && !outcomeScore) {
                item.createOutcomeDeclaration({
                    cardinality: 'single',
                    baseType: 'float'
                }).buildIdentifier('SCORE', false);
            }
        }
    };

    return answerStateHelper;
});
