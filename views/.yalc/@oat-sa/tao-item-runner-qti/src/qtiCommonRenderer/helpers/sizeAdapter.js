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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
 *
 */
import $ from 'jquery';
import adaptSize from 'util/adaptSize';
import 'ui/waitForMedia';
import { getIsWritingModeVerticalRl } from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';

const itemSelector = '.add-option, .result-area .target, .choice-area .qti-choice';

function adaptBlockSize($elements, isVertical) {
    return isVertical ? adaptSize.width($elements) : adaptSize.height($elements);
}

function resetBlockSize($elements, isVertical) {
    return isVertical ? $elements.width('auto') : adaptSize.resetHeight($elements);
}

export default {
    /**
     * Resize jQueryElement/widget that have changed their dimensions due to a change of the content
     *
     * @param {jQueryElement|widget} target
     */
    adaptSize(target) {
        let $elements;
        let $container;
        let isVertical;

        switch (true) {
            // widget
            case typeof target.$container !== 'undefined':
                $elements = target.$container.find(itemSelector);
                $container = target.$container;
                isVertical = false;
                break;

            // jquery elements
            default:
                $elements = target;
                $container = $($elements).first().parent();
                isVertical = getIsWritingModeVerticalRl($container);
        }

        $container.waitForMedia(function () {
            // Occasionally in caching scenarios, after waitForMedia(), image.height is reporting its naturalHeight instead of its CSS height
            // The timeout allows adaptSize.height() to work with the true rendered heights of elements, instead of naturalHeights
            setTimeout(() => {
                adaptBlockSize($elements, isVertical);

                // detect any CSS load, and adapt heights again after
                document.addEventListener(
                    'load',
                    e => {
                        if (e.target && e.target.rel === 'stylesheet') {
                            adaptBlockSize($elements, isVertical);
                        }
                    },
                    true
                );
            }, 1);
        });
    },

    /**
     * Reset height of widget to auto
     *
     * @param {widget} target
     */
    resetSize(target) {
        // widget
        const $container = target.$container;
        if ($container && $container.length) {
            const $elements = $container.find(itemSelector);
            const isVertical = false;
            resetBlockSize($elements, isVertical);
        }
    }
};
