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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

define(['taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowResponse'], function (
    arrowResponseHelper
) {
    'use strict';

    function createInteraction(subtype) {
        return {
            attr: function (name) {
                if (name === 'data-interaction-subtype') {
                    return subtype;
                }
            }
        };
    }

    QUnit.module('graphicAssociateInteraction arrow response helper');

    QUnit.test('builds instruction message based on arrow mode', function (assert) {
        assert.expect(2);
        const baseMessage = 'Please set the correct associations by linking the choices.';
        const arrowMessage = arrowResponseHelper.getInstructionMessage(createInteraction('arrow'), baseMessage);
        const lineMessage = arrowResponseHelper.getInstructionMessage(createInteraction('line'), baseMessage);

        assert.ok(arrowMessage.indexOf('Arrow direction: start hotspot to end hotspot.') > -1, 'arrow hint is added');
        assert.strictEqual(lineMessage, baseMessage, 'message stays unchanged outside arrow mode');
    });

    QUnit.test('extracts pair payload from both pair and directedPair response keys', function (assert) {
        assert.expect(3);
        assert.deepEqual(
            arrowResponseHelper.extractResponsePairs({ list: { pair: [['A', 'B']] } }, 'list'),
            [['A', 'B']],
            'pair payload is returned'
        );
        assert.deepEqual(
            arrowResponseHelper.extractResponsePairs({ list: { directedPair: [['B', 'A']] } }, 'list'),
            [['B', 'A']],
            'directedPair payload is returned'
        );
        assert.strictEqual(
            arrowResponseHelper.extractResponsePairs({ list: {} }, 'list'),
            null,
            'missing pair payload returns null'
        );
    });

    QUnit.test('reverses selected pair by endpoint ids', function (assert) {
        assert.expect(3);
        const pairs = [
            ['A', 'B'],
            ['C', 'D']
        ];

        const reversed = arrowResponseHelper.reversePair(pairs, 'B', 'A');
        assert.ok(reversed.changed, 'pair is reversed');
        assert.deepEqual(reversed.previousPair, ['A', 'B'], 'previous pair is reported');
        assert.deepEqual(reversed.pairs, [
            ['B', 'A'],
            ['C', 'D']
        ], 'pair order is updated');
    });

    QUnit.test('ignores reverse when selected line does not match a pair', function (assert) {
        assert.expect(2);
        const pairs = [['A', 'B']];
        const reversed = arrowResponseHelper.reversePair(pairs, 'X', 'Y');

        assert.notOk(reversed.changed, 'change is skipped');
        assert.deepEqual(reversed.pairs, [['A', 'B']], 'pairs remain unchanged');
    });

    QUnit.test('shows temporary invalid direction warning through instruction', function (assert) {
        assert.expect(4);
        let stopCallback;
        const instruction = {
            resetCalled: false,
            update: function (options) {
                stopCallback = options.stop;
                assert.strictEqual(options.level, 'warning', 'warning level is used');
                assert.ok(options.message.indexOf('Invalid arrow direction') > -1, 'warning message is set');
                assert.strictEqual(options.timeout, 2500, 'warning timeout is set');
            },
            reset: function () {
                this.resetCalled = true;
            }
        };

        arrowResponseHelper.showInvalidDirectionWarning(instruction);
        stopCallback.call(instruction);
        assert.ok(instruction.resetCalled, 'warning reset callback is configured');
    });

    QUnit.test('updates hotspot roles to match reversed pair direction in arrow mode', function (assert) {
        assert.expect(3);
        const sourceAttrs = {};
        const targetAttrs = {};
        const interaction = {
            attr: function (name) {
                return name === 'data-interaction-subtype' ? 'arrow' : undefined;
            },
            getChoices: function () {
                return [
                    {
                        id: function () {
                            return 'A';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return sourceAttrs[name];
                            }
                            sourceAttrs[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'B';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return targetAttrs[name];
                            }
                            targetAttrs[name] = value;
                        }
                    }
                ];
            }
        };

        const changed = arrowResponseHelper.updateDirectionRolesForPair(interaction, ['A', 'B']);
        assert.ok(changed, 'role synchronization is applied');
        assert.strictEqual(sourceAttrs['data-start'], 'true', 'source is set as start');
        assert.strictEqual(targetAttrs['data-end'], 'true', 'target is set as end');
    });

    QUnit.test('normalizes single cardinality pair payload', function (assert) {
        assert.expect(1);
        assert.deepEqual(arrowResponseHelper.normalizePairs(['A', 'B']), [['A', 'B']], 'single pair is normalized');
    });

    QUnit.test('reports when sanitization drops invalid directional pairs', function (assert) {
        assert.expect(2);
        const attrsA = { 'data-start': 'true', 'data-end': 'false' };
        const attrsB = { 'data-start': 'false', 'data-end': 'true' };
        const interaction = {
            attr: function (name) {
                return name === 'data-interaction-subtype' ? 'arrow' : undefined;
            },
            getChoices: function () {
                return [
                    {
                        id: function () {
                            return 'A';
                        },
                        attr: function (name) {
                            return attrsA[name];
                        }
                    },
                    {
                        id: function () {
                            return 'B';
                        },
                        attr: function (name) {
                            return attrsB[name];
                        }
                    }
                ];
            }
        };

        const sanitized = arrowResponseHelper.sanitizePairChange(interaction, [
            ['A', 'B'],
            ['B', 'A']
        ]);

        assert.ok(sanitized.changed, 'changed flag is raised');
        assert.deepEqual(sanitized.pairs, [['A', 'B']], 'only valid direction remains');
    });

    QUnit.test('keeps pair when both hotspots allow start and end direction', function (assert) {
        assert.expect(2);
        const attrsA = { 'data-start': 'true', 'data-end': 'true' };
        const attrsB = { 'data-start': 'true', 'data-end': 'true' };
        const interaction = {
            attr: function (name) {
                return name === 'data-interaction-subtype' ? 'arrow' : undefined;
            },
            getChoices: function () {
                return [
                    {
                        id: function () {
                            return 'A';
                        },
                        attr: function (name) {
                            return attrsA[name];
                        }
                    },
                    {
                        id: function () {
                            return 'B';
                        },
                        attr: function (name) {
                            return attrsB[name];
                        }
                    }
                ];
            }
        };
        const sanitized = arrowResponseHelper.sanitizePairChange(interaction, [['A', 'B']]);

        assert.notOk(sanitized.changed, 'valid bidirectional pair is preserved');
        assert.deepEqual(sanitized.pairs, [['A', 'B']], 'pair remains available');
    });

    QUnit.test('reverses only selected directional pair via controller helper', function (assert) {
        assert.expect(2);
        const attrsA = {};
        const attrsB = {};
        const attrsC = {};
        const attrsD = {};
        const interaction = {
            attr: function (name) {
                return name === 'data-interaction-subtype' ? 'arrow' : undefined;
            },
            getChoices: function () {
                return [
                    {
                        id: function () {
                            return 'A';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsA[name];
                            }
                            attrsA[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'B';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsB[name];
                            }
                            attrsB[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'C';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsC[name];
                            }
                            attrsC[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'D';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsD[name];
                            }
                            attrsD[name] = value;
                        }
                    }
                ];
            }
        };
        const result = arrowResponseHelper.reverseSelectedPair(
            interaction,
            [
                ['A', 'B'],
                ['C', 'D']
            ],
            'A',
            'B'
        );

        assert.ok(result.changed, 'selected pair is reversed');
        assert.deepEqual(result.pairs, [
            ['B', 'A'],
            ['C', 'D']
        ], 'only selected pair is modified');
    });

    QUnit.test('does not mutate hotspot roles when reversal remains blocked', function (assert) {
        assert.expect(7);
        const attrsA = { 'data-start': 'true', 'data-end': 'false' };
        const attrsB = { 'data-start': 'false', 'data-end': 'true' };
        const attrsC = { 'data-start': 'false', 'data-end': 'true' };
        const attrsD = { 'data-start': 'true', 'data-end': 'false' };
        const interaction = {
            attr: function (name) {
                return name === 'data-interaction-subtype' ? 'arrow' : undefined;
            },
            getChoices: function () {
                return [
                    {
                        id: function () {
                            return 'A';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsA[name];
                            }
                            attrsA[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'B';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsB[name];
                            }
                            attrsB[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'C';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsC[name];
                            }
                            attrsC[name] = value;
                        }
                    },
                    {
                        id: function () {
                            return 'D';
                        },
                        attr: function (name, value) {
                            if (typeof value === 'undefined') {
                                return attrsD[name];
                            }
                            attrsD[name] = value;
                        }
                    }
                ];
            }
        };

        const result = arrowResponseHelper.reverseSelectedPair(
            interaction,
            [
                ['A', 'B'],
                ['C', 'D']
            ],
            'A',
            'B'
        );

        assert.notOk(result.changed, 'reversal is rejected');
        assert.ok(result.blocked, 'blocked flag is set');
        assert.deepEqual(result.pairs, [
            ['A', 'B'],
            ['C', 'D']
        ], 'original normalized pairs are returned');
        assert.strictEqual(attrsA['data-start'], 'true', 'source start role is restored');
        assert.strictEqual(attrsA['data-end'], 'false', 'source end role is restored');
        assert.strictEqual(attrsB['data-start'], 'false', 'target start role is restored');
        assert.strictEqual(attrsB['data-end'], 'true', 'target end role is restored');
    });
});
