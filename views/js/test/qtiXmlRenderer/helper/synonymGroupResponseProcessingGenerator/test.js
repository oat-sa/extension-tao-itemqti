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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['taoQtiItem/qtiXmlRenderer/helper/synonymGroupResponseProcessingGenerator'], function (generator) {
    'use strict';

    const sampleConfig = {
        interactions: ['R1', 'R2', 'R3'],
        caseSensitive: false,
        synonymGroups: [
            {
                id: 'GERMANY_FOUND',
                label: 'Germany',
                synonyms: ['Germany', 'Federal Republic of Germany', 'Germanies']
            },
            {
                id: 'FRANCE_FOUND',
                label: 'France',
                synonyms: ['France', 'French Republic', 'france']
            },
            {
                id: 'SPAIN_FOUND',
                label: 'Spain',
                synonyms: ['Spain', 'Kingdom of Spain', 'spain']
            }
        ]
    };

    const countOccurrences = (haystack, needle) => (haystack.match(new RegExp(needle, 'g')) || []).length;

    QUnit.module('synonymGroupResponseProcessingGenerator');

    QUnit.test('module', assert => {
        assert.equal(typeof generator, 'object', 'The module exposes an object');
        assert.equal(typeof generator.generateResponseProcessing, 'function');
        assert.equal(typeof generator.generateOutcomeDeclarations, 'function');
        assert.equal(typeof generator.getMaxScore, 'function');
    });

    QUnit.test('generates responseProcessing with one condition per synonym group', assert => {
        const xml = generator.generateResponseProcessing(sampleConfig);

        assert.ok(xml.indexOf('<responseProcessing>') === 0, 'Wrapped in responseProcessing');
        assert.equal(countOccurrences(xml, '<responseCondition>'), 3, 'Three synonym group conditions');
        assert.equal(countOccurrences(xml, '<stringMatch'), 27, 'All interaction x synonym combinations');
        assert.equal(countOccurrences(xml, 'caseSensitive="false"'), 27, 'Case insensitive matches');
        assert.ok(xml.indexOf('<setOutcomeValue identifier="GERMANY_FOUND">') > -1);
        assert.ok(xml.indexOf('<setOutcomeValue identifier="SCORE">') > -1);
        assert.equal(countOccurrences(xml, '<mapResponse'), 0, 'No mapResponse usage');
        assert.equal(countOccurrences(xml, '<mapping'), 0, 'No mapping usage');
        assert.equal(countOccurrences(xml, '<mapEntry'), 0, 'No mapEntry usage');
    });

    QUnit.test('buildMatches creates cartesian product', assert => {
        const matches = generator.buildMatches(['R1', 'R2'], ['A', 'B'], false);

        assert.equal(matches.length, 4);
        assert.deepEqual(matches[0], {
            responseIdentifier: 'R1',
            synonym: 'A',
            caseSensitive: 'false'
        });
    });

    QUnit.test('getMaxScore sums group weights', assert => {
        assert.equal(generator.getMaxScore(sampleConfig), 3);

        const weightedConfig = generator.normalizeConfig({
            interactions: ['R1'],
            synonymGroups: [
                { id: 'A', synonyms: ['x'], maxScore: 2 },
                { id: 'B', synonyms: ['y'], maxScore: 3 }
            ]
        });

        assert.equal(generator.getMaxScore(weightedConfig), 5);
    });

    QUnit.test('generateOutcomeDeclarations includes group and score outcomes', assert => {
        const xml = generator.generateOutcomeDeclarations(sampleConfig);

        assert.ok(xml.indexOf('identifier="GERMANY_FOUND"') > -1);
        assert.ok(xml.indexOf('identifier="FRANCE_FOUND"') > -1);
        assert.ok(xml.indexOf('identifier="SPAIN_FOUND"') > -1);
        assert.ok(xml.indexOf('identifier="SCORE"') > -1);
        assert.ok(xml.indexOf('identifier="MAXSCORE"') > -1);
        assert.ok(xml.indexOf('<value>3</value>') > -1, 'MAXSCORE equals number of groups');
    });

    QUnit.test('escapes special characters in synonyms', assert => {
        const xml = generator.generateResponseProcessing({
            interactions: ['R1'],
            synonymGroups: [
                {
                    id: 'SPECIAL_FOUND',
                    synonyms: ['Response with "quotes"', 'comma, value', 'République']
                }
            ]
        });

        assert.ok(xml.indexOf('Response with &quot;quotes&quot;') > -1, 'Quotes are escaped');
        assert.ok(xml.indexOf('comma, value') > -1, 'Comma is preserved in baseValue');
        assert.ok(xml.indexOf('République') > -1, 'Unicode is preserved');
    });

    QUnit.test('supports variants and aliases as deprecated synonyms aliases', assert => {
        const fromVariants = generator.generateResponseProcessing({
            interactions: ['R1'],
            synonymGroups: [{ id: 'GROUP_FOUND', variants: ['one', 'two'] }]
        });
        const fromAliases = generator.generateResponseProcessing({
            interactions: ['R1'],
            synonymGroups: [{ id: 'GROUP_FOUND', aliases: ['one', 'two'] }]
        });

        assert.equal(countOccurrences(fromVariants, '<stringMatch'), 2);
        assert.equal(countOccurrences(fromAliases, '<stringMatch'), 2);
    });

    QUnit.test('validateConfig rejects invalid input', assert => {
        assert.throws(() => generator.generateResponseProcessing({}), /at least one interaction/);
        assert.throws(
            () => generator.generateResponseProcessing({ interactions: ['R1'], synonymGroups: [] }),
            /at least one synonym group/
        );
        assert.throws(
            () =>
                generator.generateResponseProcessing({
                    interactions: ['R1'],
                    synonymGroups: [{ id: 'A', synonyms: [] }]
                }),
            /at least one synonym/
        );
        assert.throws(
            () =>
                generator.generateResponseProcessing({
                    interactions: ['R1'],
                    scoreOutcome: 'SCORE',
                    synonymGroups: [{ id: 'SCORE', synonyms: ['x'] }]
                }),
            /must not collide/
        );
    });

    QUnit.test('each synonym group uses a single maxScore assignment', assert => {
        const xml = generator.generateResponseProcessing(sampleConfig);
        const germanyBlock = xml.split('<setOutcomeValue identifier="FRANCE_FOUND">')[0];

        assert.equal(countOccurrences(germanyBlock, '<baseValue baseType="integer">1</baseValue>'), 1);
        assert.ok(
            germanyBlock.indexOf('Federal Republic of Germany') > -1,
            'Grouped synonyms are scored together'
        );
    });
});
