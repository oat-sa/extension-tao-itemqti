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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2020-2026 (original work) Open Assessment Technologies SA ;
 */

define(['i18n', 'jquery', 'util/typeCaster'], function (__, $, typeCaster) {
    'use strict';

    /**
     * `jQuery` or `tao-item-runner-qti-fe\src\qtiItem\core\Element.js`
     * @typedef {Object} IWrapper
     * @property {Function} addClass
     * @property {Function} removeClass
     * @property {Function} attr
     * @property {Function} removeAttr
     * @property {Number|void 0} length - only if jQuery
     */

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
    const optionsVerticalDirectionWriting = [
        {
            value: '100',
            name: __('Full width'),
            class: 'tao-full-height'
        },
        {
            value: '75',
            name: __('3/4 of width'),
            class: 'tao-three-quarters-height'
        },
        {
            value: '66.6666',
            name: __('2/3 of width'),
            class: 'tao-two-thirds-height'
        },
        {
            value: '50',
            name: __('Half width'),
            class: 'tao-half-height'
        },
        {
            value: '33.3333',
            name: __('1/3 of width'),
            class: 'tao-third-height'
        },
        {
            value: '25',
            name: __('1/4 of width'),
            class: 'tao-quarter-height'
        }
    ];

    const findOptionByVal = optionVal => options.find(opt => opt.value === optionVal);

    const self = {
        options: () => options,
        optionsVertical: () => optionsVerticalDirectionWriting,

        /**
         * @param {IWrapper} $wrapper
         * @returns {boolean}
         */
        isScrolling: function ($wrapper) {
            return typeCaster.strToBool($wrapper.length === 0 ? 'false' : $wrapper.attr('data-scrolling'));
        },

        setIsScrolling: function ($wrapper, isScrolling) {
            if (isScrolling) {
                $wrapper.attr('data-scrolling', isScrolling);
            } else {
                $wrapper.removeAttr('data-scrolling');
            }
        },

        /**
         * @param {IWrapper} $wrapper
         * @returns {string}
         */
        selectedHeight: function ($wrapper) {
            return $wrapper.attr('data-scrolling-height');
        },
        initSelect: function ($form, isScroll) {
            $form.attr('data-is-scrolling', isScroll);
            self.toggleScrollingSelect($form, isScroll);
        },

        toggleScrollingSelect: ($form, isScroll = undefined) => {
            const isScrolling = isScroll !== undefined ? isScroll : self.isScrolling($form);
            if (!isScrolling) {
                $form.find('.scrollingSelect').hide();
            } else {
                $form.find('.scrollingSelect').show();
                $form.find('.dw-depended').hide();

                const isVerticalItem = $('input[name="writingModeItem"]:checked').val() === 'vertical';
                const isVerticalInteraction = $('input[name="writingMode"]:checked').val() === 'vertical';
                const selector = isVerticalItem === isVerticalInteraction ? '.dw-width' : '.dw-height';

                $form.find(selector).show();
            }
        },

        wrapContent: function (widget, isScrolling, wrapType) {
            const $form = widget.$form;

            /**
             * @type {IWrapper}
             */
            let $wrapper;
            if (wrapType === 'inner') {
                $wrapper = widget.$container.children('[data-html-editable]').children(`.${wrapperTextCls}`);
            } else if (wrapType === 'interaction') {
                $wrapper = widget.element;
            } else {
                $wrapper = widget.$container.parent(`.${wrapperIncludeCls}`);
            }

            if ($wrapper.length === 0) {
                if (wrapType === 'inner') {
                    $wrapper = widget.$container
                        .children('[data-html-editable]')
                        .wrapInner(`<div class="${wrapperTextCls}" />`)
                        .children();
                } else if (wrapType !== 'interaction') {
                    $wrapper = widget.$container.wrap(`<div class="${wrapperIncludeCls}" />`).parent();
                }
            }

            if (isScrolling) {
                // add class for keynavigation
                $wrapper.addClass(wrapperFocusCls);
                // add classes for new UI test Runner
                const scrollingHeightVal = $form.find('.scrollingSelect select').val();
                const opt = scrollingHeightVal ? findOptionByVal(scrollingHeightVal) : options[0];
                $wrapper.addClass(`${newUIclass} ${opt.class}`);

                // add attr for curGen plugin itemScrolling
                $wrapper.attr('data-scrolling-height', opt.value);
            } else {
                // remove class for keynavigation
                $wrapper.removeClass(wrapperFocusCls);
                // remove classes for new UI test Runner
                $wrapper.removeClass(newUIclass);
                options.forEach(opt => {
                    $wrapper.removeClass(opt.class);
                });
                $wrapper.removeAttr('data-scrolling');
                $wrapper.removeAttr('data-scrolling-height');
            }

            self.setIsScrolling($form, isScrolling);
            self.setIsScrolling($wrapper, isScrolling);
            self.toggleScrollingSelect($form, isScrolling);
        },

        /**
         * @param {IWrapper} $wrapper
         * @param {string} value
         */
        setScrollingHeight: function ($wrapper, value, $form) {
            $wrapper.attr('data-scrolling-height', value);

            // remove classes tao-*-height for new UI test Runner
            options.forEach(opt => {
                $wrapper.removeClass(opt.class);
            });
            // add class tao-*-height for new UI test Runner
            const opt = findOptionByVal(value);
            if (opt) {
                $wrapper.addClass(opt.class);
            }

            const scrollingWidth = $form.find('[name=scrollingWidth]');

            if (scrollingWidth.length > 0 && scrollingWidth.val() !== value) {
                scrollingWidth.val(value);
                scrollingWidth.change();
            }
        },

        setScrollingWeight: function ($wrapper, value, $form) {
            $wrapper.attr('data-scrolling-height', value);

            // remove classes tao-*-height for new UI test Runner
            options.forEach(opt => {
                $wrapper.removeClass(opt.class);
            });
            // add class tao-*-height for new UI test Runner
            const opt = findOptionByVal(value);
            if (opt) {
                $wrapper.addClass(opt.class);
            }

            const scrollingHeight = $form.find('[name=scrollingHeight]');
            if (scrollingHeight.length > 0 && scrollingHeight.val() !== value) {
                scrollingHeight.val(value);
                scrollingHeight.change();
            }
        },

        /**
         * @param {IWrapper} $wrapper
         * @param {string} value
         */
        setIsVertical: function ($form, isVertical) {
            $form.attr('data-is-vertical', isVertical);
        },
        cutScrollClasses: function (classes) {
            let clearClasses = classes.replace(wrapperFocusCls, '').replace(newUIclass, '');
            options.forEach(opt => {
                clearClasses = clearClasses.replace(opt.class, '');
            });
            return clearClasses;
        },
        getScrollClasses: function (scrollingEnabled, scrollingHeight) {
            let classes = '';
            if (scrollingEnabled) {
                classes += ` ${wrapperFocusCls} ${newUIclass}`;
                if (scrollingHeight) {
                    classes += ` ${findOptionByVal(scrollingHeight).class}`;
                }
            }
            return classes;
        },

        getTplVars: ($wrap, defaultValue) => {
            const currValue = self.selectedHeight($wrap) || defaultValue;
            return {
                scrollingHeights: options.map(o => ({
                    value: o.value,
                    name: o.name,
                    selected: o.value === currValue
                })),
                scrollingWidths: optionsVerticalDirectionWriting.map(o => ({
                    value: o.value,
                    name: o.name,
                    selected: o.value === currValue
                }))
            };
        },

        generateChangeCallback: (widget, wrapCallback, $form, scrollingType = 'inner') => {
            return {
                scrolling: function (element, value) {
                    self.wrapContent(widget, value, scrollingType);
                },
                scrollingHeight: (element, value) => {
                    self.setScrollingHeight(wrapCallback(), value, $form);
                },
                scrollingWidth: (element, value) => {
                    self.setScrollingWeight(wrapCallback(), value, $form);
                }
            };
        }
    };

    return self;
});
