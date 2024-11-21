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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Include',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCreator/widgets/static/include/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/include'
], function(_, Renderer, containerHelper, Widget, tpl){
    'use strict';

    var CreatorXInclude = _.clone(Renderer);

    CreatorXInclude.template = tpl;

    CreatorXInclude.getContainer = containerHelper.get;

    CreatorXInclude.render = function(include, options){

        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        options.assetManager = this.getAssetManager();

        let widget = Widget.build(
            include,
            containerHelper.get(include),
            this.getOption('bodyElementOptionForm'),
            options
        );

        if (widget && widget.$container) {
            widget.$container.attr('contenteditable', 'false');
        }
    };

    return CreatorXInclude;
});
