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
    'taoQtiItem/qtiCommonRenderer/renderers/Tooltip',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/tooltip'
], function(_, Renderer, Widget, tpl){
    'use strict';

    var CreatorTooltip = _.clone(Renderer);

    CreatorTooltip.template = tpl;

    CreatorTooltip.render = function(tooltip, options){
        Widget.build(
            tooltip,
            Renderer.getContainer(tooltip),
            this.getOption('bodyElementOptionForm'),
            options || {}
        );
    };

    return CreatorTooltip;
});
