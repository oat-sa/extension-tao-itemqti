define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods',
    'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting'
], function (Widget, states, itemScrollingMethods, verticalWriting) {
    'use strict';

    var ExtendedTextInteractionWidget = Widget.clone();

    ExtendedTextInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);

        // do not apply it in editor ui, apply only in qti data
        this.$original
            .removeClass(verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS)
            .removeClass(verticalWriting.WRITING_MODE_HORIZONTAL_TB_CLASS);

        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-writing-mode-changed', () => {
            //reset writing mode
            this.element.removeClass(verticalWriting.WRITING_MODE_VERTICAL_RL_CLASS);
            this.element.removeClass(verticalWriting.WRITING_MODE_HORIZONTAL_TB_CLASS);
            itemScrollingMethods.wrapContent(this, false, 'interaction');
        });
    };

    return ExtendedTextInteractionWidget;
});
