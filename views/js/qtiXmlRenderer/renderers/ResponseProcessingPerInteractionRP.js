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
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/item_score',
    'taoQtiItem/qtiXmlRenderer/helper/responseProcessingTpl'
], function (_, tpl, itemScoreTpl, responseProcessingTpl) {
    'use strict';

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
                    const outcomeIdentifier = `SCORE_${response.id()}`;
                    const responseRule = responseProcessingTpl.renderInteractionRp(response, outcomeIdentifier);

                    if (_.isString(responseRule) && responseRule.trim()) {
                        defaultData.responseRules.push(responseRule);

                        outcomeIdentifiers.push(outcomeIdentifier);
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
