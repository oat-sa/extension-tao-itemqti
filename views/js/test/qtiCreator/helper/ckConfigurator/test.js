/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
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

    QUnit.module('ckConfigurator WProofreader merge');

    QUnit.test('supplied WProofreader key is merged into the editor config', function (assert) {
        assert.expect(2);
        withCkeditorStub(function () {
            var expected = wproofreaderBootstrap.getCkeditorConfig().disableNativeSpellChecker;
            assert.strictEqual(typeof expected, 'boolean', 'provider supplies the key');
            var config = qtiCkConfigurator.getConfig(editorStub, 'inline', {});
            assert.strictEqual(
                config.disableNativeSpellChecker,
                expected,
                'merged value matches the provider config'
            );
        });
    });

    QUnit.test('unrelated defaults and custom options survive the merge', function (assert) {
        assert.expect(3);
        withCkeditorStub(function () {
            var config = qtiCkConfigurator.getConfig(editorStub, 'qtiInline', { customFlag: 42 });
            assert.strictEqual(config.customFlag, 42, 'custom option passes through');
            assert.strictEqual(config.allowedContent, true, 'core qti config intact');
            assert.strictEqual(config.autoParagraph, false, 'core qti config intact');
        });
    });

    QUnit.test('explicit options take precedence over the merged WProofreader key', function (assert) {
        assert.expect(2);
        withCkeditorStub(function () {
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
