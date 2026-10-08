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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */

define([
    'taoQtiItem/qtiCreator/helper/ckConfigurator',
    'tao/ckeditor/wproofreaderBootstrap'
], function (qtiCkConfigurator, wproofreaderBootstrap) {
    'use strict';

    var editorStub = {
        on: function () {}
    };

    function withCkeditorStub(run) {
        var hadCkeditor = 'CKEDITOR' in window;
        var original = window.CKEDITOR;
        window.CKEDITOR = {
            on: function () {}
        };
        try {
            run();
        } finally {
            if (hadCkeditor) {
                window.CKEDITOR = original;
            } else {
                delete window.CKEDITOR;
            }
        }
    }

    function withWproofreaderStartStub(run) {
        var originalStart = wproofreaderBootstrap.start;
        wproofreaderBootstrap.start = function () {};
        try {
            run();
        } finally {
            wproofreaderBootstrap.start = originalStart;
        }
    }

    function withEditorStubs(run) {
        withWproofreaderStartStub(function () {
            withCkeditorStub(run);
        });
    }

    QUnit.module('ckConfigurator WProofreader merge');

    QUnit.test('native spellcheck remains enabled until WProofreader starts', function (assert) {
        assert.expect(3);
        withEditorStubs(function () {
            assert.strictEqual(wproofreaderBootstrap.enabled, true, 'service ID enables WProofreader');
            var expected = wproofreaderBootstrap.getCkeditorConfig().disableNativeSpellChecker;
            assert.strictEqual(expected, false, 'native spellcheck stays enabled');
            var config = qtiCkConfigurator.getConfig(editorStub, 'inline', {});
            assert.strictEqual(
                config.disableNativeSpellChecker,
                expected,
                'merged value matches the provider config'
            );
        });
    });

    QUnit.test('starts WProofreader when configuring a QTI editor', function (assert) {
        var originalStart = wproofreaderBootstrap.start;
        var startCalls = 0;

        assert.expect(1);
        wproofreaderBootstrap.start = function () {
            startCalls++;
        };
        withCkeditorStub(function () {
            try {
                qtiCkConfigurator.getConfig(editorStub, 'inline', {});
                assert.strictEqual(startCalls, 1, 'provider startup is tied to editor configuration');
            } finally {
                wproofreaderBootstrap.start = originalStart;
            }
        });
    });

    QUnit.test('unrelated defaults and custom options survive the merge', function (assert) {
        assert.expect(3);
        withEditorStubs(function () {
            var config = qtiCkConfigurator.getConfig(editorStub, 'qtiInline', { customFlag: 42 });
            assert.strictEqual(config.customFlag, 42, 'custom option passes through');
            assert.strictEqual(config.allowedContent, true, 'core qti config intact');
            assert.strictEqual(config.autoParagraph, false, 'core qti config intact');
        });
    });

    QUnit.test('explicit options take precedence over the merged WProofreader key', function (assert) {
        assert.expect(2);
        withEditorStubs(function () {
            var merged = wproofreaderBootstrap.getCkeditorConfig().disableNativeSpellChecker;
            assert.strictEqual(typeof merged, 'boolean', 'provider supplies the key');
            var config = qtiCkConfigurator.getConfig(editorStub, 'inline', {
                disableNativeSpellChecker: !merged
            });
            assert.strictEqual(
                config.disableNativeSpellChecker,
                !merged,
                'explicit option wins over the merged default'
            );
        });
    });
});
