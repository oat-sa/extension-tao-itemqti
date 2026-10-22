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

import 'ui/waitForMedia';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/img';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import { getIsWritingModeVerticalRl } from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';
import { isSafari } from 'taoQtiItem/qtiCommonRenderer/helpers/userAgent';

export default {
    qtiClass: 'img',
    template: tpl,
    getContainer: containerHelper.get,
    render: function render(img, data) {
        const $img = containerHelper.get(img);
        const isVerticalWriting = getIsWritingModeVerticalRl($img);

        if (isVerticalWriting) {
            if ($img.attr('width') && $img.attr('width').endsWith('%') && !$img.attr('height')) {
                $img.attr('height', img.attr('width'));
                $img.removeAttr('width');
            }
        }

        /** Safari + vertical writing mode or mixed wirting modes:
         *   image isn't always painted after loading; so change opacity to force browser to repaint the whole scroll container area.
         *   (browser has trouble with understanding which area to repaint, in scroll containers with different writing modes)
         */
        if (isSafari()) {
            const $closest = $img.closest("[data-scrolling='true'], .writing-mode-vertical-rl");
            if ($closest.length && !$closest.data('wait-for-img')) {
                $closest.waitForMedia(() => {
                    setTimeout(() => {
                        if (!$closest.get(0).isConnected) {
                            return;
                        }
                        $closest.removeData('wait-for-img');
                        const opacityStyle = ';opacity:0.98';
                        let style = $closest.attr('style') || '';
                        $closest.attr('style', `${style}${opacityStyle}`);

                        setTimeout(() => {
                            if (!$closest.get(0).isConnected) {
                                return;
                            }
                            style = ($closest.attr('style') || '').replace(opacityStyle, '');
                            $closest.attr('style', style);
                        }, 200);
                    }, 0);
                });
            }
            $closest.data('wait-for-img', true);
        }
    }
};
