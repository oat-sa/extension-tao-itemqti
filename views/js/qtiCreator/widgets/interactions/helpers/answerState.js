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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule'
], function (
    $,
    _,
    __,
    responseHelper,
    formElement,
    minMaxComponentFactory,
    responseFormTpl,
    modalFeedbackRule
) {
    'use strict';

    var _saveCallbacks = {
        mappingAttr : function mappingAttr(response, value, key){
            if(value === ''){
                response.removeMappingAttribute(key);
            }else{
                response.setMappingAttribute(key, value);
            }
        }
    };

    /**
     * Get the list of all available response processing templates available in the plateform
     * @returns {Object}
     */
    var getAvailableTemplates = function getAvailableTemplates(){
        return {
            'CUSTOM' : __('custom'),
            'MATCH_CORRECT' : __('match correct'),
            'MAP_RESPONSE' : __('map response'),
            'MAP_RESPONSE_POINT' : __('map response'),
            'NONE' : __('none')
        };
    };

    /**
     * Get available rp templates according to interaction type and response processing type
     *
     * @param {Object} interaction - standard interaction object model
     * @param {Array} [filteredTemplates] - shorted listed of templates the interaction can use
     * @returns {Object} templates
     */
    var _getAvailableRpTemplates = function _getAvailableRpTemplates(interaction, filteredTemplates){

        var rp = interaction.getRootElement().responseProcessing;
        var allTemplates = getAvailableTemplates();
        var templates = {};
        if(!_.isEmpty(filteredTemplates)){
            _.forEach(filteredTemplates, function(templateName){
                if(allTemplates[templateName]){
                    templates[templateName] = allTemplates[templateName];
                }
            });
        }else{
            templates = allTemplates;
        }

        switch(interaction.qtiClass){
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

        if(rp.processingType === 'templateDriven'){
            delete templates.CUSTOM;
        }else{
            //consider as custom
        }

        return templates;
    };

    var answerStateHelper = {
        /**
         * forward to one of the available sub-state of the answer, according to the response processing template
         * @param {Object} widget
         */
        forward : function forward(widget){

            var response = widget.element.getResponseDeclaration();
            if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

                widget.changeState('correct');

            }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
                responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

                widget.changeState('map');
            }else if(responseHelper.isUsingTemplate(response, 'NONE')){

                widget.changeState('norp');
            }else{

                widget.changeState('custom');
            }
        },

        /**
         * Allow getting and setting the possibility to define the correct response in the map response mode
         * @param {Object} response - standard response object
         * @param {boolean} [newDefineCorrectActive] - set the possibility or not to define the correct response
         * @returns {boolean}
         */
        defineCorrect : function defineCorrect(response, newDefineCorrectActive){

            var defineCorrectActive = false,
                template = responseHelper.getTemplateNameFromUri(response.template),
                corrects = response.getCorrect();

            if(_.isUndefined(newDefineCorrectActive)){
                //get:

                if(template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT'){

                    if(!_.isUndefined(response.data('defineCorrect'))){
                        defineCorrectActive = !!response.data('defineCorrect');
                    }else{
                        //infer it :
                        defineCorrectActive = (corrects && _.size(corrects));
                        response.data('defineCorrect', defineCorrectActive);//set it
                    }

                }else if(template === 'MATCH_CORRECT'){
                    defineCorrectActive = true;
                }

            }else{
                //set:
                if(!newDefineCorrectActive){
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
        initResponseForm : function initResponseForm(widget, options){

            var interaction = widget.element,
                item = interaction.getRootElement(),
                rp = item.responseProcessing,
                response = interaction.getResponseDeclaration(),
                template = responseHelper.getTemplateNameFromUri(response.template),
                editMapping = (_.indexOf(['MAP_RESPONSE', 'MAP_RESPONSE_POINT'], template) >= 0),
                defineCorrect = answerStateHelper.defineCorrect(response);

            var _toggleCorrectWidgets = function(show){

                var $correctWidgets = widget.$container.find('[data-edit=correct]');

                if(show){
                    $correctWidgets.show();
                }else{
                    $correctWidgets.hide();
                }
            };

            options = _.defaults(options || {}, {
                rpTemplates : []
            });

            if(!template || rp.processingType === 'custom'){
                template = 'CUSTOM';
            }

            widget.$responseForm.html(responseFormTpl({
                identifier : response.id(),
                serial : response.getSerial(),
                defineCorrect : defineCorrect,
                editMapping : editMapping,
                editFeedbacks : (template !== 'CUSTOM'),
                mappingDisabled: _.isEmpty(response.mapEntries),
                template : template,
                templates : _getAvailableRpTemplates(interaction, options.rpTemplates),
                defaultValue : response.getMappingAttribute('defaultValue')
            }));
            widget.$responseForm.find('select[name=template]').val(template);

            if(editMapping){
                _toggleCorrectWidgets(defineCorrect);
            }

            minMaxComponentFactory(widget.$responseForm.find('.response-mapping-attributes > .min-max-panel'), {
                min: {
                    fieldName: 'lowerBound',
                    value : _.parseInt(response.getMappingAttribute('lowerBound')) || 0,
                    helpMessage: __("Minimal  score for this interaction.")
                },
                max: {
                    fieldName: 'upperBound',
                    value : _.parseInt(response.getMappingAttribute('upperBound')) || 0,
                    helpMessage: __("Maximal score for this interaction.")
                },
                lowerThreshold: 0, // the same as unchecked
                upperThreshold: Number.MAX_SAFE_INTEGER,
                syncValues: true
            });

            var formChangeCallbacks = {
                identifier : function(res, value){
                    response.id(value);
                    interaction.attr('responseIdentifier', value);
                },
                defaultValue : _saveCallbacks.mappingAttr,
                template : function(res, value){

                    rp.setProcessingType('templateDriven');
                    response.setTemplate(value);
                    answerStateHelper.forward(widget);
                    answerStateHelper.initResponseForm(widget);
                },
                defineCorrect : function(res, value){

                    _toggleCorrectWidgets(value);
                    answerStateHelper.defineCorrect(response, !!value);
                }
            };

            _.assign(formChangeCallbacks,
                formElement.getMinMaxAttributeCallbacks(
                    response,
                    'lowerBound',
                    'upperBound',
                    {
                        attrMethodNames: {
                            set: 'setMappingAttribute',
                            remove: 'removeMappingAttribute'
                        }
                    })
            );

            formElement.setChangeCallbacks(widget.$responseForm, response, formChangeCallbacks);

            modalFeedbackRule.initFeedbacksPanel($('.feedbackRule-panel', widget.$responseForm), response);

            widget.$responseForm.trigger('initResponseForm');

            formElement.initWidget(widget.$responseForm);
        },

        /**
         * Check if any correct response is defined
         * @param {Object} widget
         * @returns {Boolean}
         */
        isCorrectDefined : function isCorrectDefined(widget){
            var response = widget.element.getResponseDeclaration();
            return !!_.size(response.getCorrect());
        }
    };

    return answerStateHelper;
});
