define([
    'util/typeCaster',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
], function (typeCaster, stateFactory, Active, htmlEditor, content, formElement, formTpl, itemScrollingMethods) {
    'use strict';

    const wrapperCls = 'custom-text-box';

    const TextActive = stateFactory.extend(Active, function () {

        this.buildEditor();
        this.initForm();

    }, function () {

        this.destroyEditor();
        this.widget.$form.empty();
    });

    TextActive.prototype.buildEditor = function () {

        var widget = this.widget;
        var $editableContainer = widget.$container;
        var container = widget.element;
        var changeCallback = content.getChangeCallback(container);

        $editableContainer.attr('data-html-editable-container', true);

        if (!htmlEditor.hasEditor($editableContainer)) {

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
                }
            });
        }
    };

    TextActive.prototype.destroyEditor = function () {
        htmlEditor.destroyEditor(this.widget.$container);
    };

    TextActive.prototype.initForm = function () {
        var widget = this.widget,
            $form = widget.$form,
            $block = widget.$container.find('.' + wrapperCls),
            $wrap = widget.$container.find('.text-block-wrap'),
            blockCls = $block.attr('class'),
            isScrolling = itemScrollingMethods.isScrolling($wrap),
            selectedHeight = itemScrollingMethods.selectedHeight($wrap);

        $form.html(formTpl({
            textBlockCssClass: (blockCls || '').replace(wrapperCls, '').trim(),
            scrolling: isScrolling,
            scrollingHeights: itemScrollingMethods.options(),
        }));

        itemScrollingMethods.initSelect($form, isScrolling, selectedHeight);

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, widget.element, changeCallbacks(widget));
    };

    const changeCallbacks = function (widget) {
        return {
            textBlockCssClass: function (element, value) {
                const $wrap = widget.$container.find('.text-block-wrap');
                let $block = widget.$container.find('.' + wrapperCls);

                // prevent to have the wrapper class twice
                value = value.trim();
                if (value === wrapperCls) {
                    value = '';
                }

                if (!$block.length) {
                    if (!$wrap.length) {
                        $block = widget.$container.find('[data-html-editable="true"]').wrapInner('<div />').children();
                    } else {
                        $block = widget.$container.find('.text-block-wrap').wrapInner('<div />').children();
                    }
                }

                $block.attr('class', wrapperCls + ' ' + value);
            },
            scrolling: function (element, value) {
                itemScrollingMethods.wrapContent(widget, value, 'inner')
            },
            scrollingHeight: function (element, value) {
                itemScrollingMethods.setScrollingHeight(widget.$container.find('.text-block-wrap').first(), value)
            }
        }
    };

    return TextActive;
});
