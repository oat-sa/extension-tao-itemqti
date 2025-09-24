define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep',
    'taoQtiItem/qtiCreator/widgets/helpers/featureFlags'
], function(_, stateFactory, SleepState, featureFlags) {

    var initSleepState = function initSleepState() {
        const widget = this.widget;
        const interaction = widget.element;
        const $container = widget.$original;
        widget.renderInteraction();
        $container.append('<div class="overlay"></div>');
        if(/audio/.test(interaction.object.attr('type')) && interaction.hasClass('compact-appearance') && featureFlags.isCompactAppearanceAvailable()) {
            $container.parent().addClass('compact-appearance');
        }
    };

    var exitSleepState = function exitSleepState(){
        this.widget.destroyInteraction();
        this.widget.$original.children('.overlay').remove();
    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});
