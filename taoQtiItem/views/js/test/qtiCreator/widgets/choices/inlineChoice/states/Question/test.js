define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/states/Question',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor'
], function ($, InlineChoiceQuestionState, htmlEditor) {
    'use strict';

    QUnit.module('qtiCreator/widgets/choices/inlineChoice/states/Question', function (hooks) {
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

        function getKeyHandler(assert) {
            const $container = $(
                '<div>' +
                    '<div class="editable-container">' +
                        '<div class="editable-content"></div>' +
                    '</div>' +
                '</div>'
            );
            const widget = {
                element: {
                    getBody: function () {
                        return {};
                    }
                },
                $container: $container,
                changeState: function () {}
            };
            let keyHandler;

            htmlEditor.hasEditor = function () {
                return false;
            };
            htmlEditor.buildEditor = function ($editableContainer, options) {
                assert.strictEqual($editableContainer[0], $container.find('.editable-container')[0], 'editor is built on the editable container');
                keyHandler = options.on.key;
            };

            InlineChoiceQuestionState.prototype.buildEditor.call({
                widget: widget
            });

            assert.strictEqual(typeof keyHandler, 'function', 'keyboard handler is registered');

            return keyHandler;
        }

        function createEditorEvent(key, modifier) {
            let preventDefaultCalls = 0;
            let cancelCalls = 0;
            const domEvent = {
                key: key,
                ctrlKey: modifier === 'ctrl',
                metaKey: modifier === 'meta',
                preventDefault: function () {
                    preventDefaultCalls++;
                }
            };

            return {
                event: {
                    data: {
                        domEvent: {
                            $: domEvent
                        }
                    },
                    cancel: function () {
                        cancelCalls++;
                    }
                },
                getPreventDefaultCalls: function () {
                    return preventDefaultCalls;
                },
                getCancelCalls: function () {
                    return cancelCalls;
                }
            };
        }

        QUnit.test('blocked Ctrl and Meta shortcuts prevent the default action', function (assert) {
            const keyHandler = getKeyHandler(assert);
            const blockedShortcuts = [
                { key: 'b', modifier: 'ctrl', label: 'Ctrl+B' },
                { key: 'i', modifier: 'ctrl', label: 'Ctrl+I' },
                { key: 'u', modifier: 'ctrl', label: 'Ctrl+U' },
                { key: 'k', modifier: 'ctrl', label: 'Ctrl+K' },
                { key: 'l', modifier: 'ctrl', label: 'Ctrl+L' },
                { key: 'L', modifier: 'ctrl', label: 'Ctrl+Shift+L' },
                { key: 'l', modifier: 'meta', label: 'Meta+L' },
                { key: 'L', modifier: 'meta', label: 'Meta+Shift+L' }
            ];

            assert.expect(19);

            blockedShortcuts.forEach(function (shortcut) {
                const editorEvent = createEditorEvent(shortcut.key, shortcut.modifier);

                keyHandler(editorEvent.event);

                assert.strictEqual(editorEvent.getPreventDefaultCalls(), 1, shortcut.label + ' calls preventDefault');
                assert.strictEqual(editorEvent.getCancelCalls(), 1, shortcut.label + ' cancels the editor event');
            });

            const nonBlockedShortcut = createEditorEvent('p', 'ctrl');
            keyHandler(nonBlockedShortcut.event);
            assert.strictEqual(nonBlockedShortcut.getPreventDefaultCalls(), 0, 'Ctrl+P does not call preventDefault');
        });

        QUnit.test('non-blocked shortcuts do not prevent default', function (assert) {
            const keyHandler = getKeyHandler(assert);
            const shortcuts = [
                { key: 'p', modifier: 'ctrl', label: 'Ctrl+P' },
                { key: 'z', modifier: 'meta', label: 'Meta+Z' },
                { key: '1', modifier: 'ctrl', label: 'Ctrl+1' },
                { key: 'Escape', modifier: 'meta', label: 'Meta+Escape' }
            ];

            assert.expect(11);

            shortcuts.forEach(function (shortcut) {
                const editorEvent = createEditorEvent(shortcut.key, shortcut.modifier);

                keyHandler(editorEvent.event);

                assert.strictEqual(editorEvent.getPreventDefaultCalls(), 0, shortcut.label + ' does not call preventDefault');
                assert.strictEqual(editorEvent.getCancelCalls(), 0, shortcut.label + ' does not cancel the editor event');
            });

            const blockedShortcut = createEditorEvent('l', 'ctrl');
            keyHandler(blockedShortcut.event);
            assert.strictEqual(blockedShortcut.getPreventDefaultCalls(), 1, 'Ctrl+L still calls preventDefault');
        });
    });
});
