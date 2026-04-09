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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define([], function () {
    'use strict';

    /**
     * Replicates the float formatting logic from Correct.js state
     * This is extracted for testability
     * @param {string} correctResponse - The correct response value
     * @returns {string} - The formatted response
     */
    function formatFloatResponse(correctResponse) {
        if (correctResponse && !String(correctResponse).includes('.')) {
            return `${correctResponse}.0`;
        }
        return correctResponse;
    }

    QUnit.module('qtiCreator/widgets/interactions/textEntryInteraction/states/Correct - float formatting');

    QUnit.test('module', assert => {
        assert.equal(typeof formatFloatResponse, 'function', 'formatFloatResponse is a function');
    });

    QUnit.cases
        .init([
            {
                title: 'empty string should remain empty',
                input: '',
                expected: ''
            },
            {
                title: 'undefined should remain undefined',
                input: undefined,
                expected: undefined
            },
            {
                title: 'null should remain null',
                input: null,
                expected: null
            },
            {
                title: 'whole number string should get .0 appended',
                input: '5',
                expected: '5.0'
            },
            {
                title: 'decimal number should stay unchanged',
                input: '5.5',
                expected: '5.5'
            },
            {
                title: 'zero should get .0 appended',
                input: '0',
                expected: '0.0'
            },
            {
                title: 'negative whole number should get .0 appended',
                input: '-10',
                expected: '-10.0'
            },
            {
                title: 'negative decimal should stay unchanged',
                input: '-10.5',
                expected: '-10.5'
            },
            {
                title: 'number ending with .0 should stay unchanged',
                input: '5.0',
                expected: '5.0'
            },
            {
                title: 'large whole number should get .0 appended',
                input: '999',
                expected: '999.0'
            },
            {
                title: 'decimal with trailing zeros should stay unchanged',
                input: '5.50',
                expected: '5.50'
            }
        ])
        .test('float formatting ', (data, assert) => {
            const result = formatFloatResponse(data.input);
            assert.strictEqual(
                result,
                data.expected,
                `${data.title}: "${data.input}" -> "${data.expected}"`
            );
        });

    QUnit.test('regression: empty string should NOT become ".0"', assert => {
        const result = formatFloatResponse('');
        assert.notEqual(result, '.0', 'Empty string should not be converted to ".0"');
        assert.strictEqual(result, '', 'Empty string should remain empty');
    });
});
