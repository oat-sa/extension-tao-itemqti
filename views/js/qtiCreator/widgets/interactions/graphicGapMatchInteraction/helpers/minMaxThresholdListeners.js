/**
 * Keeps matchMin/matchMax upper bounds in sync when associable hotspots are added or removed.
 */
define(['jquery', 'lodash'], function ($, _) {
    'use strict';

    const THRESHOLD_NS = '.minMaxThresholds';
    const THRESHOLD_EVENTS = ['choiceCreated', 'choiceDeleted'];

    /**
     * Document event names used by {@link taoQtiItem/qtiCreator/widgets/Widget#on} for threshold listeners.
     *
     * @param {Object} widget
     * @param {String} eventName
     * @returns {String}
     */
    function documentEventName(widget, eventName) {
        return [eventName + THRESHOLD_NS, 'qti-widget', widget.serial, widget.getCurrentState().name].join('.');
    }

    return {
        /**
         * Remove choice-count listeners from the interaction widget (call when leaving a choice form).
         *
         * @param {Object} widget
         */
        unbind(widget) {
            if (!widget || !_.isFunction(widget.getCurrentState)) {
                return;
            }

            _.forEach(THRESHOLD_EVENTS, eventName => {
                $(document).off(documentEventName(widget, eventName));
            });
        },

        /**
         * @param {Object} minMaxComponent - min/max UI component (render handler `this`)
         * @param {Object} widget
         * @param {Object} interaction
         */
        bindChoiceCountThresholds(minMaxComponent, widget, interaction) {
            widget.on(`choiceCreated${THRESHOLD_NS} choiceDeleted${THRESHOLD_NS}`, function (data) {
                if (data.interaction.serial === interaction.serial && minMaxComponent.is('rendered')) {
                    minMaxComponent.updateThresholds(1, _.size(interaction.getChoices()));
                }
            });
        }
    };
});
