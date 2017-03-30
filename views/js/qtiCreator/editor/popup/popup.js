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
    'ui/component',
    'ui/component/draggable',
    'ui/component/resizable',
    'ui/component/stackable',
    'tpl!taoQtiItem/qtiCreator/editor/popup/tpl/popup'
], function ($, componentFactory, makeDraggable, makeResizable, makeStackable, popupTpl) {
    'use strict';

    return function popupFactory() {
        var popup = componentFactory();

        makeDraggable(popup);
        makeResizable(popup);
        makeStackable(popup, { stackingScope: 'qti-creator' });

        popup
            .setTemplate(popupTpl)
            .on('render', function() {
                var self = this,
                    $component = this.getElement(),
                    $closer = $component.find('.qti-creator-popup-title-btns .icon-close');

                $closer.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    self.hide();
                });

            });

        return popup;
    };

});