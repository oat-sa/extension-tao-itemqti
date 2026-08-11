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
define([
    'taoQtiItem/qtiCreator/widgets/static/math/helpers/wirisTrialMode'
], function (wirisTrialMode) {
    'use strict';

    QUnit.module('resolveWirisTrialMode');

    QUnit.cases
        .init([
            { title: 'undefined defaults on', value: undefined, expected: true },
            { title: 'null defaults on', value: null, expected: true },
            { title: 'empty string defaults on', value: '', expected: true },
            { title: 'boolean true', value: true, expected: true },
            { title: 'boolean false', value: false, expected: false },
            { title: 'string true', value: 'true', expected: true },
            { title: 'string false', value: 'false', expected: false },
            { title: 'string 0', value: '0', expected: false },
            { title: 'number 0', value: 0, expected: false },
            { title: 'malformed defaults on', value: 'nope', expected: true }
        ])
        .test('normalizes config values', function (data, assert) {
            assert.strictEqual(
                wirisTrialMode.resolveWirisTrialMode(data.value),
                data.expected
            );
        });

    QUnit.module('shouldShowWirisTrialNotice');

    QUnit.cases
        .init([
            {
                title: 'wiris on + trial on → show',
                wirisMathEnabled: true,
                flag: true,
                expected: true
            },
            {
                title: 'wiris on + trial absent → show',
                wirisMathEnabled: true,
                flag: undefined,
                expected: true
            },
            {
                title: 'wiris on + trial false → hide',
                wirisMathEnabled: true,
                flag: false,
                expected: false
            },
            {
                title: 'wiris on + trial "false" → hide',
                wirisMathEnabled: true,
                flag: 'false',
                expected: false
            },
            {
                title: 'wiris off + trial on → hide',
                wirisMathEnabled: false,
                flag: true,
                expected: false
            },
            {
                title: 'wiris off + trial absent → hide',
                wirisMathEnabled: false,
                flag: undefined,
                expected: false
            }
        ])
        .test('combines wiris availability and trial flag', function (data, assert) {
            assert.strictEqual(
                wirisTrialMode.shouldShowWirisTrialNotice(data.wirisMathEnabled, data.flag),
                data.expected
            );
        });
});
