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
 * Copyright (c) 2015-2023 (original work) Open Assessment Technologies SA;
 *
 */

define([], function () {
    'use strict';

    return function responsiveMetaChange(data, widget) {
        var interaction = widget.element;
        var $container = widget.$container;
        if(data.key === 'responsive'){
            if(data.value === true){
                interaction.addClass('responsive');
            } else {
                interaction.removeClass('responsive');
            }
            if($container.find('.qti-prompt [data-qti-class="figure"]').length) {
                $container.on('graphicInteraction.ready', function (){
                    widget.rebuild();
                });
                return;
            }
            widget.rebuild();
        }
    }
});
