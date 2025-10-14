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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA
 */

/**
 * Unit tests for the rubyTagCleaner helper module
 */
define([
    'taoQtiItem/qtiCreator/helper/rubyTagCleaner'
], function(rubyTagCleaner) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.expect(2);

        assert.ok(typeof rubyTagCleaner === 'object', 'The module exposes an object');
        assert.ok(typeof rubyTagCleaner.clean === 'function', 'The module has clean method');
    });

    QUnit.module('clean');

    QUnit.test('handles null/undefined input', function(assert) {
        assert.expect(3);

        assert.equal(rubyTagCleaner.clean(null), null, 'handles null input');
        assert.equal(rubyTagCleaner.clean(undefined), undefined, 'handles undefined input');
        assert.equal(rubyTagCleaner.clean(''), '', 'handles empty string input');
    });

    QUnit.test('preserves content without ruby tags', function(assert) {
        assert.expect(2);

        const plainText = 'This is plain text without ruby tags.';
        const htmlContent = '<p>This is <strong>HTML</strong> content without ruby tags.</p>';

        assert.equal(rubyTagCleaner.clean(plainText), plainText, 'preserves plain text');
        assert.equal(rubyTagCleaner.clean(htmlContent), htmlContent, 'preserves HTML content without ruby');
    });

    QUnit.test('removes empty ruby tags with no rt element', function(assert) {
        assert.expect(2);

        const input1 = '<qh5:ruby><qh5:rb>word</qh5:rb></qh5:ruby>';
        const expected1 = 'word';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'removes qh5:ruby with no rt element');

        const input2 = '<ruby><rb>word</rb></ruby>';
        const expected2 = 'word';
        assert.equal(rubyTagCleaner.clean(input2), expected2, 'removes standard ruby with no rt element');
    });

    QUnit.test('removes empty ruby tags with empty rt elements', function(assert) {
        assert.expect(6);

        const input1 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt></qh5:rt></qh5:ruby>';
        const expected1 = 'word';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'removes ruby with empty rt');

        const input2 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>   </qh5:rt></qh5:ruby>';
        const expected2 = 'word';
        assert.equal(rubyTagCleaner.clean(input2), expected2, 'removes ruby with whitespace-only rt');

        const input3 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>&nbsp;</qh5:rt></qh5:ruby>';
        const expected3 = 'word';
        assert.equal(rubyTagCleaner.clean(input3), expected3, 'removes ruby with non-breaking space rt');

        // Test multiple non-breaking spaces
        const input4 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>&nbsp;&nbsp;</qh5:rt></qh5:ruby>';
        const expected4 = 'word';
        assert.equal(rubyTagCleaner.clean(input4), expected4, 'removes ruby with multiple non-breaking spaces rt');

        // Test zero-width space
        const input5 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>\u200B</qh5:rt></qh5:ruby>';
        const expected5 = 'word';
        assert.equal(rubyTagCleaner.clean(input5), expected5, 'removes ruby with zero-width space rt');

        // Test ideographic space
        const input6 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>\u3000</qh5:rt></qh5:ruby>';
        const expected6 = 'word';
        assert.equal(rubyTagCleaner.clean(input6), expected6, 'removes ruby with ideographic space rt');
    });

    QUnit.test('preserves valid ruby tags with content', function(assert) {
        assert.expect(3);

        const input1 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt>reading</qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(input1), input1, 'preserves ruby with valid furigana');

        const input2 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt> reading </qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(input2), input2, 'preserves ruby with furigana that has spaces');

        const input3 = '<ruby><rb>word</rb><rt>reading</rt></ruby>';
        assert.equal(rubyTagCleaner.clean(input3), input3, 'preserves standard ruby with valid furigana');
    });

    QUnit.test('handles mixed content correctly', function(assert) {
        assert.expect(2);

        const input1 = 'Before <qh5:ruby><qh5:rb>word1</qh5:rb><qh5:rt>reading1</qh5:rt></qh5:ruby> middle <qh5:ruby><qh5:rb>word2</qh5:rb></qh5:ruby> after';
        const expected1 = 'Before <qh5:ruby><qh5:rb>word1</qh5:rb><qh5:rt>reading1</qh5:rt></qh5:ruby> middle word2 after';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'preserves valid ruby and removes empty ruby');

        const input2 = '<qh5:ruby><qh5:rb>valid</qh5:rb><qh5:rt>123</qh5:rt></qh5:ruby> <qh5:ruby><qh5:rb>empty</qh5:rb><qh5:rt></qh5:rt></qh5:ruby>';
        const expected2 = '<qh5:ruby><qh5:rb>valid</qh5:rb><qh5:rt>123</qh5:rt></qh5:ruby> empty';
        assert.equal(rubyTagCleaner.clean(input2), expected2, 'mixed valid and empty ruby tags');
    });

    QUnit.test('handles multiple empty ruby tags', function(assert) {
        assert.expect(2);

        const input1 = '<qh5:ruby><qh5:rb>word1</qh5:rb></qh5:ruby><qh5:ruby><qh5:rb>word2</qh5:rb></qh5:ruby>';
        const expected1 = 'word1word2';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'removes multiple consecutive empty ruby tags');

        const input2 = '<qh5:ruby><qh5:rb>one</qh5:rb><qh5:rt>   </qh5:rt></qh5:ruby> text <qh5:ruby><qh5:rb>two</qh5:rb><qh5:rt>&nbsp;</qh5:rt></qh5:ruby>';
        const expected2 = 'one text two';
        assert.equal(rubyTagCleaner.clean(input2), expected2, 'removes multiple separated empty ruby tags');
    });

    QUnit.test('handles ruby with complex HTML content', function(assert) {
        assert.expect(2);

        const input1 = '<p><qh5:ruby><qh5:rb><strong>word</strong></qh5:rb><qh5:rt></qh5:rt></qh5:ruby></p>';
        const expected1 = '<p>word</p>';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'handles ruby with HTML in rb element');

        const input2 = '<div>Start <qh5:ruby><qh5:rb><em>emphasized</em></qh5:rb><qh5:rt>reading</qh5:rt></qh5:ruby> end</div>';
        assert.equal(rubyTagCleaner.clean(input2), input2, 'preserves valid ruby with HTML in rb element');
    });

    QUnit.test('handles edge cases', function(assert) {
        assert.expect(3);

        // Ruby with no rb element
        const input1 = '<qh5:ruby><qh5:rt>orphan</qh5:rt></qh5:ruby>';
        const expected1 = '';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'removes ruby with no rb element');

        // Completely empty ruby
        const input2 = '<qh5:ruby></qh5:ruby>';
        const expected2 = '';
        assert.equal(rubyTagCleaner.clean(input2), expected2, 'removes completely empty ruby');

        // Ruby with multiple rt elements (some empty, some not)
        const input3 = '<qh5:ruby><qh5:rb>word</qh5:rb><qh5:rt></qh5:rt><qh5:rt>reading</qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(input3), input3, 'preserves ruby with mixed empty and non-empty rt elements');
    });

    QUnit.test('handles multiple rb siblings correctly', function(assert) {
        assert.expect(3);

        // Multiple rb elements with empty rt - should concatenate all rb content
        const input1 = '<qh5:ruby><qh5:rb>wo</qh5:rb><qh5:rb>rd</qh5:rb><qh5:rt>   </qh5:rt></qh5:ruby>';
        const expected1 = 'word';
        assert.equal(rubyTagCleaner.clean(input1), expected1, 'concatenates multiple rb siblings when rt is empty');

        // Multiple rb elements with valid rt - should preserve entire structure
        const input2 = '<qh5:ruby><qh5:rb>wo</qh5:rb><qh5:rb>rd</qh5:rb><qh5:rt>reading</qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(input2), input2, 'preserves ruby with multiple rb siblings and valid rt');

        // Multiple rb elements with multiple NBSP in rt - should concatenate rb content
        const input3 = '<qh5:ruby><qh5:rb>hel</qh5:rb><qh5:rb>lo</qh5:rb><qh5:rt>&nbsp;&nbsp;&nbsp;</qh5:rt></qh5:ruby>';
        const expected3 = 'hello';
        assert.equal(rubyTagCleaner.clean(input3), expected3, 'concatenates multiple rb siblings when rt has multiple NBSP');
    });

    QUnit.test('real world scenarios', function(assert) {
        assert.expect(3);

        // Scenario from the bug report
        const scenario1 = 'abc <qh5:ruby><qh5:rb>def</qh5:rb><qh5:rt> 1234 </qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(scenario1), scenario1, 'preserves valid furigana from bug report example');

        // Two words both with ruby (from bug report)
        const scenario2 = '<qh5:ruby><qh5:rb>abc</qh5:rb><qh5:rt> 345 </qh5:rt></qh5:ruby> <qh5:ruby><qh5:rb>def</qh5:rb><qh5:rt> 1234 </qh5:rt></qh5:ruby>';
        assert.equal(rubyTagCleaner.clean(scenario2), scenario2, 'preserves multiple valid furigana tags');

        // User accidentally creates empty ruby
        const scenario3 = 'word1 <qh5:ruby><qh5:rb>word2</qh5:rb><qh5:rt></qh5:rt></qh5:ruby> word3';
        const expected3 = 'word1 word2 word3';
        assert.equal(rubyTagCleaner.clean(scenario3), expected3, 'cleans up accidentally created empty ruby');
    });
});
