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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 *
 */

define(['jquery'], function ($) {
    'use strict';

    return {
        /**
         * Refresh the thumbnail of an existing gap image choice by re-rendering the element,
         * so a replaced image is displayed without saving the item
         * @param {jQuery} $gapImgBox - the <li> of the choice
         * @param {Object} gapImg - the gapImg model element
         * @returns {Boolean} true when the thumbnail has been refreshed
         */
        refreshThumbnail: function refreshThumbnail($gapImgBox, gapImg) {
            const $img = $(gapImg.render()).find('img');
            if (!$gapImgBox || !$gapImgBox.length || !$img.length) {
                return false;
            }
            $gapImgBox.find('img').replaceWith($img);
            return true;
        },

        /**
         * Append the delete toolbar to a choice, only once whatever the number of refreshes
         * @param {jQuery} $gapImgBox - the <li> of the choice
         * @param {jQuery} $toolbar - the toolbar to append
         * @returns {Boolean} true when the toolbar has been appended
         */
        ensureToolbar: function ensureToolbar($gapImgBox, $toolbar) {
            if (!$gapImgBox || !$gapImgBox.length || $gapImgBox.find('.mini-tlb').length) {
                return false;
            }
            $toolbar.appendTo($gapImgBox).show();
            return true;
        },

        /**
         * Run an initialisation callback once the image is loaded, without accumulating handlers
         * when the form is entered several times for the same image
         * @param {jQuery} $img - the image
         * @param {Function} init - the callback
         * @returns {Boolean} true when the callback has been called synchronously
         */
        initWhenLoaded: function initWhenLoaded($img, init) {
            const image = $img && $img.get(0);

            if (!image) {
                return false;
            }
            $img.off('load');
            if (image.complete) {
                init();
                return true;
            }
            $img.one('load', init);
            return false;
        }
    };
});
