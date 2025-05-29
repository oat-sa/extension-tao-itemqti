define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
    'services/features'
], function (stateFactory, Active, htmlEditor, content, formElement, formTpl, itemScrollingMethods, features) {
    'use strict';

    const wrapperCls = 'custom-text-box';

    const scrollingAvailable = features.isVisible('taoQtiItem/creator/static/text/scrolling');

    function cleanDefaultTextBlockClasses($wrap) {
        return itemScrollingMethods
            .cutScrollClasses($wrap.attr('class') || '')
            .replace(wrapperCls, '')
            .trim();
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
        const widget = this.widget,
            $form = widget.$form,
            $wrap = widget.$container.find(`.${wrapperCls}`),
            isScrolling = itemScrollingMethods.isScrolling($wrap),
            selectedHeight = itemScrollingMethods.selectedHeight($wrap);

        $form.html(
            formTpl({
                textBlockCssClass: cleanDefaultTextBlockClasses($wrap),
                scrolling: isScrolling,
                scrollingAvailable,
                scrollingHeights: itemScrollingMethods.options()
            })
        );

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, widget.element, changeCallbacks(widget, $form));

        itemScrollingMethods.initSelect($form, isScrolling, selectedHeight);
    };

    const changeCallbacks = function (widget, $form) {
        return {
            textBlockCssClass: function (element, value) {
                let $wrap = widget.$container.find(`.${wrapperCls}`);

                value = value.trim();
                if (value === wrapperCls) {
                    value = '';
                }

                if (!$wrap.length) {
                    $wrap = widget.$container.find('[data-html-editable="true"]').wrapInner('<div />').children();
                }

                const scrollingEnabled = $form.find('[name="scrolling"]').prop('checked');
                const scrollingHeightVal = $form.find('[name="scrollingHeight"]').val();
                const scrollingClasses = itemScrollingMethods.getScrollClasses(scrollingEnabled, scrollingHeightVal);
                $wrap.attr('class', `${wrapperCls} ${scrollingClasses}`);
                $wrap.addClass(value);
            },
            scrolling: function (element, value) {
                itemScrollingMethods.wrapContent(widget, value, 'inner');

                const $wrap = widget.$container.find(`.${wrapperCls}`);
                if ($wrap.length) {
                    $form.find('[name="textBlockCssClass"]').val(cleanDefaultTextBlockClasses($wrap));
                }
            },
            scrollingHeight: function (element, value) {
                const $wrap = widget.$container.find(`.${wrapperCls}`);
                itemScrollingMethods.setScrollingHeight($wrap, value);
                $form.find('[name="textBlockCssClass"]').val(cleanDefaultTextBlockClasses($wrap));
            }
        };
    };

    return TextActive;
});
