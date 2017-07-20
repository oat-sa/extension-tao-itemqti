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
    'taoQtiItem/qtiCommonRenderer/renderers/Table',
    'taoQtiItem/qtiCreator/widgets/static/table/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/table'
], function(_, Renderer, Widget, tpl){
    'use strict';

    var CreatorTable = _.clone(Renderer);

    CreatorTable.template = tpl;

    CreatorTable.render = function(table, options){

        /*
        //initial rendering:
        Renderer.render(object);

         options.baseUrl = this.getOption('baseUrl');
         options.uri = this.getOption('uri');
         options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        options.assetManager = this.getAssetManager();
        */
        options = options || {};

//        debugger;

        Widget.build(
            table,
            Renderer.getContainer(table),
            this.getOption('bodyElementOptionForm'), // todo: wtf ?
            options
        );
    };

    return CreatorTable;
});
