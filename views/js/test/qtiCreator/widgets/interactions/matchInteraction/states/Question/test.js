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
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/match'
], function($, QuestionState, formTpl) {
    'use strict';

    QUnit.module('qtiCreator/widgets/interactions/matchInteraction/states/Question');

    QUnit.test('normalizeClass keeps exactly one tabular mode and strips choices position', function(assert) {
        assert.expect(3);

        const className = QuestionState.prototype.normalizeClass(
            'custom qti-match-non-tabular qti-choices-bottom another',
            'qti-match-tabular'
        );

        assert.strictEqual(className, 'custom another qti-match-tabular', 'tabular mode preserves unrelated classes');
        assert.strictEqual(QuestionState.prototype.getMode(className), 'qti-match-tabular', 'tabular mode is detected');
        assert.strictEqual(QuestionState.prototype.getPosition(className), null, 'position is removed for tabular mode');
    });

    QUnit.test('normalizeClass keeps exactly one non-tabular mode and defaults position to top', function(assert) {
        assert.expect(3);

        const className = QuestionState.prototype.normalizeClass('custom qti-match-tabular', 'qti-match-non-tabular');

        assert.strictEqual(
            className,
            'custom qti-match-non-tabular qti-choices-top',
            'non-tabular mode defaults to choices top'
        );
        assert.strictEqual(QuestionState.prototype.getMode(className), 'qti-match-non-tabular', 'non-tabular mode is detected');
        assert.strictEqual(QuestionState.prototype.getPosition(className), 'top', 'default position is detected');
    });

    QUnit.test('normalizeClass replaces existing choices position with selected position', function(assert) {
        assert.expect(2);

        const className = QuestionState.prototype.normalizeClass(
            'qti-match-non-tabular qti-choices-top preserved',
            'qti-match-non-tabular',
            'right'
        );

        assert.strictEqual(
            className,
            'preserved qti-match-non-tabular qti-choices-right',
            'selected position replaces previous position'
        );
        assert.strictEqual(QuestionState.prototype.getPosition(className), 'right', 'selected position is detected');
    });

    QUnit.test('match form exposes display mode and conditional position controls', function(assert) {
        assert.expect(8);

        const html = formTpl({
            shuffle: true,
            nonTabular: true,
            position: 'left',
            enabledFeatures: {
                shuffleChoices: true
            }
        });
        const $dom = $('<div />').html(html);

        assert.strictEqual($dom.find('input[name="displayMode"]').length, 2, 'display mode radio group exists');
        assert.strictEqual($dom.find('input[name="position"]').length, 4, 'position radio group exists');
        assert.strictEqual(
            $dom.find('input[name="displayMode"][value="qti-match-non-tabular"]').is('[checked]'),
            true,
            'non-tabular mode is checked'
        );
        assert.strictEqual(
            $dom.find('input[name="position"][value="left"]').is('[checked]'),
            true,
            'selected position is checked'
        );
        assert.strictEqual($dom.find('.match-non-tabular-info').length, 1, 'non-tabular info message exists');
        assert.ok($dom.text().includes('Non-tabular uses choices and buckets'), 'display mode tooltip content exists');
        assert.strictEqual($dom.find('.min-max-panel').length, 1, 'min-max panel remains available');
        assert.strictEqual($dom.find('input[name="shuffle"]').length, 1, 'shuffle control remains available');
    });
});
