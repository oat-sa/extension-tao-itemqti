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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */

define(['jquery', 'taoQtiItem/qtiCreator/helper/languages', 'lib/jquery.mockjax/jquery.mockjax'], function (
    $,
    languages
) {
    'use strict';
    const languagesDataMock = [
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langar-arb',
            code: 'ar-arb',
            label: 'arabic',
            orientation: 'rtl'
        },
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langde-de',
            code: 'de-de',
            label: 'german',
            orientation: 'ltr'
        },
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langen-gb',
            code: 'en-gb',
            label: 'english (united kingdom)',
            orientation: 'ltr'
        }
    ];

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Mock the item data query
    $.mockjax([
        {
            url: 'undefined/tao/Languages/index',
            responseText: {
                success: true,
                data: languagesDataMock
            },
            status: 200
        }
    ]);

    QUnit.module('getList()');

    QUnit.test('responses with languages list', assert => {
        assert.expect(1);

        const done = assert.async();

        languages
            .getList()
            .then(result => {
                assert.deepEqual(languagesDataMock, result, 'Results data is received');
            })
            .finally(done);
    });

    QUnit.test('makes only one request', assert => {
        assert.expect(1);

        const done = assert.async();

        // Has to be explicitly chained in order to show correctly number of calls from $.mockjax.mockedAjaxCalls()
        languages
            .getList()
            .then(languages.getList)
            .then(languages.getList)
            .then(() => {
                assert.equal($.mockjax.mockedAjaxCalls().length, 1, 'Call only once');
            })
            .finally(done);
    });

    QUnit.test('multiple calls returns the same result', assert => {
        assert.expect(2);

        const done = assert.async();

        Promise.all([languages.getList, languages.getList, languages.getList])
            .then(languagesResults => {
                assert.deepEqual(
                    languagesResults[0],
                    languagesResults[1],
                    'Results data from call 1 is equal to data from call 2'
                );
                assert.deepEqual(
                    languagesResults[1],
                    languagesResults[2],
                    'Results data from call 2 is equal to data from call 3'
                );
            })
            .finally(done);
    });

    QUnit.cases
        .init([
            { code: 'ar-arb', expected: true },
            { code: 'de-de', expected: false },
            { code: 'en-gb', expected: false },
            { code: 'unknown-code', expected: false },
            { code: undefined, expected: false }
        ])
        .test('isRTLbyLanguageCode ', (data, assert) => {
            assert.expect(1);

            const done = assert.async();

            languages
                .isRTLbyLanguageCode(data.code)
                .then(isRTL => {
                    assert.equal(isRTL, data.expected, `${data.code} matches to ${data.expected}`);
                })
                .finally(done);
        });

    QUnit.module('Transformations');

    QUnit.test('useLegacyFormatting formatting result according to legacy formatting', assert => {
        assert.expect(1);

        const done = assert.async();

        languages
            .getList()
            .then(languages.useLegacyFormatting)
            .then(formattedLanguages => {
                assert.deepEqual(
                    formattedLanguages,
                    {
                        'ar-arb': 'arabic',
                        'de-de': 'german',
                        'en-gb': 'english (united kingdom)'
                    },
                    'Languages matches to legacy format'
                );
            })
            .finally(done);
    });

    QUnit.test('useCKEFormatting formatting result according to CKE formatting', assert => {
        assert.expect(1);

        const done = assert.async();

        languages
            .getList()
            .then(languages.useCKEFormatting)
            .then(formattedLanguages => {
                assert.deepEqual(
                    formattedLanguages,
                    ['ar-arb:arabic:rtl', 'de-de:german:ltr', 'en-gb:english (united kingdom):ltr'],
                    'Languages matches to legacy format'
                );
            })
            .finally(done);
    });
});
