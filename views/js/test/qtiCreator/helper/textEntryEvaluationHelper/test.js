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
define(['taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'], function (evaluationHelper) {
    'use strict';

    QUnit.module('textEntryEvaluationHelper');

    const createTextEntry = function createTextEntry(item) {
        const attrs = {};

        return {
            getRootElement: function () {
                return item;
            },
            attr: function (name, value) {
                if (typeof value === 'undefined') {
                    return attrs[name];
                }

                attrs[name] = value;
                return this;
            },
            removeAttr: function (name) {
                delete attrs[name];
            }
        };
    };

    const createItem = function createItem(textEntries) {
        return {
            getElements: function (qtiClass) {
                if (qtiClass !== 'textEntryInteraction') {
                    return {};
                }

                return textEntries.reduce(function (acc, textEntry, index) {
                    acc[index + 1] = textEntry;
                    return acc;
                }, {});
            }
        };
    };

    QUnit.test('toggle UMFI stores metadata on the primary text entry only', assert => {
        const item = createItem([]);
        const firstEntry = createTextEntry(item);
        const secondEntry = createTextEntry(item);

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return {
                1: firstEntry,
                2: secondEntry
            };
        };

        evaluationHelper.setUmfiEnabled(firstEntry, true);

        assert.strictEqual(firstEntry.attr('data-item-type'), 'umfi-closed');
        assert.strictEqual(firstEntry.attr('data-umfi-values'), '[]');
        assert.strictEqual(evaluationHelper.isUmfiEnabled(secondEntry), true);

        evaluationHelper.setAllowLexicalFieldsOnScoring(firstEntry, true);
        assert.strictEqual(firstEntry.attr('data-allow-lexical-fields-on-scoring'), 'true');

        evaluationHelper.setUmfiEnabled(firstEntry, false);

        assert.strictEqual(firstEntry.attr('data-item-type'), undefined);
        assert.strictEqual(secondEntry.attr('data-item-type'), undefined);
        assert.strictEqual(firstEntry.attr('data-allow-lexical-fields-on-scoring'), undefined);
    });

    QUnit.test('parse and serialize lexical groups from data-umfi-values', assert => {
        const json = '[["Germany","Federal Republic of Germany"],["France","french republic"]]';
        const groups = evaluationHelper.parseDataUmfiValues(json);

        assert.strictEqual(groups.length, 2);
        assert.strictEqual(groups[0].label, 'Germany');
        assert.deepEqual(groups[0].synonyms, ['Germany', 'Federal Republic of Germany']);
        assert.strictEqual(groups[1].label, 'France');
        assert.deepEqual(groups[1].synonyms, ['France', 'french republic']);

        assert.strictEqual(
            evaluationHelper.serializeDataUmfiValues(groups),
            '[["Germany","Federal Republic of Germany"],["France","french republic"]]'
        );
    });

    QUnit.test('buildGroupOutcomeId normalizes labels', assert => {
        assert.strictEqual(evaluationHelper.buildGroupOutcomeId('Apple', 0), 'APPLE_FOUND');
        assert.strictEqual(evaluationHelper.buildGroupOutcomeId('', 2), 'GROUP_2_FOUND');
    });

    QUnit.test('getEvaluationConfig reads lexical groups and case sensitivity', assert => {
        const item = createItem([]);
        const textEntry = createTextEntry(item);

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return { 1: textEntry };
        };

        textEntry.attr('data-item-type', 'umfi-closed');
        textEntry.attr('data-umfi-values', '[["Banana","bananas"]]');
        textEntry.attr('data-case-sensitive', 'true');
        textEntry.attr('data-allow-lexical-fields-on-scoring', 'true');

        const config = evaluationHelper.getEvaluationConfig(textEntry);

        assert.strictEqual(config.evaluateAsUmfi, true);
        assert.strictEqual(config.caseSensitive, true);
        assert.strictEqual(config.allowLexicalFieldsOnScoring, true);
        assert.strictEqual(config.lexicalGroups.length, 1);
        assert.strictEqual(config.lexicalGroups[0].label, 'Banana');
    });
});
