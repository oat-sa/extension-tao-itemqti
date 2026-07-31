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
define(['taoQtiItem/qtiXmlRenderer/helper/scoringModelResponseProcessingGenerator'], function (generator) {
    'use strict';

    QUnit.module('scoringModelResponseProcessingGenerator');

    QUnit.test('generateResponseProcessing builds TEMP_SCORE sum and dichotomous threshold', assert => {
        const xml = generator.generateResponseProcessing({
            interactions: ['RESPONSE', 'RESPONSE_1', 'RESPONSE_2'],
            thresholds: [{ threshold: 2, score: 1 }]
        });

        assert.ok(xml.indexOf('<responseProcessing>') === 0);
        assert.ok(xml.indexOf('<mapResponse identifier="RESPONSE" />') > -1);
        assert.ok(xml.indexOf('<mapResponse identifier="RESPONSE_1" />') > -1);
        assert.ok(xml.indexOf('<mapResponse identifier="RESPONSE_2" />') > -1);
        assert.ok(xml.indexOf('identifier="TEMP_SCORE"') > -1);
        assert.ok(xml.indexOf('<baseValue baseType="float">2</baseValue>') > -1);
        assert.ok(xml.indexOf('<baseValue baseType="float">1</baseValue>') > -1);
        assert.ok(xml.indexOf('<responseElse>') > -1);
        assert.strictEqual(xml.indexOf('<responseElseIf>'), -1);
    });

    QUnit.test('generateResponseProcessing builds polytomous elseIf chain', assert => {
        const xml = generator.generateResponseProcessing({
            interactions: ['RESPONSE'],
            thresholds: [
                { threshold: 5, score: 2 },
                { threshold: 3, score: 1 }
            ]
        });

        assert.ok(xml.indexOf('<responseIf>') > -1);
        assert.ok(xml.indexOf('<responseElseIf>') > -1);
        assert.ok(xml.indexOf('<baseValue baseType="float">5</baseValue>') > -1);
        assert.ok(xml.indexOf('<baseValue baseType="float">3</baseValue>') > -1);
        assert.strictEqual(generator.getMaxScore({
            interactions: ['RESPONSE'],
            thresholds: [
                { threshold: 5, score: 2 },
                { threshold: 3, score: 1 }
            ]
        }), 2);
    });

    QUnit.test('validateConfig requires interactions and thresholds', assert => {
        assert.throws(() => generator.generateResponseProcessing({}), /at least one interaction/);
        assert.throws(
            () => generator.generateResponseProcessing({ interactions: ['RESPONSE'], thresholds: [] }),
            /at least one threshold/
        );
    });
});
