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
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/responsiveMetaChange',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep'
], function ($, stateFactory, responsiveMetaChange, SleepState) {

    'use strict';

    var initSleepState = function initSleepState() {
        const widget = this.widget;
        widget.on('metaChange', data => {
            responsiveMetaChange(data, widget);
        });
    };

    var exitSleepState = function exitSleepState() {
        $('.image-editor.solid, .block-listing.source', this.widget.$container).css('min-width', 0);
    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});
