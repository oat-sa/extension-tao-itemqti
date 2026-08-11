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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
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
