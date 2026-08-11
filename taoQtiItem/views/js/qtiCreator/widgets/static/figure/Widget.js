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
 * Copyright (c) 2022-2023 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'context',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/figure/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'ui/mediaEditor/plugins/mediaAlignment/helper'
], function ($, _, context, Widget, states, helper, toolbarTpl, inlineHelper, alignmentHelper) {
    'use strict';

    const FigureWidget = Widget.clone();
    const DISABLE_FIGURE_WIDGET = context.featureFlags && context.featureFlags.FEATURE_FLAG_DISABLE_FIGURE_WIDGET;

    FigureWidget.initCreator = function initCreator(options) {
        const figure = this.element;
        const img = _.find(figure.getBody().elements, elem => elem.is('img'));

        this.registerStates(states);

        Widget.initCreator.call(this);

        inlineHelper.togglePlaceholder(this);
        // Resets classes for dom elements: figure and wrapper on initial load and in sleep / inactive mode
        alignmentHelper.initAlignment(this);

        //check file exists:
        inlineHelper.checkFileExists(this, img, 'src', options.baseUrl);
        $('#item-editor-scope').on(`filedelete.resourcemgr.${this.element.serial}`, (e, src) => {
            if (this.getAssetManager().resolve(img.attr('src')) === this.getAssetManager().resolve(src)) {
                img.attr('src', '');
                inlineHelper.togglePlaceholder(this);
            }
        });
    };

    FigureWidget.destroy = function destroy() {
        $('#item-editor-scope').off(`.${this.element.serial}`);
    };

    FigureWidget.getRequiredOptions = function () {
        return ['baseUrl', 'uri', 'lang', 'mediaManager', 'assetManager'];
    };

    FigureWidget.buildContainer = function buildContainer() {
        if (DISABLE_FIGURE_WIDGET || this.element.attr('showFigure')) {
            // If it is aligned to left or right, it will have FigCaption and will need Figure tag
            helper.buildBlockContainer(this);
        } else {
            // On inline aligment, it must be an Image
            helper.buildInlineContainer(this);
        }
        const img = _.find(this.element.getBody().elements, elem => elem.is('img'));
        const $img = this.$original.find('img');
        if ($img.length) {
            // move width from image to figure
            this.$container.css({ width: img.attr('width') });
            $img.attr('width', '100%');
            $img.removeAttr('style');
        }

        this.$container.attr('contenteditable', false); //case: textReaderInteraction PCI

        return this;
    };

    FigureWidget.createToolbar = function createToolbar() {
        helper.createToolbar(this, toolbarTpl);
        return this;
    };

    return FigureWidget;
});
