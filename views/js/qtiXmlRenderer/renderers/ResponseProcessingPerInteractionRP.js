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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responseProcessing',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/match_correct',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response_point',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/item_score'
], function (_, tpl, correctTpl, mapTpl, mapPointTpl, itemScoreTpl) {
    'use strict';

    const renderRpTpl = (rpTpl, data) => {
        let ret = '';

        switch (rpTpl) {
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

    const renderInteractionRp = (response) => {
        let ret;

        if (response.template) {
            ret = renderRpTpl(response.template, {
                responseIdentifier: response.id(),
                outcomeIdentifier: `SCORE_${response.id()}`
            });
        }

        return ret;
    };

    const renderFeedbackRules = (renderer, response) => {
        const ret = [];

        _.forEach(response.getFeedbackRules(), (rule) => {
            ret.push(rule.render(renderer));
        });

        return ret;
    };

    return {
        qtiClass: 'responseProcessing',
        template: tpl,
        getData: function (responseProcessing, data) {
            const defaultData = {};

            if (responseProcessing.processingType === 'custom') {
                defaultData.custom = true;
                defaultData.xml = responseProcessing.xml;
            } else {
                const interactions = responseProcessing.getRootElement().getInteractions();
                defaultData.responseRules = [];
                const outcomeIdentifiers = [];

                _.forEach(interactions, (interaction) => {
                    const response = interaction.getResponseDeclaration();
                    const responseRule = renderInteractionRp(response);

                    if (_.isString(responseRule) && responseRule.trim()) {
                        defaultData.responseRules.push(responseRule);

                        outcomeIdentifiers.push(`SCORE_${response.id()}`);
                    }
                });

                defaultData.feedbackRules = [];
                _.forEach(interactions, (interaction) => {
                    defaultData.feedbackRules = _.union(
                        defaultData.feedbackRules,
                        renderFeedbackRules(this, interaction.getResponseDeclaration())
                    );
                });

                if (outcomeIdentifiers.length) {
                    defaultData.responseRules.push(itemScoreTpl({
                        identifier: 'SCORE',
                        outcomeIdentifiers,
                    }));
                }

                if (defaultData.responseRules.length || defaultData.feedbackRules.length) {
                    defaultData.templateDriven = true;
                }
            }

            return _.merge(data || {}, defaultData);
        }
    };
});
