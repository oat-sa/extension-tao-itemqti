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
define([
    'taoQtiItem/qtiCreator/helper/scoringModelHelper',
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'
], function (scoringModelHelper, textEntryEvaluationHelper) {
    'use strict';

    QUnit.module('scoringModelHelper');

    const createTextEntry = function createTextEntry(item, responseIdentifier) {
        const attrs = {
            responseIdentifier: responseIdentifier || 'RESPONSE'
        };

        return {
            qtiClass: 'textEntryInteraction',
            serial: null,
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction' || qtiClass === 'interaction';
            },
            getSerial: function () {
                return this.serial;
            },
            getRootElement: function () {
                return item;
            },
            getResponseDeclaration: function () {
                return {
                    template: 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
                    getTemplate: function () {
                        return this.template;
                    }
                };
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
        const outcomes = {};
        const responseProcessing = {
            processingType: 'templateDriven',
            xml: '',
            setProcessingType: function (processingType, xml) {
                this.processingType = processingType;
                if (typeof xml !== 'undefined') {
                    this.xml = xml;
                }
            }
        };

        const item = {
            responseProcessing,
            getBody: function () {
                return bodyContainer;
            },
            getComposingElements: function () {
                return entriesBySerial;
            },
            getOutcomeDeclaration: function (identifier) {
                return outcomes[identifier] || null;
            },
            createOutcomeDeclaration: function (attributes) {
                const outcomeAttrs = Object.assign({}, attributes);
                const outcome = {
                    attr: function (name, value) {
                        if (typeof value === 'undefined') {
                            return outcomeAttrs[name];
                        }
                        outcomeAttrs[name] = value;
                        return this;
                    },
                    removeAttr: function (name) {
                        delete outcomeAttrs[name];
                    },
                    setDefaultValue: function (value) {
                        this.defaultValue = value;
                    },
                    buildIdentifier: function (identifier) {
                        this.identifier = identifier;
                        outcomes[identifier] = this;
                    }
                };

                return outcome;
            },
            removeOutcome: function (identifier) {
                delete outcomes[identifier];
            },
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

    QUnit.test('parseScoringModelAttribute accepts JSON and single-quoted mapping', assert => {
        assert.deepEqual(scoringModelHelper.parseScoringModelAttribute('{"5":2,"3":1}'), [
            { threshold: 5, score: 2 },
            { threshold: 3, score: 1 }
        ]);
        assert.deepEqual(scoringModelHelper.parseScoringModelAttribute("{'5':2,'3':1}"), [
            { threshold: 5, score: 2 },
            { threshold: 3, score: 1 }
        ]);
        assert.deepEqual(scoringModelHelper.parseScoringModelAttribute(''), []);
    });

    QUnit.test('resolveModelFromThresholds maps count to model', assert => {
        assert.strictEqual(scoringModelHelper.resolveModelFromThresholds([]), 'simpleSum');
        assert.strictEqual(
            scoringModelHelper.resolveModelFromThresholds([{ threshold: 5, score: 1 }]),
            'dichotomous'
        );
        assert.strictEqual(
            scoringModelHelper.resolveModelFromThresholds([
                { threshold: 5, score: 2 },
                { threshold: 3, score: 1 }
            ]),
            'polytomous'
        );
    });

    QUnit.test('persistScoringModelConfig writes data-scoring-model on primary text entry', assert => {
        const item = {};
        const primary = createTextEntry(item, 'RESPONSE');
        const secondary = createTextEntry(item, 'RESPONSE_2');
        const boundItem = createItem([primary, secondary]);

        primary.getRootElement = function () {
            return boundItem;
        };
        secondary.getRootElement = function () {
            return boundItem;
        };

        scoringModelHelper.persistScoringModelConfig(secondary, {
            model: 'polytomous',
            thresholds: [
                { threshold: 5, score: 2 },
                { threshold: 3, score: 1 }
            ]
        });

        assert.deepEqual(JSON.parse(primary.attr('data-scoring-model')), {
            5: 2,
            3: 1
        });
        assert.strictEqual(secondary.attr('data-scoring-model'), undefined);

        scoringModelHelper.persistScoringModelConfig(secondary, {
            model: 'simpleSum',
            thresholds: []
        });

        assert.strictEqual(primary.attr('data-scoring-model'), undefined);
    });

    QUnit.test('persistScoringModelConfig dichotomous regenerates custom responseProcessing', assert => {
        const item = {};
        const primary = createTextEntry(item, 'RESPONSE');
        const secondary = createTextEntry(item, 'RESPONSE_1');
        const boundItem = createItem([primary, secondary]);

        primary.getRootElement = function () {
            return boundItem;
        };
        secondary.getRootElement = function () {
            return boundItem;
        };

        scoringModelHelper.persistScoringModelConfig(primary, {
            model: 'dichotomous',
            thresholds: [{ threshold: 2, score: 1 }]
        });

        assert.strictEqual(primary.attr('data-scoring-model'), '{"2":1}');
        assert.strictEqual(primary.attr('data-scoring-model-rp-managed'), 'true');
        assert.strictEqual(boundItem.responseProcessing.processingType, 'custom');
        assert.ok(boundItem.responseProcessing.xml.indexOf('TEMP_SCORE') > -1);
        assert.ok(boundItem.responseProcessing.xml.indexOf('<mapResponse identifier="RESPONSE" />') > -1);
        assert.ok(boundItem.responseProcessing.xml.indexOf('<mapResponse identifier="RESPONSE_1" />') > -1);
        assert.ok(boundItem.responseProcessing.xml.indexOf('<baseValue baseType="float">2</baseValue>') > -1);
        assert.ok(boundItem.getOutcomeDeclaration('TEMP_SCORE'));
        assert.ok(boundItem.getOutcomeDeclaration('SCORE'));
        assert.ok(boundItem.getOutcomeDeclaration('MAXSCORE'));

        scoringModelHelper.persistScoringModelConfig(primary, {
            model: 'simpleSum',
            thresholds: []
        });

        assert.strictEqual(primary.attr('data-scoring-model-rp-managed'), undefined);
        assert.strictEqual(boundItem.responseProcessing.processingType, 'templateDriven');
        assert.strictEqual(boundItem.responseProcessing.xml, '');
        assert.strictEqual(boundItem.getOutcomeDeclaration('TEMP_SCORE'), null);
    });

    QUnit.test('shouldShowScoringModel for map-response text entry', assert => {
        const item = {};
        const textEntry = createTextEntry(item);

        textEntry.getRootElement = function () {
            return createItem([textEntry]);
        };

        assert.ok(scoringModelHelper.shouldShowScoringModel(textEntry));
        assert.ok(
            scoringModelHelper.shouldShowScoringModel(textEntry, {
                evaluateAsUmfi: false
            })
        );
    });

    QUnit.test('shouldShowScoringModel for UMFI without map-response', assert => {
        const attrs = {
            responseIdentifier: 'RESPONSE'
        };
        const textEntry = {
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction';
            },
            getRootElement: function () {
                return createItem([textEntry]);
            },
            getResponseDeclaration: function () {
                return {
                    template: 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct',
                    getTemplate: function () {
                        return this.template;
                    }
                };
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

        assert.ok(!scoringModelHelper.shouldShowScoringModel(textEntry));
        assert.ok(
            scoringModelHelper.shouldShowScoringModel(textEntry, {
                evaluateAsUmfi: true
            })
        );

        attrs['data-item-type'] = 'umfi-closed';
        assert.ok(scoringModelHelper.shouldShowScoringModel(textEntry));
    });

    QUnit.test('getScoringModelConfig reads persisted model', assert => {
        const item = {};
        const textEntry = createTextEntry(item);

        textEntry.getRootElement = function () {
            return createItem([textEntry]);
        };
        textEntry.attr('data-scoring-model', '{"5":1}');

        assert.deepEqual(scoringModelHelper.getScoringModelConfig(textEntry), {
            model: 'dichotomous',
            thresholds: [{ threshold: 5, score: 1 }]
        });
    });

    QUnit.test('migrates data-scoring-model to first TEI after insert-before', assert => {
        const originalFirst = createTextEntry(null, 'RESPONSE');
        const insertedBefore = createTextEntry(null, 'RESPONSE_1');
        const item = createItem([originalFirst, insertedBefore]);

        scoringModelHelper.persistScoringModelConfig(originalFirst, {
            model: 'dichotomous',
            thresholds: [{ threshold: 2, score: 1 }]
        });

        assert.strictEqual(originalFirst.attr('data-scoring-model'), '{"2":1}');
        assert.strictEqual(insertedBefore.attr('data-scoring-model'), undefined);

        item.setBodyOrder([insertedBefore, originalFirst]);
        scoringModelHelper.ensurePersistedBeforeSave(item);

        assert.strictEqual(insertedBefore.attr('data-scoring-model'), '{"2":1}');
        assert.strictEqual(insertedBefore.attr('data-scoring-model-rp-managed'), 'true');
        assert.strictEqual(originalFirst.attr('data-scoring-model'), undefined);
        assert.strictEqual(originalFirst.attr('data-scoring-model-rp-managed'), undefined);
    });

    QUnit.test('UMFI polytomous rebuilds synonym-group RP with TEMP_SCORE thresholds', assert => {
        const primary = createTextEntry(null, 'RESPONSE');
        const second = createTextEntry(null, 'RESPONSE_1');
        const third = createTextEntry(null, 'RESPONSE_2');
        const fourth = createTextEntry(null, 'RESPONSE_3');
        const item = createItem([primary, second, third, fourth]);

        [primary, second, third, fourth].forEach(entry => {
            entry.getRootElement = function () {
                return item;
            };
        });

        textEntryEvaluationHelper.persistEvaluationConfig(primary, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                { identifier: 'BELGIA', synonyms: ['Belgia', 'Belgium'] },
                { identifier: 'FRANCJA', synonyms: ['Francja', 'France'] },
                { identifier: 'GERMANY', synonyms: ['Germany', 'Niemcy'] },
                { identifier: 'POLSKA', synonyms: ['Polska', 'Poland'] }
            ]
        });

        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 4);

        scoringModelHelper.persistScoringModelConfig(primary, {
            model: 'polytomous',
            thresholds: [
                { threshold: 3, score: 2 },
                { threshold: 2, score: 1 }
            ]
        });

        assert.strictEqual(primary.attr('data-scoring-model'), '{"3":2,"2":1}');
        assert.ok(item.responseProcessing.xml.indexOf('TEMP_SCORE') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<stringMatch') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<gte>') > -1);
        assert.ok(item.getOutcomeDeclaration('TEMP_SCORE'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 2);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 2);
    });

    QUnit.test('UMFI dichotomous rebuilds synonym-group RP with single TEMP_SCORE threshold', assert => {
        const primary = createTextEntry(null, 'RESPONSE');
        const second = createTextEntry(null, 'RESPONSE_1');
        const third = createTextEntry(null, 'RESPONSE_2');
        const item = createItem([primary, second, third]);

        [primary, second, third].forEach(entry => {
            entry.getRootElement = function () {
                return item;
            };
        });

        textEntryEvaluationHelper.persistEvaluationConfig(primary, {
            evaluateAsUmfi: true,
            lexicalGroups: [
                { identifier: 'FRANCJA', synonyms: ['Francja', 'France'] },
                { identifier: 'GERMANY', synonyms: ['Germany', 'Niemcy'] },
                { identifier: 'POLSKA', synonyms: ['Polska', 'Poland'] }
            ]
        });

        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 3);

        scoringModelHelper.persistScoringModelConfig(primary, {
            model: 'dichotomous',
            thresholds: [{ threshold: 2, score: 1 }]
        });

        assert.strictEqual(primary.attr('data-scoring-model'), '{"2":1}');
        assert.ok(item.responseProcessing.xml.indexOf('TEMP_SCORE') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<stringMatch') > -1);
        assert.ok(item.responseProcessing.xml.indexOf('<gte>') > -1);
        assert.strictEqual(item.responseProcessing.xml.indexOf('<responseElseIf>'), -1);
        assert.ok(item.getOutcomeDeclaration('TEMP_SCORE'));
        assert.strictEqual(item.getOutcomeDeclaration('SCORE').attr('normalMaximum'), 1);
        assert.strictEqual(item.getOutcomeDeclaration('MAXSCORE').defaultValue, 1);
    });
});
