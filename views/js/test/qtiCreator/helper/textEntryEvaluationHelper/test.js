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
define(['taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'], function (evaluationHelper) {
    'use strict';

    QUnit.module('textEntryEvaluationHelper');

    const createTextEntry = function createTextEntry(item, serial) {
        const attrs = {};
        const entrySerial = serial || null;

        return {
            qtiClass: 'textEntryInteraction',
            serial: entrySerial,
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction' || qtiClass === 'interaction';
            },
            getSerial: function () {
                return this.serial;
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
            const serial = String(index + 1);

            textEntry.serial = serial;
            acc[serial] = textEntry;
            return acc;
        }, {});
        const bodyString = textEntries
            .map(function (textEntry) {
                return '{{' + textEntry.serial + '}}';
            })
            .join('');
        const bodyContainer = {
            elements: entriesBySerial,
            bdy: bodyString,
            body: function () {
                return this.bdy;
            },
            getElements: function () {
                return this.elements;
            }
        };

        const item = {
            responseProcessing,
            outcomes,
            getBody: function () {
                return bodyContainer;
            },
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
                    removeAttr: function (name) {
                        delete this.attributes[name];
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
            },
            /**
             * Reorder text entries in the item body (simulates insert-before).
             *
             * @param {Object[]} orderedEntries
             */
            setBodyOrder: function (orderedEntries) {
                bodyContainer.bdy = orderedEntries
                    .map(function (textEntry) {
                        return '{{' + textEntry.serial + '}}';
                    })
                    .join('');
            }
        };

        textEntries.forEach(function (textEntry) {
            textEntry.getRootElement = function () {
                return item;
            };
        });

        return item;
    };

    QUnit.test('toggle UMFI stores metadata on the primary text entry only', assert => {
        const firstEntry = createTextEntry(null);
        const secondEntry = createTextEntry(null);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');

        const item = createItem([firstEntry, secondEntry]);

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
        assert.strictEqual(item.getBody().body().indexOf('{{1}}') > -1, true);
    });

    QUnit.test('uses first text entry in body order as metadata source for lexical fields', assert => {
        const responseEntry = createTextEntry(null);
        const otherEntry = createTextEntry(null);

        responseEntry.attr('responseIdentifier', 'RESPONSE');
        otherEntry.attr('responseIdentifier', 'RESPONSE_1');

        // Body order: RESPONSE_1 first, RESPONSE second.
        const item = createItem([otherEntry, responseEntry]);

        responseEntry.attr('data-item-type', 'umfi-closed');
        responseEntry.attr('data-umfi-values', '[["Apple","apple","apples"]]');

        evaluationHelper.migrateFeatureDataAttributesToPrimary(otherEntry);

        assert.strictEqual(otherEntry.attr('data-item-type'), 'umfi-closed');
        assert.strictEqual(responseEntry.attr('data-item-type'), undefined);

        const groups = evaluationHelper.getLexicalGroups(responseEntry);

        assert.strictEqual(groups.length, 1);
        assert.strictEqual(groups[0].identifier, 'GROUP_1');
        assert.strictEqual(groups[0].id, 'GROUP_1_FOUND');
        assert.strictEqual(groups[0].canonical, 'Apple');
        assert.deepEqual(groups[0].synonyms, ['Apple', 'apple', 'apples']);
        assert.strictEqual(evaluationHelper.isUmfiEnabled(responseEntry), true);

        evaluationHelper.persistEvaluationConfig(responseEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'BANANA',
                    synonyms: ['banana', 'bananas']
                }
            ]
        });

        assert.strictEqual(
            otherEntry.attr('data-umfi-values'),
            '[{"group":"BANANA_FOUND","canonical":"banana","variants":["banana","bananas"]}]'
        );
        assert.strictEqual(responseEntry.attr('data-umfi-values'), undefined);
        assert.strictEqual(
            evaluationHelper.getPrimaryTextEntry(evaluationHelper.getItemTextEntries(responseEntry)),
            otherEntry
        );
        assert.ok(item);
    });

    QUnit.test('migrates feature data-* to first TEI after insert-before', assert => {
        const originalFirst = createTextEntry(null);
        const insertedBefore = createTextEntry(null);

        originalFirst.attr('responseIdentifier', 'RESPONSE');
        insertedBefore.attr('responseIdentifier', 'RESPONSE_1');

        const item = createItem([originalFirst, insertedBefore]);

        evaluationHelper.persistEvaluationConfig(originalFirst, {
            evaluateAsUmfi: true,
            caseSensitive: false,
            allowLexicalFieldsOnScoring: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.strictEqual(originalFirst.attr('data-item-type'), 'umfi-closed');
        assert.ok(originalFirst.attr('data-umfi-values'));
        assert.strictEqual(originalFirst.attr('data-case-sensitive'), 'false');
        assert.strictEqual(originalFirst.attr('data-allow-lexical-fields-on-scoring'), 'true');
        assert.strictEqual(insertedBefore.attr('data-item-type'), undefined);

        // Insert RESPONSE_1 before RESPONSE in the body.
        item.setBodyOrder([insertedBefore, originalFirst]);

        evaluationHelper.ensurePersistedBeforeSave(item);

        assert.strictEqual(insertedBefore.attr('data-item-type'), 'umfi-closed');
        assert.strictEqual(
            insertedBefore.attr('data-umfi-values'),
            '[{"group":"APPLE_FOUND","canonical":"apple","variants":["apple","apples"]}]'
        );
        assert.strictEqual(insertedBefore.attr('data-case-sensitive'), 'false');
        assert.strictEqual(insertedBefore.attr('data-allow-lexical-fields-on-scoring'), 'true');
        assert.strictEqual(originalFirst.attr('data-item-type'), undefined);
        assert.strictEqual(originalFirst.attr('data-umfi-values'), undefined);
        assert.strictEqual(originalFirst.attr('data-case-sensitive'), undefined);
        assert.strictEqual(originalFirst.attr('data-allow-lexical-fields-on-scoring'), undefined);
        assert.strictEqual(originalFirst.attr('data-umfi-managed-outcomes'), undefined);
        assert.strictEqual(originalFirst.attr('data-umfi-rp-managed'), undefined);
    });

    QUnit.test('migrates feature data-* across nested text _container after insert-before', assert => {
        const originalFirst = createTextEntry(null);
        const insertedBefore = createTextEntry(null);

        originalFirst.attr('responseIdentifier', 'RESPONSE');
        insertedBefore.attr('responseIdentifier', 'RESPONSE_2');
        originalFirst.serial = 'tei_response';
        insertedBefore.serial = 'tei_response_2';

        const textContainer = {
            qtiClass: '_container',
            serial: 'container_text',
            elements: {
                tei_response: originalFirst,
                tei_response_2: insertedBefore
            },
            bdy: '{{tei_response}}{{tei_response_2}}',
            body: function () {
                return this.bdy;
            },
            getElements: function () {
                return this.elements;
            }
        };
        const itemBody = {
            elements: {
                container_text: textContainer
            },
            bdy: '<div class="grid-row"><div class="col-12">{{container_text}}</div></div>',
            body: function () {
                return this.bdy;
            },
            getElements: function () {
                return this.elements;
            }
        };
        const item = {
            getBody: function () {
                return itemBody;
            },
            getComposingElements: function () {
                return {
                    container_text: textContainer,
                    tei_response: originalFirst,
                    tei_response_2: insertedBefore
                };
            },
            getElements: function () {
                return {};
            },
            outcomes: {},
            responseProcessing: {
                processingType: 'templateDriven',
                xml: '',
                setProcessingType: function (processingType, xml) {
                    this.processingType = processingType;
                    this.xml = xml;
                }
            },
            getOutcomeDeclaration: function () {
                return null;
            },
            createOutcomeDeclaration: function () {
                return {
                    attr: function () {
                        return this;
                    },
                    setDefaultValue: function () {},
                    buildIdentifier: function () {
                        return this;
                    }
                };
            },
            removeOutcome: function () {}
        };

        originalFirst.getRootElement = function () {
            return item;
        };
        insertedBefore.getRootElement = function () {
            return item;
        };

        evaluationHelper.persistEvaluationConfig(originalFirst, {
            evaluateAsUmfi: true,
            caseSensitive: false,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple']
                }
            ]
        });

        assert.strictEqual(originalFirst.attr('data-item-type'), 'umfi-closed');

        // Insert before: new TEI becomes first in the nested text container body.
        textContainer.bdy = '{{tei_response_2}}{{tei_response}}';

        evaluationHelper.migrateFeatureDataAttributesToPrimary(originalFirst);

        assert.strictEqual(insertedBefore.attr('data-item-type'), 'umfi-closed');
        assert.ok(insertedBefore.attr('data-umfi-values'));
        assert.strictEqual(originalFirst.attr('data-item-type'), undefined);
        assert.strictEqual(originalFirst.attr('data-umfi-values'), undefined);
        assert.strictEqual(
            evaluationHelper.getPrimaryTextEntry(evaluationHelper.getItemTextEntries(originalFirst)),
            insertedBefore
        );
    });

    QUnit.test('parse and serialize lexical groups from data-umfi-values', assert => {
        const legacyJson = '[["Germany","Federal Republic of Germany"],["France","french republic"]]';
        const legacyGroups = evaluationHelper.parseDataUmfiValues(legacyJson);

        assert.strictEqual(legacyGroups.length, 2);
        assert.strictEqual(legacyGroups[0].identifier, 'GROUP_1');
        assert.strictEqual(legacyGroups[0].id, 'GROUP_1_FOUND');
        assert.strictEqual(legacyGroups[0].canonical, 'Germany');
        assert.deepEqual(legacyGroups[0].synonyms, ['Germany', 'Federal Republic of Germany']);
        assert.strictEqual(legacyGroups[1].identifier, 'GROUP_2');
        assert.deepEqual(legacyGroups[1].synonyms, ['France', 'french republic']);

        const modernJson =
            '[{"group":"FRANCE_FOUND","canonical":"France","variants":["France","france","FR"]},{"group":"GERMANY_FOUND","canonical":"Germany","variants":["Germany","Federal Republic of Germany"]}]';
        const modernGroups = evaluationHelper.parseDataUmfiValues(modernJson);

        assert.strictEqual(modernGroups[0].identifier, 'FRANCE');
        assert.strictEqual(modernGroups[0].id, 'FRANCE_FOUND');
        assert.strictEqual(modernGroups[0].canonical, 'France');
        assert.deepEqual(modernGroups[0].synonyms, ['France', 'france', 'FR']);

        assert.strictEqual(evaluationHelper.serializeDataUmfiValues(modernGroups), modernJson);

        // Legacy payloads without *_FOUND still parse and re-serialize with the outcome id.
        const legacyModernGroups = evaluationHelper.parseDataUmfiValues(
            '[{"group":"FRANCE","canonical":"France","variants":["France"]}]'
        );
        assert.strictEqual(legacyModernGroups[0].identifier, 'FRANCE');
        assert.strictEqual(legacyModernGroups[0].id, 'FRANCE_FOUND');
        assert.strictEqual(
            evaluationHelper.serializeDataUmfiValues(legacyModernGroups),
            '[{"group":"FRANCE_FOUND","canonical":"France","variants":["France"]}]'
        );
    });

    QUnit.test('buildDefaultLexicalGroupIdentifier generates incremental identifiers', assert => {
        assert.strictEqual(evaluationHelper.buildDefaultLexicalGroupIdentifier(0), 'GROUP_1');
        assert.strictEqual(evaluationHelper.buildDefaultLexicalGroupIdentifier(2), 'GROUP_3');
    });

    QUnit.test('buildNextLexicalGroupIdentifier allocates unused GROUP_n values', assert => {
        assert.strictEqual(evaluationHelper.buildNextLexicalGroupIdentifier([]), 'GROUP_1');
        assert.strictEqual(
            evaluationHelper.buildNextLexicalGroupIdentifier([{ identifier: 'GROUP_1', synonyms: ['a'] }]),
            'GROUP_2'
        );
        assert.strictEqual(
            evaluationHelper.buildNextLexicalGroupIdentifier([
                { identifier: 'GROUP_1', synonyms: ['a'] },
                { identifier: 'GROUP_2', synonyms: ['b'] }
            ]),
            'GROUP_3'
        );
        assert.strictEqual(
            evaluationHelper.buildNextLexicalGroupIdentifier([
                { identifier: 'CUSTOM', synonyms: ['a'] },
                { identifier: 'GROUP_1', synonyms: ['b'] }
            ]),
            'GROUP_2'
        );
        assert.strictEqual(
            evaluationHelper.buildNextLexicalGroupIdentifier([
                { identifier: 'GROUP_1', synonyms: ['a'] },
                { identifier: 'GROUP_3', synonyms: ['b'] }
            ]),
            'GROUP_2'
        );
    });

    QUnit.test('normalizeLexicalGroups preserves legacy custom identifiers on load', assert => {
        const groups = evaluationHelper.normalizeLexicalGroups([
            {
                identifier: 'FRANCE',
                canonical: 'France',
                synonyms: ['France', 'FR']
            },
            {
                identifier: '',
                synonyms: []
            }
        ]);

        assert.strictEqual(groups[0].identifier, 'FRANCE');
        assert.strictEqual(groups[0].canonical, 'France');
        assert.deepEqual(groups[0].synonyms, ['France', 'FR']);
        assert.strictEqual(groups[1].identifier, 'GROUP_2');
        assert.strictEqual(groups[1].canonical, '');
        assert.deepEqual(groups[1].synonyms, []);
    });

    QUnit.test('parseDataUmfiValues keeps custom group ids and assigns GROUP_n for legacy arrays', assert => {
        const modernGroups = evaluationHelper.parseDataUmfiValues(
            '[{"group":"CUSTOM_ID_FOUND","canonical":"Apple","variants":["Apple","apples"]}]'
        );

        assert.strictEqual(modernGroups[0].identifier, 'CUSTOM_ID');
        assert.strictEqual(modernGroups[0].canonical, 'Apple');
        assert.deepEqual(modernGroups[0].synonyms, ['Apple', 'apples']);

        const emptyModern = evaluationHelper.normalizeLexicalGroups([
            { identifier: '', canonical: '', synonyms: [] }
        ]);

        assert.strictEqual(emptyModern[0].identifier, 'GROUP_1');
    });

    QUnit.test('buildGroupOutcomeId appends FOUND suffix to identifier base', assert => {
        assert.strictEqual(evaluationHelper.buildGroupOutcomeId('APPLE'), 'APPLE_FOUND');
        assert.strictEqual(evaluationHelper.buildGroupOutcomeId('GROUP_1'), 'GROUP_1_FOUND');
        assert.strictEqual(evaluationHelper.buildGroupOutcomeId('APPLE_FOUND'), 'APPLE_FOUND');
    });

    QUnit.test('hasLexicalVariant detects existing variants using case sensitivity', assert => {
        const variants = ['Apple', 'apples'];

        assert.strictEqual(evaluationHelper.hasLexicalVariant(variants, 'apple', false), true);
        assert.strictEqual(evaluationHelper.hasLexicalVariant(variants, 'apple', true), false);
        assert.strictEqual(evaluationHelper.hasLexicalVariant(variants, 'apples', true), true);
        assert.strictEqual(evaluationHelper.hasLexicalVariant(variants, 'banana', false), false);
    });

    QUnit.test('normalizeLexicalGroups keeps default identifier when variants are added', assert => {
        const groups = evaluationHelper.normalizeLexicalGroups([{ identifier: '', synonyms: ['Apple', 'apple'] }]);

        assert.strictEqual(groups[0].identifier, 'GROUP_1');
        assert.strictEqual(groups[0].id, 'GROUP_1_FOUND');
        assert.strictEqual(groups[0].canonical, 'Apple');
        assert.deepEqual(groups[0].synonyms, ['Apple', 'apple']);
    });

    QUnit.test('normalizeLexicalGroups keeps input identifier and applies FOUND only to outcome id', assert => {
        const groups = evaluationHelper.normalizeLexicalGroups([
            {
                identifier: 'FRANCE',
                synonyms: ['France', 'FR']
            }
        ]);

        assert.strictEqual(groups[0].identifier, 'FRANCE');
        assert.strictEqual(groups[0].id, 'FRANCE_FOUND');
    });

    QUnit.test('getEvaluationConfig reads lexical groups and case sensitivity', assert => {
        const textEntry = createTextEntry(null);
        const item = createItem([textEntry]);

        textEntry.attr('data-item-type', 'umfi-closed');
        textEntry.attr('data-umfi-values', '[["Banana","bananas"]]');
        textEntry.attr('data-case-sensitive', 'true');
        textEntry.attr('data-allow-lexical-fields-on-scoring', 'true');

        const config = evaluationHelper.getEvaluationConfig(textEntry);

        assert.strictEqual(config.evaluateAsUmfi, true);
        assert.strictEqual(config.caseSensitive, true);
        assert.strictEqual(config.allowLexicalFieldsOnScoring, true);
        assert.strictEqual(config.lexicalGroups.length, 1);
        assert.strictEqual(config.lexicalGroups[0].identifier, 'GROUP_1');
        assert.strictEqual(config.lexicalGroups[0].id, 'GROUP_1_FOUND');
        assert.strictEqual(config.lexicalGroups[0].canonical, 'Banana');
    });

    QUnit.test('persistEvaluationConfig updates data-umfi-values and responseProcessing', assert => {
        const firstEntry = createTextEntry(null);
        const secondEntry = createTextEntry(null);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');

        const item = createItem([firstEntry, secondEntry]);

        evaluationHelper.persistEvaluationConfig(firstEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.strictEqual(
            firstEntry.attr('data-umfi-values'),
            '[{"group":"APPLE_FOUND","canonical":"apple","variants":["apple","apples"]}]'
        );
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
        const textEntry = createTextEntry(null);
        textEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([textEntry]);

        item.responseProcessing.processingType = 'custom';
        item.responseProcessing.xml = '<responseProcessing><responseCondition/></responseProcessing>';

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'PEAR',
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
                identifier: 'APPLE',
                synonyms: ['apple']
            },
            {
                identifier: 'APPLE',
                synonyms: ['apples']
            }
        ]);

        assert.strictEqual(groups.length, 2);
        assert.notStrictEqual(groups[0].id, groups[1].id);
        assert.strictEqual(groups[0].identifier, 'APPLE');
        assert.strictEqual(groups[1].identifier, 'GROUP_2');
        assert.strictEqual(groups[0].id, 'APPLE_FOUND');
        assert.strictEqual(groups[1].id, 'GROUP_2_FOUND');
        assert.ok(groups[0].id.indexOf('_FOUND') > -1);
        assert.ok(groups[1].id.indexOf('_FOUND') > -1);
    });

    QUnit.test('ensurePersistedBeforeSave syncs RP and keeps internal authoring attrs on the live model', assert => {
        const textEntry = createTextEntry(null);
        textEntry.attr('responseIdentifier', 'RESPONSE');
        const responseDeclaration = {
            template: 'MATCH_CORRECT',
            setTemplate: function (template) {
                this.template = template;
            }
        };
        textEntry.getResponseDeclaration = function () {
            return responseDeclaration;
        };
        const item = createItem([textEntry]);

        textEntry.attr('data-item-type', 'umfi-closed');
        textEntry.attr('data-umfi-values', '[["apple","apples"]]');
        textEntry.attr('data-umfi-managed-outcomes', '["GROUP_1_FOUND"]');
        textEntry.attr('data-umfi-rp-managed', 'true');

        evaluationHelper.ensurePersistedBeforeSave(item);

        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.getOutcomeDeclaration('GROUP_1_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('GROUP_1_FOUND').defaultValue, 0);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').defaultValue, 0);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
        assert.strictEqual(textEntry.getResponseDeclaration().template, 'CUSTOM');
        assert.strictEqual(textEntry.attr('data-umfi-managed-outcomes'), '["GROUP_1_FOUND"]');
        assert.strictEqual(textEntry.attr('data-umfi-rp-managed'), 'true');
        assert.strictEqual(
            textEntry.attr('data-umfi-values'),
            '[{"group":"GROUP_1_FOUND","canonical":"apple","variants":["apple","apples"]}]'
        );
    });

    QUnit.test('removing a lexical group removes its outcome and refreshes responseProcessing', assert => {
        const textEntry = createTextEntry(null);
        textEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([textEntry]);

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple']
                },
                {
                    identifier: 'BANANA',
                    synonyms: ['banana']
                }
            ]
        });

        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.ok(item.getOutcomeDeclaration('BANANA_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 2);
        assert.ok(item.responseProcessing.xml.indexOf('APPLE_FOUND') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('BANANA_FOUND') > -1);

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'BANANA',
                    synonyms: ['banana']
                }
            ]
        });

        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND'), null);
        assert.ok(item.getOutcomeDeclaration('BANANA_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.responseProcessing.xml.indexOf('APPLE_FOUND'), -1);
        assert.ok(item.responseProcessing.xml.indexOf('BANANA_FOUND') > -1);
        assert.strictEqual(textEntry.attr('data-umfi-managed-outcomes'), '["BANANA_FOUND"]');
    });

    QUnit.test('removing all lexical groups clears generated outcomes and responseProcessing', assert => {
        const textEntry = createTextEntry(null);
        textEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([textEntry]);

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple']
                }
            ]
        });

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: []
        });

        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND'), null);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE'), null);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), undefined);
        assert.strictEqual(item.responseProcessing.processingType, 'templateDriven');
        assert.strictEqual(item.responseProcessing.xml, '');
        assert.strictEqual(textEntry.attr('data-umfi-values'), '[]');
        assert.strictEqual(textEntry.attr('data-umfi-managed-outcomes'), '[]');
        assert.strictEqual(textEntry.attr('data-umfi-rp-managed'), undefined);
        assert.strictEqual(textEntry.attr('data-item-type'), 'umfi-closed');
    });

    QUnit.test('disabling UMFI removes generated outcomes, attributes and responseProcessing', assert => {
        const textEntry = createTextEntry(null);
        textEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([textEntry]);

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.ok(item.getOutcomeDeclaration('MAXSCORE'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.strictEqual(textEntry.attr('data-item-type'), 'umfi-closed');
        assert.ok(textEntry.attr('data-umfi-values'));

        evaluationHelper.persistEvaluationConfig(textEntry, {
            evaluateAsUmfi: false
        });

        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND'), null);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE'), null);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), undefined);
        assert.strictEqual(item.responseProcessing.processingType, 'templateDriven');
        assert.strictEqual(item.responseProcessing.xml, '');
        assert.strictEqual(textEntry.attr('data-item-type'), undefined);
        assert.strictEqual(textEntry.attr('data-umfi-values'), undefined);
        assert.strictEqual(textEntry.attr('data-case-sensitive'), undefined);
        assert.strictEqual(textEntry.attr('data-umfi-managed-outcomes'), undefined);
        assert.strictEqual(textEntry.attr('data-umfi-rp-managed'), undefined);
    });

    QUnit.test('getItemTextEntries finds nested text entries via getComposingElements', assert => {
        const nestedEntry = createTextEntry(null);
        nestedEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([nestedEntry]);

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
        const nestedEntry = createTextEntry(null);
        nestedEntry.attr('responseIdentifier', 'RESPONSE');
        const item = createItem([nestedEntry]);

        evaluationHelper.persistEvaluationConfig(nestedEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                {
                    identifier: 'APPLE',
                    synonyms: ['apple', 'apples']
                }
            ]
        });

        assert.strictEqual(nestedEntry.attr('data-item-type'), 'umfi-closed');
        assert.strictEqual(
            nestedEntry.attr('data-umfi-values'),
            '[{"group":"APPLE_FOUND","canonical":"apple","variants":["apple","apples"]}]'
        );
        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.getOutcomeDeclaration('APPLE_FOUND'));
        assert.strictEqual(item.getOutcomeDeclaration('APPLE_FOUND').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
    });

    QUnit.test('UMFI with polytomous data-scoring-model applies TEMP_SCORE thresholds', assert => {
        const firstEntry = createTextEntry(null);
        const secondEntry = createTextEntry(null);
        const thirdEntry = createTextEntry(null);
        const fourthEntry = createTextEntry(null);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');
        thirdEntry.attr('responseIdentifier', 'RESPONSE_2');
        fourthEntry.attr('responseIdentifier', 'RESPONSE_3');

        const item = createItem([firstEntry, secondEntry, thirdEntry, fourthEntry]);

        firstEntry.attr('data-scoring-model', '{"3":2,"2":1}');

        evaluationHelper.persistEvaluationConfig(firstEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                { identifier: 'BELGIA', synonyms: ['Belgia', 'Belgium'] },
                { identifier: 'FRANCJA', synonyms: ['Francja', 'France'] },
                { identifier: 'GERMANY', synonyms: ['Germany', 'Niemcy'] },
                { identifier: 'POLSKA', synonyms: ['Polska', 'Poland'] }
            ]
        });

        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.responseProcessing.xml.indexOf('TEMP_SCORE') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<gte>') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<responseElseIf>') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('BELGIA_FOUND') > -1);
        assert.ok(item.getOutcomeDeclaration('TEMP_SCORE'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 2);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 2);
    });

    QUnit.test('UMFI with dichotomous data-scoring-model applies single TEMP_SCORE threshold', assert => {
        const firstEntry = createTextEntry(null);
        const secondEntry = createTextEntry(null);
        const thirdEntry = createTextEntry(null);

        firstEntry.attr('responseIdentifier', 'RESPONSE');
        secondEntry.attr('responseIdentifier', 'RESPONSE_1');
        thirdEntry.attr('responseIdentifier', 'RESPONSE_2');

        const item = createItem([firstEntry, secondEntry, thirdEntry]);

        firstEntry.attr('data-scoring-model', '{"2":1}');

        evaluationHelper.persistEvaluationConfig(firstEntry, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                { identifier: 'FRANCJA', synonyms: ['Francja', 'France'] },
                { identifier: 'GERMANY', synonyms: ['Germany', 'Niemcy'] },
                { identifier: 'POLSKA', synonyms: ['Polska', 'Poland'] }
            ]
        });

        assert.strictEqual(item.responseProcessing.processingType, 'custom');
        assert.ok(item.responseProcessing.xml.indexOf('TEMP_SCORE') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<gte>') > -1);
        assert.strictEqual(item.responseProcessing.xml.indexOf('<responseElseIf>'), -1);
        assert.ok(item.responseProcessing.xml.indexOf('FRANCJA_FOUND') > -1);
        assert.ok(item.getOutcomeDeclaration('TEMP_SCORE'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
    });
});
