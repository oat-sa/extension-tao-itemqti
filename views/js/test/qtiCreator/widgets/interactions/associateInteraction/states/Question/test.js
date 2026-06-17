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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

define(['taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Question'], function (
    AssociateInteractionStateQuestion
) {
    'use strict';

    QUnit.module('associateInteraction question state');

    QUnit.test('normalizes choices position classes', function (assert) {
        assert.expect(4);

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('foo qti-choices-left bar', 'right'),
            'foo bar qti-choices-right',
            'replaces an existing choices position and preserves unrelated classes'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('qti-choices-top qti-choices-bottom custom', 'left'),
            'custom qti-choices-left',
            'collapses multiple choices positions to one class'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('custom', 'invalid'),
            'custom',
            'ignores unsupported positions'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('left custom', 'top'),
            'left custom qti-choices-top',
            'preserves unrelated position-like classes'
        );
    });
});
