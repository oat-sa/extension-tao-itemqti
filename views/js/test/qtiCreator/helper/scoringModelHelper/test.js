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
define(['taoQtiItem/qtiCreator/helper/scoringModelHelper'], function (scoringModelHelper) {
    'use strict';

    QUnit.module('scoringModelHelper');

    const createTextEntry = function createTextEntry(item, responseIdentifier) {
        const attrs = {
            responseIdentifier: responseIdentifier || 'RESPONSE'
        };

        return {
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction' || qtiClass === 'interaction';
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
            acc[index + 1] = textEntry;
            return acc;
        }, {});
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

        return {
            responseProcessing,
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
            }
        };
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

        assert.strictEqual(primary.attr('data-scoring-model'), '{"5":2,"3":1}');
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

        assert.true(scoringModelHelper.shouldShowScoringModel(textEntry));
        assert.true(
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

        assert.false(scoringModelHelper.shouldShowScoringModel(textEntry));
        assert.true(
            scoringModelHelper.shouldShowScoringModel(textEntry, {
                evaluateAsUmfi: true
            })
        );

        attrs['data-item-type'] = 'umfi-closed';
        assert.true(scoringModelHelper.shouldShowScoringModel(textEntry));
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
});
