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
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/mixin/Container'
    /*,
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig'
    */
], function(Element, Container /*, _, rendererConfig*/){
    'use strict';

    var Table = Element.extend({
        qtiClass : 'table'
        /*,
        render : function(){

            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {};

            defaultData.attributes = {
                src : renderer.resolveUrl(this.attr('src'))
            };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        isEmpty : function(){
            return (!this.attr('src'));
        }
        */
    });

    Container.augment(Table);

    return Table;
});
