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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/figure/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'ui/mediaEditor/plugins/mediaAlignment/helper'
], function($, Widget, states, helper, toolbarTpl, inlineHelper, alignmentHelper){
    'use strict';

    var FigureWidget = Widget.clone();

    FigureWidget.initCreator = function initCreator(options){

        var self = this;
        var figure = this.element;

        this.registerStates(states);

        Widget.initCreator.call(this);

        inlineHelper.togglePlaceholder(this);
        // Resets classes for dom elements: figure and wrapper on initial load and in sleep / inactive mode
        alignmentHelper.initAlignment(this);

        //check file exists:
        inlineHelper.checkFileExists(this, 'src', options.baseUrl);
        $('#item-editor-scope').on('filedelete.resourcemgr.' + this.element.serial, function(e, src){
            if (self.getAssetManager().resolve(figure.attr('src')) === self.getAssetManager().resolve(src)) {
                figure.attr('src', '');
                inlineHelper.togglePlaceholder(self);
            }
        });
    };

    FigureWidget.destroy = function destroy(){
        $('#item-editor-scope').off('.' + this.element.serial);
    };

    FigureWidget.getRequiredOptions = function(){
        return ['baseUrl', 'uri', 'lang', 'mediaManager', 'assetManager'];
    };

    FigureWidget.buildContainer = function buildContainer(){

        helper.buildInlineContainer(this);

        this.$container.css({
            width: this.element.attr('width'),
            height: this.element.attr('height')
        });
        if (this.$original[0]) {
            this.$original[0].setAttribute('width', '100%');
            this.$original[0].removeAttribute('height');
        }

        return this;
    };

    FigureWidget.createToolbar = function createToolbar(){

        helper.createToolbar(this, toolbarTpl);

        return this;
    };

    return FigureWidget;
});
