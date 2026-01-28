/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.

 *
 * Copyright (c) 2014-2026 (original work) Open Assessment Technologies SA ;

 */

define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
    'services/features',
    'context',
    'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting',
    'taoQtiItem/qtiCreator/widgets/static/helpers/verticalWritingEditing',
    'lodash'
], function (
    stateFactory,
    Active,
    htmlEditor,
    content,
    formElement,
    formTpl,
    itemScrollingMethods,
    features,
    context,
    verticalWriting,
    verticalWritingEditing,
    _
) {
    'use strict';

    const wrapperCls = 'custom-text-box';
    const writingModeVerticalRlClass = verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS;
    const writingModeHorizontalTbClass = verticalWriting.WRITING_MODE_HORIZONTAL_TB_CLASS;
    const writingModeAttr = 'data-writing-mode-class';
    const writingModeInitialScrollingHeight = '75';

    const scrollingAvailable = features.isVisible('taoQtiItem/creator/static/text/scrolling');

    function cleanDefaultTextBlockClasses($wrap) {
        return itemScrollingMethods
            .cutScrollClasses($wrap.attr('class') || '')
            .split(' ')
            .map(cls => cls.trim())
            .filter(cls => ![wrapperCls].includes(cls))
            .join(' ');
    }

    const TextActive = stateFactory.extend(
        Active,
        function () {
            this.buildEditor();
            this.initForm();
        },
        function () {
            this.destroyEditor();
            this.widget.$form.empty();
        }
    );

    TextActive.prototype.buildEditor = function () {
        const widget = this.widget;
        const $editableContainer = widget.$container;
        const container = widget.element;
        const changeCallback = content.getChangeCallback(container);

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {
            var ENABLE_INTERACTION_SOURCE =
                context.featureFlags && context.featureFlags.FEATURE_FLAG_CKEDITOR_INTERACTION_SOURCE;
            htmlEditor.buildEditor($editableContainer, {
                change: function (data) {
                    changeCallback.call(this, data);
                    if (!data) {
                        widget.$form.find('[name="textBlockCssClass"]').val('');
                    }
                },
                blur: function () {
                    widget.changeState('sleep');
                },
                data: {
                    widget: widget,
                    container: container
                },
                interactionsource: ENABLE_INTERACTION_SOURCE
            });
        }
    };

    TextActive.prototype.destroyEditor = function () {
        htmlEditor.destroyEditor(this.widget.$container);
    };

    TextActive.prototype.initForm = function () {
        const widget = this.widget,
            $form = widget.$form,
            $wrap = widget.$container.find(`.${wrapperCls}`),
            isScrolling = itemScrollingMethods.isScrolling($wrap),
            selectedHeight = itemScrollingMethods.selectedHeight($wrap);

        $form.html(
            formTpl(
                _.extend(
                    {
                        textBlockCssClass: cleanDefaultTextBlockClasses($wrap),
                        scrolling: isScrolling,
                        scrollingAvailable,
                        selectedHeight: selectedHeight
                    },
                    itemScrollingMethods.getTplVars()
                )
            )
        );


        formElement.initWidget($form);

        formElement.setChangeCallbacks(
            $form,
            widget.element,
            // add listeners for itemScrolling elements
            _.extend(
                changeCallbacks(widget, $form, $wrap),
                itemScrollingMethods.generateChangeCallback(widget, () => getWrapper(widget), $form)
            )
        );

        itemScrollingMethods.initSelect($form, isScrolling, selectedHeight);

        toggleVerticalWritingModeByLang(widget, $form);
    };

    const changeCallbacks = function (widget, $form, $wrap) {
        return {
            textBlockCssClass: function (element, value) {
                const $wrap = createWrapper(widget);
                const customClasses = cleanDefaultTextBlockClasses($wrap);
                customClasses.split(' ').forEach(cls => {
                    $wrap.removeClass(cls);
                });
                $wrap.addClass(value.trim());
            },
            writingMode(i, mode) {
                let isScrolling = false;
                const $wrap = createWrapper(widget);
                if (mode === 'vertical' && !$form.data('isItemVertical')) {
                    $wrap.attr(writingModeAttr, writingModeVerticalRlClass);
                    isScrolling = true;
                } else if (mode === 'horizontal' && $form.data('isItemVertical')) {
                    $wrap.attr(writingModeAttr, writingModeHorizontalTbClass);
                    isScrolling = true;
                } else {
                    $wrap.removeAttr(writingModeAttr);
                }

                itemScrollingMethods.setIsVertical($form, mode === 'vertical');
                const $scrolling = $form.find('[name="scrolling"]');
                if (isScrolling) {
                    if (!$scrolling.prop('checked')) {
                        itemScrollingMethods.initSelect($form, isScrolling, writingModeInitialScrollingHeight);
                        $scrolling.prop('checked', true).change();
                    }
                    $scrolling.prop('disabled', true);
                } else {
                    $scrolling.prop('disabled', false);
                }
            }
        };
    };

    const getWrapper = widget => {
        return widget.$container.find(`.${wrapperCls}`);
    };

    const createWrapper = widget => {
        let $wrap = getWrapper(widget);
        if (!$wrap.length) {
            $wrap = widget.$container.find('[data-html-editable="true"]').wrapInner('<div />').children();
            $wrap.addClass(wrapperCls);
        }
        return $wrap;
    };

    const toggleVerticalWritingModeByLang = (widget, $form) =>
        verticalWritingEditing.checkItemWritingMode(widget).then(({ isVerticalSupported, isItemVertical }) => {
            $form.data('isItemVertical', isItemVertical);

            $form.find('.writingMode-panel').toggle(isVerticalSupported);

            let isVertical = null;
            const $wrap = getWrapper(widget);
            if ($wrap.attr(writingModeAttr) === writingModeVerticalRlClass) {
                isVertical = true;
            } else if ($wrap.attr(writingModeAttr) === writingModeHorizontalTbClass) {
                isVertical = false;
            } else {
                isVertical = isItemVertical;
            }
            $form.find('input[name="writingMode"][value="vertical"]').prop('checked', isVertical);
            $form.find('input[name="writingMode"][value="horizontal"]').prop('checked', !isVertical);

            if (!!isItemVertical === !isVertical) {
                const $scrolling = $form.find('[name="scrolling"]');
                $scrolling.prop('disabled', true);
            }

            itemScrollingMethods.setIsVertical($form, isVertical);
        });

    return TextActive;
});
