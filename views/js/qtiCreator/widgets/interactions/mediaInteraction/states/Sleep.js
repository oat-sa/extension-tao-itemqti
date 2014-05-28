define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction'
], function(stateFactory, SleepState, MediaInteractionCommonRenderer) {

    var initSleepState = function initSleepState() {
        var widget = this.widget;
        var interaction = widget.element;
        
        if ( widget.$container.find('.instruction-container .mejs-container').length == 0 ) {
            MediaInteractionCommonRenderer.render(interaction, true);
        }
        
        widget.on('metaChange', function(data) {
            //
        });
    };

    var exitSleepState = function exitSleepState() {

    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});