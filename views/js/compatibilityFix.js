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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * fallback for Firefox\Safari@MacOS unsupported feature
 * @see issue https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
 *
 * @author Mikhail Kamarouski, <kamarouski@1pt.com>
 */
define(['jquery'], function ($) {
    'use strict';

    var fixManager = {
        exec: function () {

            if (navigator.userAgent.match(/mac os/i) && !navigator.userAgent.match(/chrom/i)) {
                var selector = 'button';
                var focusClass = 'focus';
                var lastButton = null;

                $(document).on('mousedown', function (e) {
                    if (e.target != lastButton) {
                        $(lastButton).removeClass(focusClass);
                    }
                });

                $(selector)
                    .on('mousedown', function (e) {

                        lastButton = e.target;
                        $('.' + focusClass).removeClass(focusClass);
                        $(lastButton).addClass(focusClass);

                    }).on('focus', function (e) {
                        $(e.target).removeClass(focusClass);
                    })
            }
        }
    };

    return fixManager;
});
