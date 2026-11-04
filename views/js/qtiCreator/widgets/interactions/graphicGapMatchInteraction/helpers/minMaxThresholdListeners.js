/**
 * Keeps matchMin/matchMax upper bounds in sync when associable hotspots are added or removed.
 */
define(['lodash'], function (_) {
    'use strict';

    const THRESHOLD_NS = '.minMaxThresholds';

    return {
        /**
         * Remove choice-count listeners from the interaction widget (call when leaving a choice form).
         *
         * @param {Object} widget
         */
        unbind(widget) {
            widget.off(THRESHOLD_NS);
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
