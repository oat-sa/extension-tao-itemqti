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

            const schemaLocations = item.getSchemaLocations();
            for (let uri in schemaLocations) {
                if (schemaLocations.hasOwnProperty(uri)) {
                    defaultData.schemaLocations += `${uri} ${schemaLocations[uri]} `;
                }
            }
            defaultData.schemaLocations = defaultData.schemaLocations.trim();

            item.responses.forEach(response => {
                defaultData.responses.push(response.render(this));
            });

            item.outcomes.forEach(outcome => {
                if (!defaultData.responseProcessing) {
                    if (outcome.id() === 'SCORE' && !(outcome.attributes && outcome.attributes.externalScored)) {
                        return;
                    }
                }
                defaultData.outcomes.push(outcome.render(this));
            });

            item.stylesheets.forEach(stylesheet => {
                defaultData.stylesheets.push(stylesheet.render(this));
            });

            item.modalFeedbacks.forEach(feedback => {
                defaultData.feedbacks.push(feedback.render(this));
            });

            data = Object.assign({}, data || {}, defaultData);
            delete data.attributes.class;
            delete data.attributes.dir;

            for (let key in data.attributes) {
                if (data.attributes.hasOwnProperty(key)) {
                    let val = data.attributes[key];
                    data.attributes[key] = (typeof val === 'string') ? _.escape(val) : val;
                }
            }

            return data;
        }
    };
});
