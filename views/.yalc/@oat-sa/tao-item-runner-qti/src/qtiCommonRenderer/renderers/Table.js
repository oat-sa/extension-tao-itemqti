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
 * Copyright (c) 2017-2026 (original work) Open Assessment Technologies SA;
 */
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/table';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import resizeObserverHelper from 'ui/resizeObserver';
import { getIsWritingModeVerticalRl } from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';

function render(table) {
    const $table = containerHelper.get(table);

    if (getIsWritingModeVerticalRl($table)) {
        _fixSafariCaption($table);
    }
}

function destroy(table) {
    const $table = containerHelper.get(table);
    _destroySafariCaption($table);
}

/**
 * Safari + `writing-mode: vertical-rl`:
 *  all `position: relative` elements inside table get shifted by the size of caption.
 * So in css, give `block-size: 0` to the caption,
 *  but show its inner content (`overflow: visible`), and shift the whole table by the caption's size.
 * @param {JQuery} $table
 */
function _fixSafariCaption($table) {
    const $caption = $table.find('caption');
    if ($caption.length) {
        $caption.addClass('no-block-size').wrapInner('<span/>');
        const resizeObserverCallback = entry => {
            requestAnimationFrame(() => {
                const captionBlockSize = entry.borderBoxSize[0].blockSize;
                $table.get(0).style.setProperty('--caption-block-size', `${captionBlockSize}px`);
            });
        };
        resizeObserverHelper.observe($table.find('caption > span'), resizeObserverCallback);
        $table.data('resizeObserverCallback', resizeObserverCallback);
    }
}

function _destroySafariCaption($table) {
    const $captionSpan = $table.find('caption.no-block-size > span');
    if ($captionSpan.length) {
        resizeObserverHelper.unobserve($captionSpan, $table.data('resizeObserverCallback'));
    }
}

export default {
    qtiClass: 'table',
    getContainer: containerHelper.get,
    template: tpl,
    render: render,
    destroy: destroy
};
