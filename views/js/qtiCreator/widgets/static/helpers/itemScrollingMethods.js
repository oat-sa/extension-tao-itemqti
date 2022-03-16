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
 * Copyright (c) 2020-2021 (original work) Open Assessment Technologies SA ;
 */

define(['i18n', 'jquery', 'util/typeCaster'], function (__, $, typeCaster) {
    'use strict';

    const wrapperTextCls = 'custom-text-box';
    const wrapperIncludeCls = 'custom-include-box';
    const wrapperFocusCls = 'key-navigation-focusable';
    const newUIclass = 'tao-overflow-y';
    const options = [
        {
            value: '100',
            name: __('Full height'),
            class: 'tao-full-height'
        },
        {
            value: '75',
            name: __('3/4 of height'),
            class: 'tao-three-quarters-height'
        },
        {
            value: '66.6666',
            name: __('2/3 of height'),
            class: 'tao-two-thirds-height'
        },
        {
            value: '50',
            name: __('Half height'),
            class: 'tao-half-height'
        },
        {
            value: '33.3333',
            name: __('1/3 of height'),
            class: 'tao-third-height'
        },
        {
            value: '25',
            name: __('1/4 of height'),
            class: 'tao-quarter-height'
        }
    ];

    return {
        options: function () {
            return options;
        },
        isScrolling: function ($wrapper) {
            return typeCaster.strToBool($wrapper.length > 0 ? $wrapper.attr('data-scrolling') : 'false');
        },
        selectedHeight: function ($wrapper) {
            return $wrapper.attr('data-scrolling-height');
        },
        initSelect: function ($form, isScroll, height) {
            isScroll ? $form.find('.scrollingSelect').show() : $form.find('.scrollingSelect').hide();
            height && $form.find('.scrollingSelect select').val(height).change();
        },
        wrapContent: function (widget, value, wrapType) {
            const $form = widget.$form;
            let $wrapper =
                wrapType === 'inner'
                    ? widget.$container.children('[data-html-editable]').children(`.${wrapperTextCls}`)
                    : widget.$container.parent(`.${wrapperIncludeCls}`);

            if (!$wrapper.length) {
                $wrapper =
                    wrapType === 'inner'
                        ? widget.$container
                              .children('[data-html-editable]')
                              .wrapInner(`<div class="${wrapperTextCls}" />`)
                              .children()
                        : widget.$container.wrap(`<div class="${wrapperIncludeCls}" />`).parent();
            }

            // add attr for curGen plugin itemScrolling
            $wrapper.attr('data-scrolling', value);

            if (value) {
                $form.find('.scrollingSelect').show()
                // add class for keynavigation
                $wrapper.addClass(wrapperFocusCls)
                // add classes for new UI test Runner
                $wrapper.addClass(`${newUIclass} ${options[0].class}`);
            } else {
                $form.find('.scrollingSelect').hide()
                // remove class for keynavigation
                $wrapper.removeClass(wrapperFocusCls)
                // remove classes for new UI test Runner
                $wrapper.removeClass(newUIclass);
                options.forEach(opt => {
                    $wrapper.removeClass(opt.class);
                });
            }
        },
        setScrollingHeight: function ($wrapper, value) {
            $wrapper.attr('data-scrolling-height', value);
            // remove classes tao-*-height for new UI test Runner
            options.forEach(opt => {
                $wrapper.removeClass(opt.class);
            });
            // add class tao-*-height for new UI test Runner
            const opt = options.find(opt => opt.value === value);
            $wrapper.addClass(opt.class);
        },
        cutScrollClasses: function (classes) {
            let clearClasses = classes.replace(wrapperFocusCls, '').replace(newUIclass, '');
            options.forEach(opt => {
                clearClasses = clearClasses.replace(opt.class, '');
            });
            return clearClasses;
        }
    };
});
