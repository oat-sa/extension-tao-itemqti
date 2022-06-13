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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */
define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/Figure',
    'taoQtiItem/qtiCreator/widgets/static/figure/Widget'
], function(_, Figure, FigureWidget){
    'use strict';

    const CreatorFigure = _.clone(Figure);

    CreatorFigure.render = function(figure, options){
        const imageElem = _.find(figure.getBody().elements, elem => elem.is('img'));
        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        options.assetManager = this.getAssetManager();
        options.state = imageElem.metaData.widget && imageElem.metaData.widget.getCurrentState().name;

        FigureWidget.build(
            figure,
            Figure.getContainer(figure),
            this.getOption('bodyElementOptionForm'),
            options
        );
    };

    return CreatorFigure;
});
