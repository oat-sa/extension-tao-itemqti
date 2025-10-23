define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
    'taoQtiItem/qtiCreator/helper/languages',
    'services/features',
    'context'
], function (
    stateFactory,
    Active,
    htmlEditor,
    content,
    formElement,
    formTpl,
    itemScrollingMethods,
    languages,
    features,
    context
) {
    'use strict';

    const wrapperCls = 'custom-text-box';
    const writingModeVerticalRlClass = 'writing-mode-vertical-rl';
    const writingModeHorizontalTbClass = 'writing-mode-horizontal-tb';
    //we don't want to apply vertical styles in the Authoring editor. So for the editor, use data attr. For qti, transform attr to the class.
    const writingModeAttr = 'data-writing-mode-class';

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

        toggleVerticalWritingModeByLang(widget, $form);
    };

    const changeCallbacks = function (widget, $form) {
        return {
            textBlockCssClass: function (element, value) {
                const $wrap = createWrapper(widget);
                const customClasses = cleanDefaultTextBlockClasses($wrap);
                customClasses.split(' ').forEach(cls => {
                    $wrap.removeClass(cls);
                });
                $wrap.addClass(value.trim());
            },
            scrolling: function (element, value) {
                itemScrollingMethods.wrapContent(widget, value, 'inner');
            },
            scrollingHeight: function (element, value) {
                const $wrap = getWrapper(widget);
                itemScrollingMethods.setScrollingHeight($wrap, value);
            },
            writingMode(i, mode) {
                const $wrap = createWrapper(widget);
                if (mode === 'vertical' && !$form.data('isItemVertical')) {
                    $wrap.attr(writingModeAttr, writingModeVerticalRlClass);
                } else if (mode === 'horizontal' && $form.data('isItemVertical')) {
                    $wrap.attr(writingModeAttr, writingModeHorizontalTbClass);
                } else {
                    $wrap.removeAttr(writingModeAttr);
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

    const checkItemWritingMode = widget => {
        const rootElement = widget.element.getRootElement();
        const itemLang = rootElement.attr('xml:lang');

        return languages.getVerticalWritingModeByLang(itemLang).then(supportedVerticalMode => {
            return {
                isSupported: supportedVerticalMode === 'vertical-rl',
                isItemVertical: !!rootElement.hasClass(writingModeVerticalRlClass)
            };
        });
    };

    const toggleVerticalWritingModeByLang = (widget, $form) =>
        checkItemWritingMode(widget).then(({ isSupported, isItemVertical }) => {
            $form.data('isItemVertical', isItemVertical);

            $form.find('.writingMode-panel').toggle(isSupported);

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
        });

    return TextActive;
});
