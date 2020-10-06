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
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/match_correct',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/responses/map_response_point',
], function (correctTpl, mapTpl, mapPointTpl) {
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

    return {
        renderInteractionRp(response, outcomeIdentifier) {
            let ret;

            if (response.template) {
                ret = renderRpTpl(response.template, {
                    responseIdentifier: response.id(),
                    outcomeIdentifier
                });
            }

            return ret;
        }
    }
});
