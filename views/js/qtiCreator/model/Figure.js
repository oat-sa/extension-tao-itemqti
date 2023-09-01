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
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Figure',
    'taoQtiItem/qtiCreator/model/Img',
    'taoQtiItem/qtiCreator/model/Figcaption'
], function (_, editable, Figure, Img, Figcaption) {
    'use strict';
    const methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes: function () {
            return {
                showFigure: false
            };
        },
        afterCreate: function () {
            this.getNamespace();
            const img = new Img();
            this.setElement(img);
            if (this.getRenderer()) {
                img.setRenderer(this.getRenderer());
            }
        },
        addCaption: function (text) {
            // check that caption doesn't exist
            let figcaption = _.find(this.getBody().elements, elem => elem.is('figcaption'));
            if (!figcaption) {
                figcaption = new Figcaption();
                figcaption.body(text);
                this.setElement(figcaption);
                const renderer = this.getRenderer();
                if (renderer) {
                    figcaption.setRenderer(renderer);
                    renderer.load(() => {}, ['figcaption']);
                }
            } else {
                figcaption.body(text);
            }
            return figcaption;
        },
        removeCaption: function () {
            const figcaption = _.find(this.getBody().elements, elem => elem.is('figcaption'));
            if (figcaption) {
                this.removeElement(figcaption);
            }
        }
    });
    return Figure.extend(methods);
});
