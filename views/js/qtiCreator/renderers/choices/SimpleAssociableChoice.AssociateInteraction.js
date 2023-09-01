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
    'services/features',
    'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/Widget'
], function(_, features, SimpleAssociableChoice, SimpleChoiceWidget){
    'use strict';

    var CreatorSimpleChoice = _.clone(SimpleAssociableChoice);

    CreatorSimpleChoice.render = function(choice, options){

        options = options || {};
        options.shuffleIsVisible = features.isVisible('taoQtiItem/creator/interaction/associate/property/shuffle');

        SimpleChoiceWidget.build(
            choice,
            SimpleAssociableChoice.getContainer(choice),
            this.getOption('choiceOptionForm'),
            options
        );
    };

    return CreatorSimpleChoice;
});
