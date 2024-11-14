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
 * Copyright (c) 2014-2023 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define([
    'lodash',
    'context',
    'taoQtiItem/qtiCommonRenderer/renderers/Img',
    'taoQtiItem/qtiCreator/widgets/static/img/Widget',
    'taoQtiItem/qtiCreator/widgets/static/figure/Widget',
    'taoQtiItem/qtiCreator/model/Figure',
    'taoQtiItem/qtiCreator/helper/findParentElement',
    'taoQtiItem/qtiCreator/helper/elementSupport',
], function (_, context, Renderer, Widget, FigureWidget, FigureModel, findParentElement, elementSupportHelper) {
    'use strict';

    const CreatorImg = _.clone(Renderer);

    const DISABLE_FIGURE_WIDGET = context.featureFlags && context.featureFlags.FEATURE_FLAG_DISABLE_FIGURE_WIDGET;

    CreatorImg.render = function (img, options) {
        const $container = Renderer.getContainer(img);
        if (
            $container.parent('figure').length ||
            (!DISABLE_FIGURE_WIDGET && $container.parent('span').length && $container.parent('span').data('figure'))
        ) {
            // don't create widget if has figure parent
            if (
                !DISABLE_FIGURE_WIDGET &&
                !$container.parent('figure').length &&
                $container.siblings('figcaption').length
            ) {
                $container.siblings('figcaption').remove();
            }

            return CreatorImg;
        }

        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        options.assetManager = this.getAssetManager();
        options.state = img.metaData.widget && img.metaData.widget.getCurrentState().name;

        if (
            !DISABLE_FIGURE_WIDGET &&
            elementSupportHelper.isFigureSupportedInParent($container)
        ) {
            const parent = findParentElement(img.rootElement, img.serial);
            parent.removeElement(img);
            const figure = new FigureModel();
            parent.setElement(figure);
            const figureRenderer = parent.getRenderer();
            if (figureRenderer) {
                figure.setRenderer(figureRenderer);
                figureRenderer.load(() => {
                    $container.trigger('graphicInteraction.ready');
                }, ['figure']);
            }
            figure.setElement(img);
            const $wrap = $container.wrap(`<span data-serial="${figure.serial}">`).parent();
            FigureWidget.build(figure, $wrap, this.getOption('bodyElementOptionForm'), options);
        } else {
            Widget.build(img, Renderer.getContainer(img), this.getOption('bodyElementOptionForm'), options);
        }
    };

    return CreatorImg;
});
