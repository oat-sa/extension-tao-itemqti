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
    'services/features',
    'taoQtiItem/qtiCommonRenderer/renderers/Tooltip',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/tooltip',
    'tpl!taoQtiItem/qtiCreator/tpl/notooltip'
], function(_, features, Renderer, Widget, tooltipTpl, noTooltipTpl){
    'use strict';

    var CreatorTooltip = _.clone(Renderer);
    const tooltipsVisible = features.isVisible('taoQtiItem/creator/content/plugin/taotooltip');
    if(tooltipsVisible) {
        CreatorTooltip.template = tooltipTpl;
    }else{
        CreatorTooltip.template = noTooltipTpl;
    }

    CreatorTooltip.render = function(tooltip, options){
        if(tooltipsVisible) {
            Widget.build(
                tooltip,
                Renderer.getContainer(tooltip),
                this.getOption('bodyElementOptionForm'),
                options || {}
            );
        }
    };

    return CreatorTooltip;
});
