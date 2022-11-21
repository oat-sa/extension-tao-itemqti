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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/figure'], function (tpl) {
    return {
        qtiClass: 'figure',
        template: tpl,
        getData: function (figure, data) {
            const ns = figure.getNamespace();

            if (ns && ns.name) {
                data.tag = `${ns.name}:figure`;
            }

            if (!figure.attr('showFigure')) {
                data.tag = 'img';
                const cleanImg = data.body.split('<qh5:figcaption >');
                data.body = cleanImg[0];
            }

            return data;
        }
    };
});
