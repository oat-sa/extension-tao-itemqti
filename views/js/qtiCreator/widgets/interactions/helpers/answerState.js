define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule'
], function($, _, __, responseHelper, formElement, responseFormTpl, modalFeedbackRule){
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
     * Get available rp templates according to interaction type and response processing type
     *
     * @param {object} interaction
     * @returns {object} templates
     */
    var _getAvailableRpTemplates = function _getAvailableRpTemplates(interaction){

        var templates = {
                'CUSTOM' : __('custom'),
                'MATCH_CORRECT' : __('match correct'),
                'MAP_RESPONSE' : __('map response'),
                'MAP_RESPONSE_POINT' : __('map response'),
                'NONE' : __('none')
            },
            rp = interaction.getRelatedItem().responseProcessing;

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
        //forward to one of the available sub state, according to the response processing template
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
        initResponseForm : function initResponseForm(widget){

            var interaction = widget.element,
                item = interaction.getRelatedItem(),
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
                templates : _getAvailableRpTemplates(interaction),
                defaultValue : response.getMappingAttribute('defaultValue'),
                lowerBound : response.getMappingAttribute('lowerBound'),
                upperBound : response.getMappingAttribute('upperBound')
            }));
            widget.$responseForm.find('select[name=template]').val(template);

            if(editMapping){
                _toggleCorrectWidgets(defineCorrect);
            }

            formElement.setChangeCallbacks(widget.$responseForm, response, {
                identifier : function(res, value){
                    response.id(value);
                    interaction.attr('responseIdentifier', value);
                },
                defaultValue : _saveCallbacks.mappingAttr,
                lowerBound : _saveCallbacks.mappingAttr,
                upperBound : _saveCallbacks.mappingAttr,
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
            });

            modalFeedbackRule.initFeedbacksPanel($('.feedbackRule-panel', widget.$responseForm), response);

            widget.$responseForm.trigger('initResponseForm');

            formElement.initWidget(widget.$responseForm);
        },
        isCorrectDefined : function isCorrectDefined(widget){
            var response = widget.element.getResponseDeclaration();
            return !!_.size(response.getCorrect());
        }
    };

    return answerStateHelper;
});
