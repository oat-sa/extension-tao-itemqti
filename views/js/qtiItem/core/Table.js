/**
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/mixin/ContainerTable'
], function(_, Element, Container){
    'use strict';

    var Table = Element.extend({
        qtiClass : 'table'
    });

    Container.augment(Table);

    Table = Table.extend({
        // on table creation, we might get a body wrapped in a table element, that we need to get rid of
        body: function(newBody) {
            if (_.isString(newBody)) {
                newBody = newBody
                    .replace('<table>', '')
                    .replace('</table>', '');
            }
            return this._super(newBody);
        }
    });

    return Table;
});
