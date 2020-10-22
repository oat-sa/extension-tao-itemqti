define([
    'util/typeCaster',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text'
], function (typeCaster, stateFactory, Active, htmlEditor, content, formElement, formTpl) {
    'use strict';

    var wrapperCls = 'custom-text-box';

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
                    // remove the form value if there is no content to apply on
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
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    TextActive.prototype.initForm = function () {
        var widget = this.widget;
        var $form = widget.$form;
        var $block = widget.$container.find('.' + wrapperCls);
        var $wrap = widget.$container.find('.textBlock-wrap');
        var blockCls = $block.attr('class');
        var isScrolling = typeCaster.strToBool($wrap.attr('data-scrolling') || 'false');

        $form.html(formTpl({
            textBlockCssClass: (blockCls || '').replace(wrapperCls, '').trim(),
            scrolling: isScrolling,
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, widget.element, {
            textBlockCssClass: function (element, value) {
                var $block = widget.$container.find('.' + wrapperCls);
                var $wrap = widget.$container.find('.textBlock-wrap');

                // prevent to have the wrapper class twice
                value = value.trim();
                if (value === wrapperCls) {
                    value = '';
                }

                if (!$block.length) {
                    // no wrapper found, insert one
                    if (!$wrap.length) {
                        $block = widget.$container
                            .find('[data-html-editable="true"]')
                            .wrapInner('<div />')
                            .children();
                    } else {
                        $block = widget.$container
                            .find('.textBlock-wrap')
                            .wrapInner('<div />')
                            .children();
                    }
                }

                // replace the block class
                $block.attr('class', wrapperCls + ' ' + value);

            },
            scrolling: function (element, value) {
                var $wrap = widget.$container.find('.textBlock-wrap');

                if (!$wrap.length) {
                    // no wrapper found, insert one
                    $wrap = widget.$container
                        .find('[data-html-editable="true"]')
                        .wrapInner('<div class="textBlock-wrap" />')
                        .children();
                }

                $wrap.attr('data-scrolling', value);
            }
        });
    };

    return TextActive;
});
