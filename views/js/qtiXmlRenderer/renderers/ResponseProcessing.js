define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responseProcessing',
    'taoQtiItem/qtiXmlRenderer/helper/responseProcessingTpl'
], function(_, tpl, responseProcessingTpl){
    'use strict';

    var _renderFeedbackRules = function _renderFeedbackRules(renderer, response){
        var ret = [];
        _.forEach(response.getFeedbackRules(), function(rule){
            ret.push(rule.render(renderer));
        });
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
                    if(interactions.length === 1 && !data.notAllowTemplate){
                        response = interactions[0].getResponseDeclaration();
                        if(_.size(response.getFeedbackRules()) === 0 && response.id() === 'RESPONSE'){
                            if(response.template !== 'no_response_processing'){
                                //the exact condition to serialize the rp as a standard template is met
                                defaultData.template = response.template;
                            }
                            break;
                        }
                    }

                    defaultData.responseRules = [];
                    _.forEach(interactions, function(interaction){
                        const response = interaction.getResponseDeclaration();
                        const responseRule = responseProcessingTpl.renderInteractionRp(response, 'SCORE');

                        if(_.isString(responseRule) && responseRule.trim()){
                            defaultData.responseRules.push(responseRule);
                        }
                    });

                    defaultData.feedbackRules = [];
                    _.forEach(interactions, function(interaction){
                        defaultData.feedbackRules = _.union(defaultData.feedbackRules, _renderFeedbackRules(self, interaction.getResponseDeclaration()));
                    });

                    if(defaultData.responseRules.length || defaultData.feedbackRules.length){
                        defaultData.templateDriven = true;
                    }

                    break;
            }

            return _.merge(data || {}, defaultData);
        }
    };
});
