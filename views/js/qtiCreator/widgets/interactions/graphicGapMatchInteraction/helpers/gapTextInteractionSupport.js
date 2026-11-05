/**
 * gapText collection helpers when the bundled core graphicGapMatchInteraction lacks them.
 */
define(['lodash', 'taoQtiItem/qtiItem/core/Element'], function (_, Element) {
    'use strict';

    function initGapTexts(interaction) {
        if (!interaction.gapTexts) {
            interaction.gapTexts = {};
        }
    }

    /**
     * @param {Object} interaction - graphicGapMatchInteraction model
     */
    return function ensureGapTextSupport(interaction) {
        initGapTexts(interaction);

        if (typeof interaction.getGapTexts !== 'function') {
            interaction.getGapTexts = function () {
                initGapTexts(interaction);
                return _.clone(interaction.gapTexts);
            };
        }

        if (typeof interaction.getGapText !== 'function') {
            interaction.getGapText = function (serial) {
                initGapTexts(interaction);
                return interaction.gapTexts[serial];
            };
        }

        if (typeof interaction.addGapText !== 'function') {
            interaction.addGapText = function (gapText) {
                initGapTexts(interaction);
                if (Element.isA(gapText, 'gapText')) {
                    if (typeof gapText.setRootElement === 'function') {
                        gapText.setRootElement(interaction.getRootElement() || null);
                    }
                    interaction.gapTexts[gapText.getSerial()] = gapText;
                }
                return interaction;
            };
        }

        if (typeof interaction.removeGapText !== 'function') {
            interaction.removeGapText = function (gapText) {
                var serial = '';
                initGapTexts(interaction);
                if (typeof gapText === 'string') {
                    serial = gapText;
                } else if (Element.isA(gapText, 'gapText')) {
                    serial = gapText.getSerial();
                }
                delete interaction.gapTexts[serial];
                return interaction;
            };
        }
    };
});
