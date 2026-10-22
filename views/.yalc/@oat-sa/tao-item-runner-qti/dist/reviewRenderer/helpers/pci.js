define(['exports'], function (exports) { 'use strict';

    /**
     * List of interactable PCIs
     */
    const interactablePcis = ['textReaderInteraction', 'audioRecordingInteraction'];

    /**
     * Returns a boolean based on weather the PCI should allow interaction or not in review mode
     *
     * @param {String} pciType
     * @returns {Boolean}
     */
    const isInteractionDisabledForPci = pciType => {
        return interactablePcis.indexOf(pciType) === -1;
    };

    exports.isInteractionDisabledForPci = isInteractionDisabledForPci;

    Object.defineProperty(exports, '__esModule', { value: true });

});
