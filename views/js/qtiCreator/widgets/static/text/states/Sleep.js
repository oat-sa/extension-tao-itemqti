define([
    'context',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Sleep',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function (context, stateFactory, SleepState, contentHelper) {
    const DISABLE_FIGURE_WIDGET = context.featureFlags && context.featureFlags.FEATURE_FLAG_DISABLE_FIGURE_WIDGET;

    const TextBlockStateSleep = stateFactory.extend(
        SleepState,
        function () {
            const widget = this.widget;
            widget.afterStateExit(function (e, element, state) {
                const serial = element.getSerial();
                if (
                    state.name === 'active' &&
                    serial !== widget.serial &&
                    (element.qtiClass === 'include' || (!DISABLE_FIGURE_WIDGET && element.qtiClass === 'figure'))
                ) {
                    // update bdy of container in case include is wrapped in custom-include-box
                    const composingElts = widget.element.getComposingElements();
                    if (composingElts[serial]) {
                        const $pseudoContainer = $('<div>').html(
                            widget.$container.find('[data-html-editable="true"]').html()
                        );
                        const newBody = contentHelper.getContent($pseudoContainer);
                        const container = widget.element;
                        container.body(newBody);
                    }
                }
            }, 'question');
        },
        function () {
            this.widget.offEvents('question');
        }
    );

    return TextBlockStateSleep;
});
