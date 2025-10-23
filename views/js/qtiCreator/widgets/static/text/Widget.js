define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/text/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/textBlock'
], function ($, Widget, states, toolbarTpl) {
    var TextWidget = Widget.clone();

    //TODO: import classes
    const writingModeVerticalRlClass = 'writing-mode-vertical-rl';
    const writingModeHorizontalTbClass = 'writing-mode-horizontal-tb';
    const writingModeAttr = 'data-writing-mode-class';
    const wrapperCls = 'custom-text-box';

    TextWidget.initCreator = function () {
        Widget.initCreator.call(this);

        this.registerStates(states);

        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-writing-mode-changed', () => {
            this.$container.find(`[${writingModeAttr}]`).each((idx, elt) => {
                $(elt).removeAttr(writingModeAttr);
            });
            let bdy = this.element.body();
            bdy = bdy.replace(new RegExp(`class="([^"]*${wrapperCls}[^"]*)"`), (str, cls) => {
                const newCls = cls
                    .split(' ')
                    .filter(i => i && ![writingModeVerticalRlClass, writingModeHorizontalTbClass].includes(i))
                    .join(' ');
                return `class="${newCls}"`;
            });
            this.element.body(bdy);
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

        [writingModeVerticalRlClass, writingModeHorizontalTbClass].forEach(cls => {
            this.$container.find(`.${cls}`).each((idx, elt) => {
                $(elt).attr(writingModeAttr, cls).removeClass(cls);
            });
        });
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
