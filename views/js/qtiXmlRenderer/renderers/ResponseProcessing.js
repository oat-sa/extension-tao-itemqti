define([
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responseProcessing',
    'taoQtiItem/qtiXmlRenderer/helper/responseProcessingTpl'
], function(tpl, responseProcessingTpl){
    'use strict';

    var _renderFeedbackRules = function _renderFeedbackRules(renderer, response){
        var ret = [];
        for (let rule of response.getFeedbackRules()) {
            ret.push(rule.render(renderer));
        }
        return ret;
    };

    return {
        qtiClass : 'responseProcessing',
        template : tpl,
        getData : function(responseProcessing, data){
            var defaultData = {},
                self = this,
                interactions, response;

            switch(responseProcessing.processingType){
                case 'custom':
                    defaultData.custom = true;
                    defaultData.xml = responseProcessing.xml;
                    break;
                case 'templateDriven':
                    interactions = responseProcessing.getRootElement().getInteractions();
                    if (interactions.length === 1 && !data.notAllowTemplate) {
                        response = interactions[0].getResponseDeclaration();
                        if (Object.keys(response.getFeedbackRules()).length === 0 && response.id() === 'RESPONSE') {
                            if (response.template !== 'no_response_processing') {
                                //the exact condition to serialize the rp as a standard template is met
                                defaultData.template = response.template;
                            }
                            break;
                        }
                    }

                    defaultData.responseRules = [];
                    for (let interaction of interactions) {
                        const response = interaction.getResponseDeclaration();
                        const responseRule = responseProcessingTpl.renderInteractionRp(response, 'SCORE');

                        if (typeof responseRule === 'string' && responseRule.trim()) {
                            defaultData.responseRules.push(responseRule);
                        }
                    }

                    defaultData.feedbackRules = [];
                    for (let interaction of interactions) {
                        const feedbacks = _renderFeedbackRules(self, interaction.getResponseDeclaration());
                        defaultData.feedbackRules = Array.from(new Set([...defaultData.feedbackRules, ...feedbacks]));
                    }

                    if(defaultData.responseRules.length || defaultData.feedbackRules.length){
                        defaultData.templateDriven = true;
                    }

                    break;
            }

            return Object.assign({}, defaultData, data || {});
        }
    };
});
