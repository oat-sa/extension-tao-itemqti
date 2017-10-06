define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responseProcessing',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/match_correct',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response_point'
], function(_, tpl, correctTpl, mapTpl, mapPointTpl){
    'use strict';

    var _renderRpTpl = function _renderRpTpl(rpTpl, data){

        var ret = '';

        switch(rpTpl){
            case 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct':
            case 'MATCH_CORRECT':
                ret = correctTpl(data);
                break;
            case 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response':
            case 'MAP_RESPONSE':
                ret = mapTpl(data);
                break;
            case 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point':
            case 'MAP_RESPONSE_POINT':
                ret = mapPointTpl(data);
                break;
            case 'no_response_processing':
            case 'NONE':
                ret = '';
                break;
            default:
                throw new Error('unknown rp template : ' + rpTpl);
        }

        return ret;
    };

    var _renderInteractionRp = function _renderInteractionRp(interaction){
        var ret = '',
            response = interaction.getResponseDeclaration();
        if(response.template){
            ret = _renderRpTpl(response.template, {
                responseIdentifier : response.id(),
                outcomeIdentifier : 'SCORE'
            });
        }
        return ret;
    };

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
                    if(interactions.length === 1){
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
                        var responseRule = _renderInteractionRp(interaction);
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