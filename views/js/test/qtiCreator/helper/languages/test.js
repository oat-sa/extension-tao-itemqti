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

define([
    'jquery',
    'taoQtiItem/qtiCreator/helper/languages',
    'util/url',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, languages, urlUtil) {
    'use strict';
    const languagesDataMock = [
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langar-arb',
            code: 'ar-arb',
            label: 'arabic',
            orientation: 'rtl'
        },
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langen-gb',
            code: 'en-gb',
            label: 'english (united kingdom)',
            orientation: 'ltr'
        },
        {
            uri: 'http://www.tao.lu/ontologies/tao.rdf#langde-de',
            code: 'de-de',
            label: 'german',
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
                // Languages should be sorted alphabetically by label
                const expectedSorted = [
                    {
                        uri: 'http://www.tao.lu/ontologies/tao.rdf#langar-arb',
                        code: 'ar-arb',
                        label: 'arabic',
                        orientation: 'rtl'
                    },
                    {
                        uri: 'http://www.tao.lu/ontologies/tao.rdf#langen-gb',
                        code: 'en-gb',
                        label: 'english (united kingdom)',
                        orientation: 'ltr'
                    },
                    {
                        uri: 'http://www.tao.lu/ontologies/tao.rdf#langde-de',
                        code: 'de-de',
                        label: 'german',
                        orientation: 'ltr'
                    }
                ];
                assert.deepEqual(expectedSorted, result, 'Results data is received and sorted');
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

    QUnit.module('sortLanguages() sorting');

    QUnit.test('returns a sorted list of languages', assert => {
        const unsortedLanguages = [
            { code: 'fr', label: 'French' },
            { code: 'es', label: 'Spanish' },
            { code: 'en', label: 'English' }
        ];

        const sortedLanguages = languages.sortLanguages(unsortedLanguages);
        const expectedOrder = ['English', 'French', 'Spanish'];
        const actualOrder = sortedLanguages.map(lang => lang.label);
        assert.deepEqual(actualOrder, expectedOrder, 'Languages are sorted alphabetically by label');
    });

    QUnit.test('handles null and undefined labels', assert => {
        const languagesWithMissingLabels = [
            { code: 'fr', label: 'French' },
            { code: 'es', label: null },
            { code: 'en', label: undefined },
            { code: 'de', label: 'German' }
        ];

        const sortedLanguages = languages.sortLanguages(languagesWithMissingLabels);
        const expectedOrder = ['', '', 'French', 'German'];
        const actualOrder = sortedLanguages.map(lang => lang.label || '');
        assert.deepEqual(actualOrder, expectedOrder, 'Handles null and undefined labels correctly');
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
                    ['ar-arb:arabic:rtl', 'en-gb:english (united kingdom):ltr', 'de-de:german:ltr'],
                    'Languages matches to legacy format'
                );
            })
            .finally(done);
    });

    /**
     * Tests for languagesUrl configuration fallback (lines 28-29 of languages.js):
     *   const config = module.config();
     *   const languagesUrl = (config && config.languagesUrl) || urlUtil.route('index', 'Languages', 'tao');
     */
    QUnit.module('languagesUrl configuration', {
        afterEach: function () {
            // Clean up: undefine the module so subsequent tests start fresh
            require.undef('taoQtiItem/qtiCreator/helper/languages');
        }
    });

    /**
     * Test: When module.config() returns no languagesUrl, falls back to urlUtil.route()
     *
     * This tests the fallback branch:
     *   const languagesUrl = (config && config.languagesUrl) || urlUtil.route('index', 'Languages', 'tao');
     *
     * When config.languagesUrl is falsy, urlUtil.route('index', 'Languages', 'tao') is used.
     */
    QUnit.test('languagesUrl falls back to urlUtil.route when not configured', function (assert) {
        const done = assert.async();

        // Get the expected fallback URL from urlUtil.route
        const expectedFallbackUrl = urlUtil.route('index', 'Languages', 'tao');

        // The module is already loaded with default config (no languagesUrl override)
        // Mock the AJAX call to capture the URL being requested
        $.mockjax.clear();

        let capturedUrl = null;
        $.mockjax({
            url: /.*Languages.*/,
            response: function (settings) {
                capturedUrl = settings.url;
                this.responseText = { success: true, data: [] };
            },
            status: 200
        });

        // Reload the module fresh with no languagesUrl config
        require.undef('taoQtiItem/qtiCreator/helper/languages');
        require.config({
            config: {
                'taoQtiItem/qtiCreator/helper/languages': {}
            }
        });

        require(['taoQtiItem/qtiCreator/helper/languages'], function (langModule) {
            // Reset the internal cache by creating a fresh request
            langModule
                .getList()
                .then(function () {
                    assert.ok(capturedUrl, 'AJAX request was made');
                    assert.equal(
                        capturedUrl,
                        expectedFallbackUrl,
                        'languagesUrl equals urlUtil.route("index", "Languages", "tao") when not configured'
                    );
                })
                .catch(function (err) {
                    assert.ok(false, 'getList() failed: ' + err);
                })
                .finally(function () {
                    $.mockjax.clear();
                    done();
                });
        });
    });

    /**
     * Test: When module.config() returns an object with languagesUrl, that URL is used
     *
     * This tests the primary branch:
     *   const languagesUrl = (config && config.languagesUrl) || urlUtil.route('index', 'Languages', 'tao');
     *
     * When config.languagesUrl is truthy, it takes precedence over the fallback.
     */
    QUnit.test('languagesUrl uses module.config().languagesUrl when provided', function (assert) {
        const done = assert.async();
        const customLanguagesUrl = 'http://custom.server/api/languages';

        // Clear existing mocks
        $.mockjax.clear();

        let capturedUrl = null;
        $.mockjax({
            url: customLanguagesUrl,
            response: function (settings) {
                capturedUrl = settings.url;
                this.responseText = { success: true, data: [] };
            },
            status: 200
        });

        // Undefine and reload the module with custom languagesUrl config
        require.undef('taoQtiItem/qtiCreator/helper/languages');
        require.config({
            config: {
                'taoQtiItem/qtiCreator/helper/languages': {
                    languagesUrl: customLanguagesUrl
                }
            }
        });

        require(['taoQtiItem/qtiCreator/helper/languages'], function (langModule) {
            langModule
                .getList()
                .then(function () {
                    assert.ok(capturedUrl, 'AJAX request was made');
                    assert.equal(
                        capturedUrl,
                        customLanguagesUrl,
                        'languagesUrl equals the configured languagesUrl from module.config()'
                    );
                })
                .catch(function (err) {
                    assert.ok(false, 'getList() failed: ' + err);
                })
                .finally(function () {
                    $.mockjax.clear();
                    done();
                });
        });
    });

    /**
     * Test: When module.config() returns null, falls back to urlUtil.route()
     */
    QUnit.test('languagesUrl falls back to urlUtil.route when config is null', function (assert) {
        const done = assert.async();

        const expectedFallbackUrl = urlUtil.route('index', 'Languages', 'tao');

        $.mockjax.clear();

        let capturedUrl = null;
        $.mockjax({
            url: /.*Languages.*/,
            response: function (settings) {
                capturedUrl = settings.url;
                this.responseText = { success: true, data: [] };
            },
            status: 200
        });

        // Undefine and reload with null/undefined config
        require.undef('taoQtiItem/qtiCreator/helper/languages');
        // Setting config to undefined effectively means module.config() returns {}
        require.config({
            config: {
                'taoQtiItem/qtiCreator/helper/languages': undefined
            }
        });

        require(['taoQtiItem/qtiCreator/helper/languages'], function (langModule) {
            langModule
                .getList()
                .then(function () {
                    assert.ok(capturedUrl, 'AJAX request was made');
                    assert.equal(
                        capturedUrl,
                        expectedFallbackUrl,
                        'languagesUrl equals urlUtil.route fallback when config is null/undefined'
                    );
                })
                .catch(function (err) {
                    assert.ok(false, 'getList() failed: ' + err);
                })
                .finally(function () {
                    $.mockjax.clear();
                    done();
                });
        });
    });
});
