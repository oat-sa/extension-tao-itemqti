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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA;
 *
 */

define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/item'], function (_, tpl) {
    'use strict';

    return {
        qtiClass: 'assessmentItem',
        template: tpl,
        getData: function (item, data) {
            const defaultData = {
                class: data.attributes.class || '',
                dir: item.bdy.attributes.dir || '',
                responses: [],
                outcomes: [],
                stylesheets: [],
                feedbacks: [],
                namespaces: item.getNamespaces(),
                schemaLocations: '',
                xsi: 'xsi:', //the standard namespace prefix for xml schema
                empty: item.isEmpty(),
                responseProcessing: item.responseProcessing ? item.responseProcessing.render(this) : '',
                apipAccessibility: item.getApipAccessibility() || ''
            };

            _.forIn(item.getSchemaLocations(), function (url, uri) {
                defaultData.schemaLocations += `${uri} ${url} `;
            });
            defaultData.schemaLocations = defaultData.schemaLocations.trim();

            _.forEach(item.responses, response => {
                defaultData.responses.push(response.render(this));
            });
            _.forEach(item.outcomes, outcome => {
                defaultData.outcomes.push(outcome.render(this));
            });
            _.forEach(item.stylesheets, stylesheet => {
                defaultData.stylesheets.push(stylesheet.render(this));
            });
            _.forEach(item.modalFeedbacks, feedback => {
                defaultData.feedbacks.push(feedback.render(this));
            });

            data = _.merge({}, data || {}, defaultData);
            delete data.attributes.class;
            delete data.attributes.dir;

            data.attributes = _.mapValues(data.attributes, function (val) {
                return _.isString(val) ? _.escape(val) : val;
            });

            return data;
        }
    };
});
