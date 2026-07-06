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
 * Copyright (c) 2014-2022  (original work) Open Assessment Technologies SA;
 */

define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction'
], function (Widget, states, SliderInteraction) {
    const SliderInteractionWidget = Widget.clone();
    const itemLayoutChangeEvents = 'item-dir-changed item-writing-mode-changed';

    SliderInteractionWidget.rerenderSlider = function rerenderSlider(interaction) {
        interaction = interaction || this.element;

        interaction
            .getContainer()
            .removeClass('qti-slider-horizontal qti-slider-vertical')
            .find('.qti-slider,.qti-slider-values,.qti-slider-cur-value,.qti-slider-value')
            .remove();

        SliderInteraction.render(interaction);
        interaction.getContainer().find('.qti-slider').attr('disabled', 'disabled');
    };

    SliderInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);

        // Disable slider until response edition.
        this.$container.find('.qti-slider').attr('disabled', 'disabled');

        // rerender slider after dir/writing-mode changes because layout support is computed by js
        this._itemBody = this.$container.closest('.qti-itemBody');
        this._onItemDirOrWritingModeChanged = () => {
            this.rerenderSlider(this.element);
        };
        this._itemBody.on(itemLayoutChangeEvents, this._onItemDirOrWritingModeChanged);
    };

    SliderInteractionWidget.destroy = function destroy() {
        if (this._itemBody && this._onItemDirOrWritingModeChanged) {
            this._itemBody.off(itemLayoutChangeEvents, this._onItemDirOrWritingModeChanged);
        }

        this._itemBody = null;
        this._onItemDirOrWritingModeChanged = null;

        Widget.destroy.call(this);
    };

    return SliderInteractionWidget;
});
