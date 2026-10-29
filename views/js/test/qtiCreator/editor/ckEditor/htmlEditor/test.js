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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA
 */

define(['jquery', 'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor'], function ($, htmlEditor) {
    'use strict';

    function createFakeEditor(readOnly, onFocus) {
        const editableHost = {
            $: {
                parentNode: {}
            }
        };

        return {
            readOnly: readOnly,
            setReadOnlyCalls: [],
            setReadOnly: function (value) {
                this.setReadOnlyCalls.push(value);
                this.readOnly = value;
            },
            editable: function () {
                return editableHost;
            },
            focus: onFocus,
            createRange: function () {
                return {
                    moveToElementEditablePosition: function () {}
                };
            },
            getSelection: function () {
                return {
                    selectRanges: function () {}
                };
            }
        };
    }

    QUnit.module('restoreEditableThenFocus');

    QUnit.test('destroy cancels a queued editor change while preserving the final flush', function (assert) {
        const done = assert.async();
        const $container = $(
            '<div data-html-editable-container="true">' +
                '<div data-html-editable="true">Keep this content</div></div>'
        ).appendTo('#qunit-fixture');
        let changes = 0;

        htmlEditor.buildEditor($container, {
            autofocus: false,
            shieldInnerContent: false,
            change: function () {
                changes++;
            }
        }).then(function () {
            const editor = $container.find('[data-html-editable]').data('editor');
            editor.fire('change');
            editor.fire('change');
            const beforeDestroy = changes;

            return htmlEditor.destroyEditor($container).then(function () {
                assert.strictEqual(editor.status, 'destroyed', 'the real editor was destroyed');
                assert.ok(changes > beforeDestroy, 'the final content flush still ran');
                const afterDestroy = changes;

                setTimeout(function () {
                    assert.strictEqual(changes, afterDestroy, 'no queued change runs after destruction');
                    done();
                }, 200);
            });
        }).catch(function (error) {
            assert.ok(false, error.message);
            done();
        });
    });

    QUnit.test('readOnly true: restores contenteditable before _focus', function (assert) {
        assert.expect(4);

        const $editable = $('<div contenteditable="false"></div>');
        let focused = false;
        const editor = createFakeEditor(true, function () {
            focused = true;
            assert.strictEqual(
                $editable.attr('contenteditable'),
                'true',
                'contenteditable is true before focus runs'
            );
            assert.deepEqual(this.setReadOnlyCalls, [false], 'setReadOnly(false) ran before focus');
        });

        htmlEditor.restoreEditableThenFocus(editor, $editable, true);

        assert.ok(focused, 'focus ran');
        assert.strictEqual(editor.readOnly, false, 'editor left readOnly');
    });

    QUnit.test('readOnly false: still restores contenteditable before _focus', function (assert) {
        assert.expect(4);

        const $editable = $('<div contenteditable="false"></div>');
        let focused = false;
        const editor = createFakeEditor(false, function () {
            focused = true;
            assert.strictEqual(
                $editable.attr('contenteditable'),
                'true',
                'contenteditable is true before focus runs'
            );
            assert.deepEqual(this.setReadOnlyCalls, [], 'setReadOnly is not called when already editable');
        });

        htmlEditor.restoreEditableThenFocus(editor, $editable, true);

        assert.ok(focused, 'focus ran');
        assert.strictEqual(editor.readOnly, false, 'editor stays writable');
    });

    QUnit.test('autofocus false, readOnly true: restores contenteditable without _focus', function (assert) {
        assert.expect(4);

        const $editable = $('<div contenteditable="false"></div>');
        let focused = false;
        const editor = createFakeEditor(true, function () {
            focused = true;
        });

        htmlEditor.restoreEditableThenFocus(editor, $editable, false);

        assert.notOk(focused, 'focus did not run');
        assert.strictEqual($editable.attr('contenteditable'), 'true', 'contenteditable is restored to true');
        assert.deepEqual(editor.setReadOnlyCalls, [false], 'setReadOnly(false) ran');
        assert.strictEqual(editor.readOnly, false, 'editor left readOnly');
    });

    QUnit.test('autofocus false, readOnly false: restores contenteditable without _focus', function (assert) {
        assert.expect(4);

        const $editable = $('<div contenteditable="false"></div>');
        let focused = false;
        const editor = createFakeEditor(false, function () {
            focused = true;
        });

        htmlEditor.restoreEditableThenFocus(editor, $editable, false);

        assert.notOk(focused, 'focus did not run');
        assert.strictEqual($editable.attr('contenteditable'), 'true', 'contenteditable is restored to true');
        assert.deepEqual(editor.setReadOnlyCalls, [], 'setReadOnly is not called when already editable');
        assert.strictEqual(editor.readOnly, false, 'editor stays writable');
    });
});
