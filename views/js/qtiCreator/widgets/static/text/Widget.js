define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/text/states/states',

    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/textBlock',
    'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting'
], function ($, Widget, states, toolbarTpl, verticalWriting) {
    var TextWidget = Widget.clone();

    function removeClassInElementBdy(element, cls) {
        let bdy = element.body();
        if (bdy.includes(cls)) {
            // first match only is enough
            bdy = bdy.replace(new RegExp(`class="([^"]*${cls}[^"]*)"`), (str, clsAttr) => {
                const newCls = clsAttr
                    .split(' ')
                    .filter(i => i !== cls)
                    .join(' ');
                return `class="${newCls}"`;
            });
            element.body(bdy);
        }
    }

    const writingModeAttr = 'data-writing-mode-class';

    TextWidget.initCreator = function () {
        Widget.initCreator.call(this);

        this.registerStates(states);

        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-writing-mode-changed', () => {
            this.$container.find(`[${writingModeAttr}]`).each((idx, elt) => {
                $(elt).removeAttr(writingModeAttr);
            });
            removeClassInElementBdy(this.element, verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS);
            removeClassInElementBdy(this.element, verticalWriting.WRITING_MODE_HORIZONTAL_TB_CLASS);
        });
    };

    TextWidget.buildContainer = function () {
        var $wrap = $('<div>', {
            'data-serial': this.element.serial,
            'data-qti-class': '_container',
            class: 'widget-box widget-block widget-textBlock'
        }).append($('<div>', { 'data-html-editable': true }));

        this.$original.wrapInner($wrap);

        this.$container = this.$original.children('.widget-box');

        // do not apply it in editor ui, apply only in qti data. For that, replace class with data attribute
        [verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS, verticalWriting.WRITING_MODE_HORIZONTAL_TB_CLASS].forEach(
            cls => {
                this.$container.find(`.${cls}`).each((idx, elt) => {
                    $(elt).attr(writingModeAttr, cls).removeClass(cls);
                });
            }
        );
    };

    TextWidget.createToolbar = function () {
        var _this = this,
            $tlb = $(
                toolbarTpl({
                    serial: this.serial,
                    state: 'active'
                })
            );

        this.$container.append($tlb);

        $tlb.find('[data-role="delete"]').on('click.widget-box', function (e) {
            e.stopPropagation(); //to prevent direct deleting;
            _this.changeState('deleting');
        });

        return this;
    };

    return TextWidget;
});
