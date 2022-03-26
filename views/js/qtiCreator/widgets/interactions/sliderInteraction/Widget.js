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

    SliderInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);

        // Disable slider until response edition.
        this.$container.find('.qti-slider').attr('disabled', 'disabled');

        // rerender Slider after dir is changed, because support of rtl/ltr is done by js code, not css
        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-dir-changed', () => {
            const interaction = this.element;
            interaction
                .getContainer()
                .find('.qti-slider,.qti-slider-values,.qti-slider-cur-value,.qti-slider-value')
                .remove();
            SliderInteraction.render(interaction);
        });
    };

    return SliderInteractionWidget;
});
