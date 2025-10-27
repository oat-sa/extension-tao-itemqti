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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods'
], function (Widget, states, sizeAdapter, itemScrollingMethods) {
    'use strict';

    const writingModeVerticalRlClass = 'writing-mode-vertical-rl';
    const writingModeHorizontalTbClass = 'writing-mode-horizontal-tb';

    var ChoiceInteractionWidget = Widget.clone();

    ChoiceInteractionWidget.initCreator = function () {
        this.registerStates(states);

        Widget.initCreator.call(this);

        if (this.element.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(this);
        }

        this.$original.removeClass(writingModeVerticalRlClass).removeClass(writingModeHorizontalTbClass);

        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-writing-mode-changed', () => {
            this.element.removeClass(writingModeVerticalRlClass);
            this.element.removeClass(writingModeHorizontalTbClass);
            itemScrollingMethods.wrapContent(this, false, 'interaction');
        });
    };

    return ChoiceInteractionWidget;
});
