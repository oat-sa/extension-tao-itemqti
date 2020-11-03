define([
    'util/typeCaster',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods'
], function (typeCaster, stateFactory, Active, htmlEditor, content, formElement, formTpl, itemScrollingMethods) {
    'use strict';

    var wrapperCls = 'text-block-wrap';

    var TextActive = stateFactory.extend(Active, function () {

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
            $wrap = widget.$container.find('.text-block-wrap.inner'),
            blockCls = $wrap.attr('class'),
            isScrolling = itemScrollingMethods.isScrolling($wrap),
            selectedHeight = itemScrollingMethods.selectedHeight($wrap);

        $form.html(formTpl({
            textBlockCssClass: (blockCls || '').replace(wrapperCls + ' inner', '').trim(),
            scrolling: isScrolling,
            scrollingHeights: itemScrollingMethods.options(),
        }));

        itemScrollingMethods.initSelect($form, isScrolling, selectedHeight);

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, widget.element, changeCallbacks(widget));
    };

    var changeCallbacks = function (widget) {
        return {
            textBlockCssClass: function (element, value) {
                var $wrap = widget.$container.find('[data-html-editable="true"]').children('.text-block-wrap.inner');

                value = value.trim();
                if (value === wrapperCls + 'inner') {
                    value = '';
                }

                if (!$wrap.length) {
                    $wrap = widget.$container.find('[data-html-editable="true"]').wrapInner('<div />').children();
                }

                $wrap.attr('class', wrapperCls + ' inner' + ' ' + value);
            },
            scrolling: function (element, value) {
                itemScrollingMethods.wrapContent(widget, value, 'inner')
            },
            scrollingHeight: function (element, value) {
                itemScrollingMethods.setScrollingHeight(widget.$container.find('.text-block-wrap.inner').first(), value)
            }
        }
    };

    return TextActive;
});
