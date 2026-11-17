define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/states/Question',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor'
], function ($, InlineChoiceQuestionState, formElement, htmlEditor) {
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

        QUnit.test('initShufflePinToggle skips when interaction is missing', function (assert) {
            const $container = $(
                '<div class="qti-choice">' +
                    '<span data-role="shuffle-pin" class="icon-shuffle"></span>' +
                '</div>'
            );

            assert.expect(1);
            formElement.initShufflePinToggle({
                $container: $container,
                element: {
                    getInteraction: function () {
                        return null;
                    }
                },
                on: function () {
                    throw new Error('should not subscribe to attributeChange');
                }
            });
            assert.ok(true, 'returns without throwing when interaction is missing');
        });

        function initDeleteWidget(options) {
            const $container = $('<tr class="qti-choice widget-inlineChoice"></tr>');
            $container.addClass(options.containerClass);
            $container.append(options.toolbarHtml);
            let changeStateArg;
            const widget = {
                $container: $container,
                element: {
                    serial: options.choiceSerial
                },
                changeState: function (state) {
                    changeStateArg = state;
                }
            };

            formElement.initDelete(widget);

            return {
                widget: widget,
                getChangeState: function () {
                    return changeStateArg;
                },
                triggerDeleteMousedown: function () {
                    $container.find('[data-role="delete"]').trigger('mousedown');
                }
            };
        }

        QUnit.test('initDelete deletes the choice from edit-question row toolbar', function (assert) {
            const harness = initDeleteWidget({
                containerClass: 'edit-question',
                choiceSerial: 'choice-1',
                toolbarHtml:
                    '<td class="mini-tlb">' +
                        '<span data-role="delete" class="icon-bin"></span>' +
                    '</td>'
            });

            harness.triggerDeleteMousedown();
            assert.strictEqual(harness.getChangeState(), 'deleting');
        });

        QUnit.test('initDelete ignores delete on another widget toolbar', function (assert) {
            const harness = initDeleteWidget({
                containerClass: 'edit-question',
                choiceSerial: 'choice-1',
                toolbarHtml:
                    '<td class="mini-tlb" data-for="other-serial">' +
                        '<span data-role="delete" class="icon-bin"></span>' +
                    '</td>'
            });

            harness.triggerDeleteMousedown();
            assert.strictEqual(harness.getChangeState(), undefined);
        });

        QUnit.test('createToolbar skips binding when interaction is missing', function (assert) {
            const $container = $('<tr class="qti-choice"><td></td><td class="mini-tlb"></td></tr>');
            const widget = {
                $container: $container,
                element: {
                    serial: 'choice-1',
                    getInteraction: function () {
                        return null;
                    }
                }
            };

            InlineChoiceQuestionState.prototype.createToolbar.call({ widget: widget });
            assert.strictEqual($container.data('inlineChoiceToolbarBound'), undefined);
        });

        QUnit.test('createToolbar binds once and can bind again after marker reset', function (assert) {
            const $container = $(
                '<tr class="qti-choice">' +
                    '<td></td>' +
                    '<td class="mini-tlb"><span data-role="delete" class="icon-bin"></span></td>' +
                '</tr>'
            );
            const widget = {
                $container: $container,
                element: {
                    serial: 'choice-1',
                    getInteraction: function () {
                        return { attr: function () {}, serial: 'interaction-1' };
                    }
                }
            };
            let deleteClicks = 0;
            const originalInitDelete = formElement.initDelete;
            formElement.initDelete = function () {
                deleteClicks++;
                originalInitDelete.apply(this, arguments);
            };

            try {
                InlineChoiceQuestionState.prototype.createToolbar.call({ widget: widget });
                assert.ok($container.data('inlineChoiceToolbarBound'), 'first createToolbar binds toolbar');
                assert.strictEqual(deleteClicks, 1, 'initDelete runs on first bind');

                InlineChoiceQuestionState.prototype.createToolbar.call({ widget: widget });
                assert.strictEqual(deleteClicks, 1, 'initDelete does not run again while marker is set');

                $container.removeData('inlineChoiceToolbarBound');
                InlineChoiceQuestionState.prototype.createToolbar.call({ widget: widget });
                assert.strictEqual(deleteClicks, 2, 'initDelete runs again after marker reset');
            } finally {
                formElement.initDelete = originalInitDelete;
            }
        });

        QUnit.test('editor enables maths and shields inner math widgets', function (assert) {
            let capturedOptions;
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

            htmlEditor.hasEditor = function () {
                return false;
            };
            htmlEditor.buildEditor = function ($editableContainer, options) {
                capturedOptions = options;
            };

            InlineChoiceQuestionState.prototype.buildEditor.call({
                widget: widget
            });

            assert.expect(3);
            assert.ok(capturedOptions, 'editor options are passed to htmlEditor');
            assert.notStrictEqual(capturedOptions.mathJax, false, 'mathJax is not disabled, so the maths button is available');
            assert.strictEqual(capturedOptions.shieldInnerContent, true, 'inner content is shielded, so existing math widgets can be activated');
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
