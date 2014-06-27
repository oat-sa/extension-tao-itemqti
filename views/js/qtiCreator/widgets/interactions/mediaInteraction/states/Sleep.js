define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction'
], function(stateFactory, SleepState, MediaInteractionCommonRenderer) {

    var initSleepState = function initSleepState() {
        var widget = this.widget;
        var interaction = widget.element;
        
        $('.ui-widget-header li').not('li.ui-tabs-selected').on('mousedown', function() {
            if ( widget.mediaElementObject !== undefined && widget.mediaElementObject.src !== '' ) {
                widget.mediaElementObject.setSrc('');
            }
        });
        
        if ( widget.$container.find('.instruction-container .mejs-container').length == 0 ) {
            widget.mediaElementObject = MediaInteractionCommonRenderer.render(interaction, true);
        }
        
        widget.on('metaChange', function(data) {
            //
        });
    };

    var exitSleepState = function exitSleepState() {

    };

    return stateFactory.extend(SleepState, initSleepState, exitSleepState);
});