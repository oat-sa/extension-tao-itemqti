/**
 * SPDX-FileCopyrightText: 2026-2026 Open Assessment Technologies S.A.
 * Copyright (C) 2026 (original work) Open Assessment Technologies S.A.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-TAO-Commercial-License
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
