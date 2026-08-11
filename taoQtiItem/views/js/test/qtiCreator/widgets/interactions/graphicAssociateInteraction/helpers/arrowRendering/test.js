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

define(['taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowRendering'], function (
    arrowRenderingHelper
) {
    'use strict';

    function createInteraction(subtype, elements) {
        return {
            attr: function (name) {
                if (name === 'data-interaction-subtype') {
                    return subtype;
                }
            },
            paper: {
                forEach: function (iterator) {
                    elements.forEach(iterator);
                }
            }
        };
    }

    function createElement(classes) {
        return {
            attrs: {},
            node: {
                classList: {
                    contains: function (name) {
                        return classes.indexOf(name) !== -1;
                    }
                }
            },
            attr: function (name, value) {
                const self = this;
                if (typeof name === 'object' && name !== null) {
                    Object.keys(name).forEach(function (key) {
                        self.attrs[key] = name[key];
                    });
                    return;
                }
                this.attrs[name] = value;
            }
        };
    }

    QUnit.module('graphicAssociateInteraction arrow rendering helper');

    QUnit.test('detects arrow mode by interaction subtype', function (assert) {
        assert.expect(2);
        assert.ok(arrowRenderingHelper.isArrowMode(createInteraction('arrow', [])), 'arrow mode is detected');
        assert.notOk(arrowRenderingHelper.isArrowMode(createInteraction('line', [])), 'other subtype is not arrow mode');
    });

    QUnit.test('applies arrow-end only on association inner lines', function (assert) {
        assert.expect(3);

        const assocLine = createElement(['assoc-line-inner']);
        const nonAssocLine = createElement(['assoc-line-outer']);
        const interaction = createInteraction('arrow', [assocLine, nonAssocLine]);

        arrowRenderingHelper.applyToRenderedLines(interaction);

        assert.strictEqual(assocLine.attrs['arrow-end'], 'classic-wide-long', 'arrow style is applied on inner line');
        assert.strictEqual(assocLine.attrs.stroke, '#266d9c', 'arrow color is aligned with line color');
        assert.strictEqual(nonAssocLine.attrs['arrow-end'], undefined, 'other line layers are not modified');
    });

    QUnit.test('does not apply arrow-end outside arrow mode', function (assert) {
        assert.expect(1);

        const assocLine = createElement(['assoc-line-inner']);
        const interaction = createInteraction('line', [assocLine]);

        arrowRenderingHelper.applyToRenderedLines(interaction);

        assert.strictEqual(assocLine.attrs['arrow-end'], undefined, 'no arrow style is applied');
    });

    QUnit.test('filters invalid directional pairs in arrow mode', function (assert) {
        assert.expect(1);

        const choices = [
            {
                id: function () {
                    return 'start';
                },
                attr: function (name) {
                    return name === 'data-start' ? 'true' : 'false';
                }
            },
            {
                id: function () {
                    return 'end';
                },
                attr: function (name) {
                    return name === 'data-start' ? 'false' : 'true';
                }
            }
        ];

        const interaction = createInteraction('arrow', []);
        interaction.getChoices = function () {
            return choices;
        };

        const result = arrowRenderingHelper.filterValidPairs(interaction, [
            ['start', 'end'],
            ['end', 'start']
        ]);

        assert.deepEqual(result, [['start', 'end']], 'only start to end pair is accepted');
    });
});
