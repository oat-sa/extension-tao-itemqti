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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/choices/GapText',
    'taoQtiItem/qtiCreator/widgets/choices/gapText/Widget'
], function(_, GapText, GapTextWidget){
    'use strict';

    var CreatorGapText = _.clone(GapText);

    CreatorGapText.render = function(choice, options){

        GapTextWidget.build(
            choice,
            GapText.getContainer(choice),
            this.getOption('choiceOptionForm'),
            options
        );
    };

    return CreatorGapText;
});
