define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/helper/response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/responseForm',
    'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule'
], function($, _, responseHelper, formElement, responseFormTpl, modalFeedbackRule){
    'use strict';

    var _saveCallbacks = {
        mappingAttr : function(response, value, key){
            if(value === ''){
                response.removeMappingAttribute(key);
            }else{
                response.setMappingAttribute(key, value);
            }
        }
    };

    var answerStateHelper = {
        //forward to one of the available sub state, according to the response processing template
        forward : function(widget){

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
        defineCorrect : function(response, define){

            var defineCorrect = false,
                template = responseHelper.getTemplateNameFromUri(response.template),
                corrects = response.getCorrect();

            if(define === undefined){
                //get:

                if(template === 'MAP_RESPONSE' || template === 'MAP_RESPONSE_POINT'){

                    if(response.data('defineCorrect') !== undefined){
                        defineCorrect = !!response.data('defineCorrect');
                    }else{
                        //infer it :
                        defineCorrect = (corrects && _.size(corrects));
                        response.data('defineCorrect', defineCorrect);//set it
                    }

                }else if(template === 'MATCH_CORRECT'){
                    defineCorrect = true;
                }

            }else{
                //set:
                if(!define){
                    //empty correct response
                    response.correctResponse = [];
                }
                response.data('defineCorrect', define);
            }

            return defineCorrect;
        },
        initResponseForm : function(widget){

            var interaction = widget.element,
                item = interaction.getRelatedItem(),
                rp = item.responseProcessing,
                response = interaction.getResponseDeclaration(),
                template = responseHelper.getTemplateNameFromUri(response.template),
                editMapping = (_.indexOf(['MAP_RESPONSE', 'MAP_RESPONSE_POINT'], template) >= 0),
                defineCorrect = answerStateHelper.defineCorrect(response);

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

            var _toggleCorrectWidgets = function(show){

                var $correctWidgets = widget.$container.find('[data-edit=correct]');

                if(show){
                    $correctWidgets.show();
                }else{
                    $correctWidgets.hide();
                }
            };

            if(editMapping){
                _toggleCorrectWidgets(defineCorrect);
            }

            formElement.setChangeCallbacks(widget.$responseForm, response, {
                identifier : function(response, value){
                    response.id(value);
                    interaction.attr('responseIdentifier', value);
                },
                defaultValue : _saveCallbacks.mappingAttr,
                lowerBound : _saveCallbacks.mappingAttr,
                upperBound : _saveCallbacks.mappingAttr,
                template : function(response, value){

                    rp.setProcessingType('templateDriven');
                    response.setTemplate(value);
                    answerStateHelper.forward(widget);
                    answerStateHelper.initResponseForm(widget);
                },
                defineCorrect : function(response, value){

                    _toggleCorrectWidgets(value);
                    answerStateHelper.defineCorrect(response, !!value);
                }
            });

            modalFeedbackRule.initFeedbacksPanel($('.feedbackRule-panel', widget.$responseForm), response);

            widget.$responseForm.trigger('initResponseForm');

            formElement.initWidget(widget.$responseForm);
        },
        isCorrectDefined : function(widget){
            var response = widget.element.getResponseDeclaration();
            return !!_.size(response.getCorrect());
        }
    };

    /**
     * Get available rp templates accoding to interaction type and response processing type
     *
     * @todo refactor this : check if
     * @param {object} interaction
     * @returns {object} templates
     */
    var _getAvailableRpTemplates = function _getAvailableRpTemplates(interaction){

        var templates = {
            'CUSTOM' : 'custom',
            'MATCH_CORRECT' : 'match correct',
            'MAP_RESPONSE' : 'map response',
            'MAP_RESPONSE_POINT' : 'map response',
            'NONE' : 'none'
        },
        rp = interaction.getRelatedItem().responseProcessing;

        switch(interaction.qtiClass){
            case 'orderInteraction':
            case 'graphicOrderInteraction':
            case 'extendedTextInteraction':
            case 'sliderInteraction':
            case 'uploadInteraction':
                delete templates.MAP_RESPONSE;
                delete templates.MAP_RESPONSE_POINT;
                break;
            case 'selectPointInteraction':
            case 'extendedTextInteraction':
                delete templates.MATCH_CORRECT;
                delete templates.MAP_RESPONSE;
                delete templates.MAP_RESPONSE_POINT;
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

    return answerStateHelper;
});
