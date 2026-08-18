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
});
