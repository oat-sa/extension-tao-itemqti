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
    'taoQtiItem/qtiItem/helper/util',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Tooltip'
], function(_, util, editable, PrintedVariable){
    "use strict";

    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        isEmpty: function isEmpty() {
            return !this.body() || !this.bdy;
        },
        afterCreate : function(){
            var tooltipContentId = util.buildSerial(this.qtiClass + '-');
            this.attr('aria-describedby', tooltipContentId);
        },
        // As far as the Qti Creator is concerned, an empty tooltip is a tooltip containing a non-breaking space.
        // We make sure that we never store an empty string as the body, so we remain friends with CK...
        body: function(newBody) {
            var body;
            if (newBody === '') {
                newBody = '&nbsp;';
            }

            body = this._super(newBody);

            return (body === '&nbsp;') ? '' : body;
        }
    });
    return PrintedVariable.extend(methods);
});