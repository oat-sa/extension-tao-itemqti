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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
], function(_, panel, styleEditor, styleSheetToggler, fontSelector, colorSelector, fontSizeChanger, itemResizer){
    'use strict';

    /**
     * Set up the properties panel, including the style editor
     * @param {jQueryElement} $container - the panel container
     */
    return function setUpInteractionPanel($container, widget, config){

        panel.initSidebarAccordion($container);
        panel.initFormVisibilityListener();

        styleEditor.init(widget.element, config);
        styleSheetToggler.init(config);

        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer(widget.element);
    };
});
