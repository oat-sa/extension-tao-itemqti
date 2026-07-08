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
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction' || qtiClass === 'interaction';
            },
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
        const outcomes = {};
        const responseProcessing = {
            processingType: 'templateDriven',
            xml: '',
            setProcessingType: function (processingType, xml) {
                this.processingType = processingType;
                this.xml = xml;
            }
        };
        const entriesBySerial = textEntries.reduce(function (acc, textEntry, index) {
            acc[index + 1] = textEntry;
            return acc;
        }, {});

        return {
            responseProcessing,
            outcomes,
            getElements: function (qtiClass) {
                if (qtiClass !== 'textEntryInteraction') {
                    return {};
                }

                return entriesBySerial;
            },
            getComposingElements: function () {
                return entriesBySerial;
            },
            getOutcomeDeclaration: function (identifier) {
                return outcomes[identifier] || null;
            },
            createOutcomeDeclaration: function (attributes) {
                const outcome = {
                    attributes: Object.assign({}, attributes),
                    defaultValue: null,
                    attr: function (name, value) {
                        if (typeof value === 'undefined') {
                            return this.attributes[name];
                        }

                        this.attributes[name] = value;
                        return this;
                    },
                    setDefaultValue: function (value) {
                        this.defaultValue = value;
                    },
                    buildIdentifier: function (identifier) {
                        this.attributes.identifier = identifier;
                        outcomes[identifier] = this;
                        return this;
                    }
                };

                return outcome;
            },
            removeOutcome: function (identifier) {
                delete outcomes[identifier];
            }
        };
    };

    QUnit.test('toggle UMFI stores metadata on the primary text entry only', assert => {
        const item = createItem([]);
        const firstEntry = createTextEntry(item);
        const secondEntry = createTextEntry(item);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');

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

    QUnit.test('uses RESPONSE text entry as metadata source for lexical fields', assert => {
        const item = createItem([]);
        const responseEntry = createTextEntry(item);
        const otherEntry = createTextEntry(item);

        responseEntry.attr('responseIdentifier', 'RESPONSE');
        otherEntry.attr('responseIdentifier', 'RESPONSE_1');

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return {
                2: otherEntry,
                1: responseEntry
            };
        };

        responseEntry.attr('data-item-type', 'umfi-closed');
        responseEntry.attr('data-umfi-values', '[["Apple","apple","apples"]]');

        const groups = evaluationHelper.getLexicalGroups(otherEntry);

        assert.strictEqual(groups.length, 1);
        assert.strictEqual(groups[0].label, 'Apple');
        assert.deepEqual(groups[0].synonyms, ['Apple', 'apple', 'apples']);
        assert.strictEqual(evaluationHelper.isUmfiEnabled(otherEntry), true);

        evaluationHelper.persistEvaluationConfig(otherEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    label: 'Banana',
                    synonyms: ['banana', 'bananas']
                }
            ]
        });

        assert.strictEqual(responseEntry.attr('data-umfi-values'), '[["banana","bananas"]]');
        assert.strictEqual(otherEntry.attr('data-umfi-values'), undefined);
        assert.strictEqual(
            evaluationHelper.getPrimaryTextEntry(evaluationHelper.getItemTextEntries(otherEntry)),
            responseEntry
        );
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

    QUnit.test('persistEvaluationConfig updates data-umfi-values and responseProcessing', assert => {
        const item = createItem([]);
        const firstEntry = createTextEntry(item);
        const secondEntry = createTextEntry(item);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return {
                1: firstEntry,
                2: secondEntry
            };
        };

        evaluationHelper.persistEvaluationConfig(firstEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    label: 'Apple',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.strictEqual(firstEntry.attr('data-umfi-values'), '[["apple","apples"]]');
        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.responseProcessing.xml.indexOf('<stringMatch') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('apple') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<variable identifier="RESPONSE"') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<variable identifier="RESPONSE_1"') > -1);
        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(firstEntry.attr('data-umfi-rp-managed'), 'true');
    });

    QUnit.test('persistEvaluationConfig refreshes custom responseProcessing xml', assert => {
        const item = createItem([]);
        const textEntry = createTextEntry(item);

        textEntry.attr('responseIdentifier', 'RESPONSE');
        item.responseProcessing.processingType = 'custom';
        item.responseProcessing.xml = '<responseProcessing><responseCondition/></responseProcessing>';

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return { 1: textEntry };
        };

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    label: 'Pear',
                    synonyms: ['pear']
                }
            ]
        });

        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.responseProcessing.xml.indexOf('<stringMatch') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('pear') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<responseCondition/>') === -1);
    });

    QUnit.test('normalizeLexicalGroups keeps outcome ids unique', assert => {
        const groups = evaluationHelper.normalizeLexicalGroups([
            {
                label: 'Apple',
                synonyms: ['apple']
            },
            {
                label: 'apple',
                synonyms: ['apples']
            }
        ]);

        assert.strictEqual(groups.length, 2);
        assert.notStrictEqual(groups[0].id, groups[1].id);
        assert.ok(groups[0].id.indexOf('_FOUND') > -1);
        assert.ok(groups[1].id.indexOf('_FOUND') > -1);
    });

    QUnit.test('ensurePersistedBeforeSave syncs RP, outcomes and strips internal attrs', assert => {
        const item = createItem([]);
        const textEntry = createTextEntry(item);

        textEntry.attr('responseIdentifier', 'RESPONSE');
        textEntry.getResponseDeclaration = function () {
            return {
                template: 'MATCH_CORRECT',
                setTemplate: function (template) {
                    this.template = template;
                }
            };
        };

        item.getElements = function (qtiClass) {
            if (qtiClass !== 'textEntryInteraction') {
                return {};
            }

            return { 1: textEntry };
        };

        textEntry.attr('data-item-type', 'umfi-closed');
        textEntry.attr('data-umfi-values', '[["apple","apples"]]');
        textEntry.attr('data-umfi-managed-outcomes', '["APPLE_FOUND"]');
        textEntry.attr('data-umfi-rp-managed', 'true');

        evaluationHelper.ensurePersistedBeforeSave(item);

        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND').defaultValue, 0);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').defaultValue, 0);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
        assert.strictEqual(textEntry.getResponseDeclaration().template, 'CUSTOM');
        assert.strictEqual(textEntry.attr('data-umfi-managed-outcomes'), undefined);
        assert.strictEqual(textEntry.attr('data-umfi-rp-managed'), undefined);
        assert.strictEqual(textEntry.attr('data-umfi-values'), '[["apple","apples"]]');
    });

    QUnit.test('getItemTextEntries finds nested text entries via getComposingElements', assert => {
        const item = createItem([]);
        const nestedEntry = createTextEntry(item);

        nestedEntry.attr('responseIdentifier', 'RESPONSE');

        item.getElements = function () {
            return {};
        };
        item.getComposingElements = function () {
            return {
                42: nestedEntry
            };
        };

        const entries = evaluationHelper.getItemTextEntries({
            getRootElement: function () {
                return item;
            }
        });

        assert.strictEqual(entries.length, 1);
        assert.strictEqual(entries[0], nestedEntry);
        assert.strictEqual(evaluationHelper.getPrimaryTextEntry(entries), nestedEntry);
    });

    QUnit.test('persistEvaluationConfig works for nested text entry in paragraph container', assert => {
        const item = createItem([]);
        const nestedEntry = createTextEntry(item);

        nestedEntry.attr('responseIdentifier', 'RESPONSE');

        item.getElements = function () {
            return {};
        };
        item.getComposingElements = function () {
            return {
                42: nestedEntry
            };
        };

        evaluationHelper.persistEvaluationConfig(nestedEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    label: 'Apple',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.strictEqual(nestedEntry.attr('data-item-type'), 'umfi-closed');
        assert.strictEqual(nestedEntry.attr('data-umfi-values'), '[["apple","apples"]]');
        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
    });
});
