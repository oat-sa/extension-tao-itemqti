/*
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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['jquery', 'taoQtiItem/qtiCreator/helper/textEntryEvaluationForm'], function ($, textEntryEvaluationForm) {
    'use strict';

    QUnit.module('textEntryEvaluationForm');

    const buildGroupDom = function buildGroupDom(options) {
        const synonyms = (options && options.synonyms) || [];
        const draftValue = options && options.draftValue;
        const chips = synonyms
            .map(
                (value, index) =>
                    `<span class="lexical-field-variant-chip" data-variant-index="${index}">
                        <span class="variant-text">${value}</span>
                    </span>`
            )
            .join('');
        const draftInput =
            typeof draftValue !== 'undefined'
                ? `<input type="text" class="lexical-field-variant-input" value="${draftValue}" />`
                : '';

        return $(
            `<div class="lexical-field-group" data-group-index="0">
                <input type="text" class="lexical-field-label" value="${(options && options.label) || 'Apple'}" />
                <div class="lexical-field-variant-chips">${chips}${draftInput}</div>
            </div>`
        );
    };

    QUnit.test('readVariantsFromGroup collects chips and draft input', assert => {
        const $group = buildGroupDom({
            synonyms: ['apple', 'apples'],
            draftValue: 'apfel'
        });

        assert.deepEqual(textEntryEvaluationForm.readVariantsFromGroup($group), ['apple', 'apples', 'apfel']);
    });

    QUnit.test('readLexicalGroupsFromForm tracks draftVariant from input presence', assert => {
        const $form = $('<div class="text-entry-evaluation-panel"></div>');
        const $groupWithDraft = buildGroupDom({ draftValue: '' });

        $form.append($groupWithDraft);
        $form.append(buildGroupDom({ label: 'Banana', synonyms: ['banana'] }));

        const groups = textEntryEvaluationForm.readLexicalGroupsFromForm($form);

        assert.strictEqual(groups.length, 2);
        assert.strictEqual(groups[0].label, 'Apple');
        assert.strictEqual(groups[0].draftVariant, true);
        assert.deepEqual(groups[0].synonyms, []);
        assert.strictEqual(groups[1].draftVariant, false);
        assert.deepEqual(groups[1].synonyms, ['banana']);
    });
});
