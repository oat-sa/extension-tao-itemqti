/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025-2026 (original work) Open Assessment Technologies SA;
 */

define(['context', 'services/features'], function (context, features) {
    'use strict';

    const MULTI_FIELD_SCORING_FLAG = 'FEATURE_FLAG_MULTI_FIELD_SCORING';
    const MULTI_FIELD_SCORING_VISIBILITY =
        'taoQtiItem/creator/interaction/textEntry/property/multiFieldScoring';
    const ITEM_COMMENTS_FLAG = 'FEATURE_FLAG_ITEM_COMMENTS_ENABLED';

    return {
        MULTI_FIELD_SCORING_FLAG,
        MULTI_FIELD_SCORING_VISIBILITY,
        ITEM_COMMENTS_FLAG,

        /**
         * Check if compact appearance feature is available
         * @returns {boolean} true if compact appearance feature is enabled
         */
        isCompactAppearanceAvailable: function () {
            return features.isVisible('taoQtiItem/creator/interaction/media/property/compactAppearance');
        },

        /**
         * Multi-field scoring authoring UI (UMFI evaluation + dichotomous/polytomous
         * scoring model). Disabled unless FEATURE_FLAG_MULTI_FIELD_SCORING is enabled.
         *
         * @returns {boolean}
         */
        isMultiFieldScoringAvailable: function () {
            if (context.featureFlags && context.featureFlags[MULTI_FIELD_SCORING_FLAG] === true) {
                return true;
            }

            // Optional visibility override; defaults to hidden when the env flag is off.
            return features.isVisible(MULTI_FIELD_SCORING_VISIBILITY, false);
        },

        /**
         * Item/Test authoring Comments tab & panel.
         * Disabled unless FEATURE_FLAG_ITEM_COMMENTS_ENABLED is truthy.
         *
         * @returns {boolean}
         */
        isItemCommentsEnabled: function () {
            return !!(context.featureFlags && context.featureFlags[ITEM_COMMENTS_FLAG]);
        }
    };
});
