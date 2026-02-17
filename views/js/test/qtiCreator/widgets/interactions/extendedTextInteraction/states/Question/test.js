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
 */

define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/extendedText',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods'
], function ($, _, formTpl, itemScrollingMethods) {
    'use strict';

    QUnit.module('qtiCreator/widgets/interactions/extendedTextInteraction/states/Question - scrolling tpl vars');

    function assertOptionSelected(assert, options, expectedValue, message) {
        const selected = options.filter(o => o.selected);
        assert.strictEqual(selected.length, 1, `${message} - exactly one option selected`);
        assert.strictEqual(selected[0].value, expectedValue, `${message} - selected option value`);
    }

    QUnit.test('getTplVars returns correct defaults (horizontal scenario) and template renders expected labels/options', function (assert) {
        assert.expect(12);


        // horizontal writing mode scenario: defaultValue should be used when wrapper has no data-scrolling-height
        const $interaction = $('<div class="qti-interaction" />');

        const tplVars = itemScrollingMethods.getTplVars($interaction, '75');

        assert.ok(Array.isArray(tplVars.scrollingHeights), 'scrollingHeights is an array');
        assert.ok(Array.isArray(tplVars.scrollingWidths), 'scrollingWidths is an array');
        assert.strictEqual(tplVars.scrollingHeights.length, 6, 'scrollingHeights contains 6 options');
        assert.strictEqual(tplVars.scrollingWidths.length, 6, 'scrollingWidths contains 6 options');
        assertOptionSelected(assert, tplVars.scrollingHeights, '75', 'horizontal - heights');
        assertOptionSelected(assert, tplVars.scrollingWidths, '75', 'horizontal - widths');

        const html = formTpl(
            _.extend(
                {
                    formats: {
                        plain: { label: 'Plain text', selected: true },
                        xhtml: { label: 'Rich text', selected: false }
                    },
                    editorType: 'classic',
                    editorTypes: {
                        classic: { label: 'Classic', selected: true },
                        document: { label: 'Document', selected: false }
                    },
                    toolbarGroupWhenFull: false,
                    patternMask: '',
                    maxWords: NaN,
                    maxLength: NaN,
                    expectedLength: NaN,
                    expectedLines: NaN,
                    constraints: {
                        none: { label: 'None', selected: true },
                        maxLength: { label: 'Max Length', selected: false },
                        maxWords: { label: 'Max Words', selected: false },
                        pattern: { label: 'Pattern', selected: false }
                    },
                    constraintsAvailable: true
                },
                tplVars
            )
        );

        const $dom = $('<div />').html(html);

        // positive: writing mode labels exist
        assert.ok($dom.text().includes('Direction of writing'), 'template includes writing mode section label');
        assert.ok($dom.text().includes('Horizontal text'), 'template includes horizontal label');
        assert.ok($dom.text().includes('Vertical text'), 'template includes vertical label');

        // positive: options contain the expected names
        assert.ok($dom.text().includes('3/4 of height'), 'template includes "3/4 of height" option label');
    });

    QUnit.test('getTplVars uses wrapper data-scrolling-height (vertical scenario) and rendered form reflects it via selected option', function (assert) {
        assert.expect(8);


        // vertical writing mode scenario: wrapper has height set (simulates vertical/horizontal orientation fixture)
        const $interaction = $('<div class="qti-interaction" data-scrolling-height="50" />');

        const tplVars = itemScrollingMethods.getTplVars($interaction, '75');
        assertOptionSelected(assert, tplVars.scrollingHeights, '50', 'vertical fixture - heights');
        assertOptionSelected(assert, tplVars.scrollingWidths, '50', 'vertical fixture - widths');

        const html = formTpl(
            _.extend(
                {
                    formats: {
                        plain: { label: 'Plain text', selected: true },
                        xhtml: { label: 'Rich text', selected: false }
                    },
                    editorType: 'classic',
                    editorTypes: {
                        classic: { label: 'Classic', selected: true },
                        document: { label: 'Document', selected: false }
                    },
                    toolbarGroupWhenFull: false,
                    patternMask: '',
                    maxWords: NaN,
                    maxLength: NaN,
                    expectedLength: NaN,
                    expectedLines: NaN,
                    constraints: {
                        none: { label: 'None', selected: true },
                        maxLength: { label: 'Max Length', selected: false },
                        maxWords: { label: 'Max Words', selected: false },
                        pattern: { label: 'Pattern', selected: false }
                    },
                    constraintsAvailable: true
                },
                tplVars
            )
        );

        const $dom = $('<div />').html(html);

        // positive: the selected option value should be present for the scrolling height select as selected="selected"
        assert.ok(/value=\"50\"[^>]*selected=\"selected\"/.test(html), 'rendered HTML selects value 50');

        // negative case: it should NOT select the default 75 anymore
        assert.notOk(/value=\"75\"[^>]*selected=\"selected\"/.test(html), 'rendered HTML does not select default 75');

        // ensure writing mode inputs exist even if not checked by the test fixture
        assert.strictEqual($dom.find('input[name="writingMode"][value="horizontal"]').length, 1, 'horizontal writingMode input exists');
        assert.strictEqual($dom.find('input[name="writingMode"][value="vertical"]').length, 1, 'vertical writingMode input exists');
    });

    QUnit.test('writingModeInitialScrollingHeight defaultValue is applied when wrapper has no initial height (negative - no forced vertical scrolling)', function (assert) {
        assert.expect(4);


        const $interaction = $('<div class="qti-interaction" />');
        const tplVars = itemScrollingMethods.getTplVars($interaction, '25');

        // positive: initial height applied
        assertOptionSelected(assert, tplVars.scrollingHeights, '25', 'initial height applied');

        // negative: should not magically select something else
        const hasSelected50 = tplVars.scrollingHeights.some(o => o.value === '50' && o.selected);
        assert.notOk(hasSelected50, 'does not select an unrelated option (50)');

        // sanity: still provides both vars required by formTpl
        assert.ok(tplVars.scrollingWidths.length > 0, 'scrollingWidths provided');
    });
});
