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
define([
    'lodash',
    'taoQtiItem/qtiXmlRenderer/renderers/interactions/TextEntryInteraction',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/textEntryInteraction'
], function (_, TextEntryInteractionRenderer, textEntryInteractionTpl) {
    'use strict';

    QUnit.module('TextEntryInteraction renderer - UMFI attribute serialization');

    const createInteraction = function createInteraction(attributes) {
        return {
            qtiClass: 'textEntryInteraction',
            getAttributes: function getAttributes() {
                return _.clone(attributes);
            }
        };
    };

    QUnit.test('getData uses single quotes for data-umfi-values without escaping JSON', function (assert) {
        const interaction = createInteraction({
            responseIdentifier: 'RESPONSE',
            'data-umfi-values':
                '[{"group":"GROUP_1","canonical":"France","variants":["France","French Republic"]}]'
        });

        const result = TextEntryInteractionRenderer.getData(interaction, {
            tag: 'textEntryInteraction',
            attributes: interaction.getAttributes()
        });

        assert.strictEqual(
            result.attributesMarkup,
            'responseIdentifier="RESPONSE" data-umfi-values=\'[{"group":"GROUP_1","canonical":"France","variants":["France","French Republic"]}]\''
        );
        assert.strictEqual(result.attributesMarkup.indexOf('&quot;'), -1);
    });

    QUnit.test('rendered textEntryInteraction XML stays well-formed with scoring model metadata', function (assert) {
        const interaction = createInteraction({
            responseIdentifier: 'RESPONSE',
            'data-item-type': 'umfi-closed',
            'data-case-sensitive': 'false',
            'data-umfi-values':
                '[{"group":"GROUP_1","canonical":"France","variants":["France","French Republic"]},{"group":"GROUP_2","canonical":"Germany","variants":["Germany","Federal Republic of Germany"]}]',
            'data-scoring-model': '{"2":1}'
        });

        const tplData = TextEntryInteractionRenderer.getData(interaction, {
            tag: 'textEntryInteraction',
            attributes: interaction.getAttributes()
        });
        const xml = textEntryInteractionTpl(tplData);
        const doc = new DOMParser().parseFromString(xml, 'application/xml');

        assert.strictEqual(doc.getElementsByTagName('parsererror').length, 0, 'generated XML is well-formed');
        assert.ok(xml.indexOf('data-scoring-model=\'{"2":1}\'') > -1, 'scoring model JSON uses single quotes');
        assert.strictEqual(xml.indexOf('data-scoring-model="{'), -1, 'does not use broken double-quoted JSON');
    });
});
