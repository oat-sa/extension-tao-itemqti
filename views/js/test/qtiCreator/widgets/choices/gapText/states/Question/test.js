define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/choices/gapText/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor'
], function ($, GapTextQuestionState, htmlEditor) {
    'use strict';

    QUnit.module('qtiCreator/widgets/choices/gapText/states/Question', function (hooks) {
        let originalHasEditor;
        let originalBuildEditor;

        hooks.beforeEach(function () {
            originalHasEditor = htmlEditor.hasEditor;
            originalBuildEditor = htmlEditor.buildEditor;
        });

        hooks.afterEach(function () {
            htmlEditor.hasEditor = originalHasEditor;
            htmlEditor.buildEditor = originalBuildEditor;
        });

        QUnit.test('editor enables maths and shields inner math widgets', function (assert) {
            let capturedOptions;
            const $container = $('<div><div data-html-editable="true"></div></div>');
            const widget = {
                element: {
                    getBody: function () {
                        return {};
                    }
                },
                $container: $container,
                interaction: {
                    getNextPlaceholder: function () {
                        return 'placeholder';
                    }
                },
                changeState: function () {}
            };

            htmlEditor.hasEditor = function () {
                return false;
            };
            htmlEditor.buildEditor = function ($editableContainer, options) {
                capturedOptions = options;
            };

            GapTextQuestionState.prototype.buildEditor.call({
                widget: widget
            });

            assert.expect(3);
            assert.ok(capturedOptions, 'editor options are passed to htmlEditor');
            assert.notStrictEqual(capturedOptions.mathJax, false, 'mathJax is not disabled, so the maths button is available');
            assert.notStrictEqual(
                capturedOptions.shieldInnerContent,
                false,
                'inner content is shielded, so existing math widgets can be activated'
            );
        });
    });
});
