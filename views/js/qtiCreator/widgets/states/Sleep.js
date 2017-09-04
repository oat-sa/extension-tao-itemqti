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
define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    'use strict';

    return stateFactory.create('sleep', function(){

        var widget = this.widget,
            $container = this.widget.$container;

        //add listener to display proper hover style
        $container.on('mouseenter.sleep', function(e){
            e.stopPropagation();
            $container.addClass('hover');
            $container.parent().trigger('mouseleave');//note : don't trigger it with namespace otherwise, choice.on(mouseleave.choice) will not be triggered
        }).on('mouseleave.sleep', function(){
            $container.removeClass('hover');
            $container.parent().trigger('mouseenter');//note : same as mouseenter.sleep
        });

        if(!widget.isValid()){
            widget.changeState('invalid');
        }

    }, function(){

        this.widget.$container.removeClass('hover').off('.sleep');

    });
});