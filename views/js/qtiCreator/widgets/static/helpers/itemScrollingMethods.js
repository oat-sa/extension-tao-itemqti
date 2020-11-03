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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'util/typeCaster',
], function ($, typeCaster) {
    'use strict';

    return {
        options: function () {
            return [{
                value: '100',
                name: 'Full height'
            }, {
                value: '75',
                name: '3/4 of height'
            }, {
                value: '66.6666',
                name: '2/3 of height'
            }, {
                value: '50',
                name: 'Half height'
            }, {
                value: '33.3333',
                name: '1/3 of height'
            }, {
                value: '25',
                name: '1/4 of height'
            }];
        },
        isScrolling: function (wrapper) {
            return typeCaster.strToBool(wrapper.length > 0 ? wrapper.attr('data-scrolling') : 'false')
        },
        selectedHeight: function (wrapper) {
            return wrapper.attr('data-scrolling-height');
        },
        initSelect: function ($form, isScroll, height) {
            isScroll ? $form.find('.scrollingSelect').show() : $form.find('.scrollingSelect').hide();
            height && $form.find('.scrollingSelect select').val(height).change();
        },
        wrapContent: function (widget, value, wrapType) {
            const $form = widget.$form;
            let $wrap = wrapType === 'inner' ? widget.$container
                .find('[data-html-editable]')
                .children('.text-block-wrap.inner') : widget.$container.parent('.text-block-wrap.outer');

            if (!$wrap.length) {
                $wrap = wrapType === 'inner' ? widget.$container
                    .find('[data-html-editable]')
                    .wrapInner('<div class="text-block-wrap inner" />')
                    .children() : widget.$container
                    .wrap('<div class="text-block-wrap outer" />')
                    .parent();
            }

            value ? $form.find('.scrollingSelect').show() : $form.find('.scrollingSelect').hide();

            $wrap.attr('data-scrolling', value);
        },
        setScrollingHeight: function (wrapper, value) {
            wrapper.attr('data-scrolling-height', value);
        }
    };
});
