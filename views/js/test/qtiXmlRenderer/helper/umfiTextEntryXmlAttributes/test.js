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
define(['taoQtiItem/qtiXmlRenderer/helper/umfiTextEntryXmlAttributes'], function (umfiTextEntryXmlAttributes) {
    'use strict';

    QUnit.module('umfiTextEntryXmlAttributes');

    QUnit.test('prepareTextEntryRenderData keeps JSON literal and uses single quotes', assert => {
        const prepared = umfiTextEntryXmlAttributes.prepareTextEntryRenderData({
            responseIdentifier: 'RESPONSE',
            'data-item-type': 'umfi-closed',
            'data-umfi-values': '[{"group":"GROUP_1_FOUND","canonical":"apple","variants":["apple","apples"]}]',
            'data-umfi-managed-outcomes': '["GROUP_1_FOUND"]',
            'data-umfi-rp-managed': 'true'
        });

        assert.ok(
            prepared.attributesMarkup.indexOf(
                'data-umfi-values=\'[{"group":"GROUP_1_FOUND","canonical":"apple","variants":["apple","apples"]}]\''
            ) > -1
        );
        assert.ok(prepared.attributesMarkup.indexOf('responseIdentifier="RESPONSE"') > -1);
        assert.strictEqual(prepared.attributesMarkup.indexOf('data-umfi-managed-outcomes'), -1);
        assert.strictEqual(prepared.attributesMarkup.indexOf('&quot;'), -1);
    });

    QUnit.test('stripInternalAuthoringAttrsFromItemXml removes internal attrs only', assert => {
        const xml =
            '<textEntryInteraction responseIdentifier="RESPONSE" data-umfi-values=\'[{"group":"GROUP_1_FOUND","canonical":"France","variants":["France","French Republic"]}]\' data-umfi-rp-managed="true"/>';
        const sanitized = umfiTextEntryXmlAttributes.stripInternalAuthoringAttrsFromItemXml(xml);

        assert.strictEqual(sanitized.indexOf('data-umfi-rp-managed'), -1);
        assert.ok(
            sanitized.indexOf(
                'data-umfi-values=\'[{"group":"GROUP_1_FOUND","canonical":"France","variants":["France","French Republic"]}]\''
            ) > -1
        );
    });
});
