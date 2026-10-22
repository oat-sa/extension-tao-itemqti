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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/choices/inlineChoice';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';

const rubyTags = /\{(ruby|rt|rb|rp)\}|\{\/(ruby|rt|rb|rp)\}/g;

export default {
    qtiClass: 'inlineChoice',
    getContainer: containerHelper.get,
    getData(choice, data) {
        if (data && typeof data.body === 'string') {
            data.body = data.body.replace(rubyTags, (match, open, close) =>
                open ? `<${open}>` : `</${close}>`
            );
        }
        return data;
    },
    template: tpl
};
