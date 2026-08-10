/**
 * SPDX-FileCopyrightText: 2026-2026 Open Assessment Technologies S.A.
 * Copyright (C) 2026 (original work) Open Assessment Technologies S.A.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-TAO-Commercial-License
 */
define([], function () {
    'use strict';

    /**
     * Normalize ENV/module-config values for MathType trial notice.
     * Default-on when omitted or malformed; explicit false/"false"/"0" disable.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function resolveWirisTrialMode(value) {
        if (typeof value === 'undefined' || value === null || value === '') {
            return true;
        }

        if (value === false || value === 0 || value === '0') {
            return false;
        }

        if (value === true || value === 1 || value === '1') {
            return true;
        }

        if (typeof value === 'string') {
            var normalized = value.toLowerCase();
            if (normalized === 'false') {
                return false;
            }
            if (normalized === 'true') {
                return true;
            }
        }

        return true;
    }

    /**
     * @param {boolean} wirisMathEnabled
     * @param {*} wirisTrialModeFlag
     * @returns {boolean}
     */
    function shouldShowWirisTrialNotice(wirisMathEnabled, wirisTrialModeFlag) {
        return !!wirisMathEnabled && resolveWirisTrialMode(wirisTrialModeFlag);
    }

    return {
        resolveWirisTrialMode: resolveWirisTrialMode,
        shouldShowWirisTrialNotice: shouldShowWirisTrialNotice
    };
});
