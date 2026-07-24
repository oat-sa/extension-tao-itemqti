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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['jquery', 'taoQtiItem/qtiCreator/helper/textEntryEvaluationForm'], function ($, textEntryEvaluationForm) {
    'use strict';

    QUnit.module('textEntryEvaluationForm');

    const buildGroupDom = function buildGroupDom(options) {
        const synonyms = (options && options.synonyms) || [];
        const draftValue = options && options.draftValue;
        const canonical =
            typeof (options && options.canonical) !== 'undefined'
                ? options.canonical
                : synonyms[0] || '';
        const identifier = (options && options.identifier) || 'GROUP_1';
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
            `<div class="lexical-field-group" data-group-index="0" data-group-identifier="${identifier}">
                <input type="text" class="lexical-field-canonical" value="${canonical}" />
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

    QUnit.test('readVariantsFromGroup skips draft that duplicates an existing chip', assert => {
        const $group = buildGroupDom({
            synonyms: ['Apple', 'apples'],
            draftValue: 'apple'
        });

        assert.deepEqual(
            textEntryEvaluationForm.readVariantsFromGroup($group, { caseSensitive: false }),
            ['Apple', 'apples']
        );
        assert.deepEqual(
            textEntryEvaluationForm.readVariantsFromGroup($group, { caseSensitive: true }),
            ['Apple', 'apples', 'apple']
        );
    });

    QUnit.test('readChipVariantsFromGroup ignores draft input', assert => {
        const $group = buildGroupDom({
            synonyms: ['apple'],
            draftValue: 'apples'
        });

        assert.deepEqual(textEntryEvaluationForm.readChipVariantsFromGroup($group), ['apple']);
    });

    QUnit.test('mergeCanonicalIntoSynonyms puts canonical first and drops chip duplicates', assert => {
        assert.deepEqual(
            textEntryEvaluationForm.mergeCanonicalIntoSynonyms('Apple', ['Old', 'apples', 'Apple'], {
                caseSensitive: false
            }),
            ['Apple', 'apples']
        );
        assert.deepEqual(
            textEntryEvaluationForm.mergeCanonicalIntoSynonyms('Apple', ['Old', 'apples', 'apple'], {
                caseSensitive: true
            }),
            ['Apple', 'apples', 'apple']
        );
        assert.deepEqual(textEntryEvaluationForm.mergeCanonicalIntoSynonyms('', ['a', 'b']), ['b']);
    });

    QUnit.test('readLexicalGroupsFromForm uses data-group-identifier and merges canonical into synonyms', assert => {
        const $form = $('<div class="text-entry-evaluation-panel"></div>');
        const $groupWithDraft = buildGroupDom({
            identifier: 'GROUP_1',
            canonical: 'Apple',
            synonyms: ['Apple', 'apples'],
            draftValue: 'apfel'
        });

        $form.append($groupWithDraft);
        $form.append(
            buildGroupDom({
                identifier: 'LEGACY_CUSTOM',
                canonical: 'Banana',
                synonyms: ['Banana']
            })
        );

        const groups = textEntryEvaluationForm.readLexicalGroupsFromForm($form);

        assert.strictEqual(groups.length, 2);
        assert.strictEqual(groups[0].identifier, 'GROUP_1');
        assert.strictEqual(groups[0].canonical, 'Apple');
        assert.strictEqual(groups[0].draftVariant, true);
        assert.deepEqual(groups[0].synonyms, ['Apple', 'apples', 'apfel']);
        assert.strictEqual(groups[1].identifier, 'LEGACY_CUSTOM');
        assert.strictEqual(groups[1].canonical, 'Banana');
        assert.strictEqual(groups[1].draftVariant, false);
        assert.deepEqual(groups[1].synonyms, ['Banana']);
    });

    QUnit.test('readLexicalGroupsFromForm replaces previous canonical chip when field changes', assert => {
        const $form = $('<div class="text-entry-evaluation-panel"></div>');

        $form.append(
            buildGroupDom({
                identifier: 'GROUP_1',
                canonical: 'Pear',
                synonyms: ['Apple', 'apples']
            })
        );

        const groups = textEntryEvaluationForm.readLexicalGroupsFromForm($form);

        assert.strictEqual(groups[0].canonical, 'Pear');
        assert.deepEqual(groups[0].synonyms, ['Pear', 'apples']);
    });
});
