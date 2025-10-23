define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/states'
], function (Widget, states) {
    'use strict';

    const writingModeVerticalRlClass = 'writing-mode-vertical-rl';
    const writingModeHorizontalTbClass = 'writing-mode-horizontal-tb';

    var ExtendedTextInteractionWidget = Widget.clone();

    ExtendedTextInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);

        this.$original.removeClass(writingModeVerticalRlClass).removeClass(writingModeHorizontalTbClass);

        const $itemBody = this.$container.closest('.qti-itemBody');
        $itemBody.on('item-writing-mode-changed', () => {
            this.element.removeClass(writingModeVerticalRlClass);
            this.element.removeClass(writingModeHorizontalTbClass);
        });
    };

    return ExtendedTextInteractionWidget;
});
