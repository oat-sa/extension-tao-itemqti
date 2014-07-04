define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep'
], function(_, stateFactory, SleepState) {

    var initSleepState = function initSleepState() {
        this.widget.renderInteraction();
    };

    var exitSleepState = function exitSleepState(){
        this.widget.destroyInteraction();
    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});
