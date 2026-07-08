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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/textEntryInteraction',
    'taoQtiItem/qtiXmlRenderer/helper/umfiTextEntryXmlAttributes'
], function (_, tpl, umfiTextEntryXmlAttributes) {
    'use strict';

    return {
        qtiClass: 'textEntryInteraction',
        template: tpl,
        getData: function getData(textEntryInteraction, data) {
            const resultData = _.merge({}, data || {});
            const prepared = umfiTextEntryXmlAttributes.prepareTextEntryRenderData(
                _.assign({}, textEntryInteraction.getAttributes(), resultData.attributes)
            );

            delete resultData.attributes;
            resultData.attributesMarkup = prepared.attributesMarkup;

            return resultData;
        }
    };
});
