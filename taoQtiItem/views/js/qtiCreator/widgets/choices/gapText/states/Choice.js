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
 * Copyright (c) 2014-2017 Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Choice',
    'taoQtiItem/qtiItem/core/Element'
], function($, _, CKEditor, stateFactory, Choice, SimpleAssociableChoice, Element){
    'use strict';

    var GapTextStateChoice = stateFactory.extend(Choice, function(){

        var _widget = this.widget;

        //listener to other siblings choice mode
        _widget.beforeStateInit(function(e, element, state){

            if(Element.isA(element, 'choice') && _widget.interaction.getBody().getElement(element.serial)){

                if(state.name === 'choice' && element.serial !== _widget.serial){
                    _widget.changeState('question');
                }

            }

        }, 'otherActive');

    }, function(){
        this.widget.offEvents('otherActive');
    });

    GapTextStateChoice.prototype.initForm = function(){
        SimpleAssociableChoice.prototype.initForm.call(this);
    };

    return GapTextStateChoice;
});
