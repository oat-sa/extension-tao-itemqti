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
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media'
], function($, Widget, states, helper, toolbarTpl){
    'use strict';

    var TooltipWidget = Widget.clone();

    TooltipWidget.initCreator = function initCreator(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    TooltipWidget.buildContainer = function buildContainer(){

        helper.buildInlineContainer(this);

        return this;
    };

    TooltipWidget.createToolbar = function createToolbar(){

        // helper.createToolbar(this, toolbarTpl);

        return this;
    };

    return TooltipWidget;
});
