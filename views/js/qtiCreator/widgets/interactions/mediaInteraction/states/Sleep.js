define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep'
], function(stateFactory, SleepState) {

    var initSleepState = function initSleepState() {
        this.widget.renderInteraction();
        this.widget.$original.append('<div class="overlay"></div>');
    };

    var exitSleepState = function exitSleepState(){
        this.widget.destroyInteraction();
        this.widget.$original.children('.overlay').remove();
    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});
