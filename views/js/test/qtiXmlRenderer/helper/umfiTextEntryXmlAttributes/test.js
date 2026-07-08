define(['taoQtiItem/qtiXmlRenderer/helper/umfiTextEntryXmlAttributes'], function (umfiTextEntryXmlAttributes) {
    'use strict';

    QUnit.module('umfiTextEntryXmlAttributes');

    QUnit.test('prepareTextEntryRenderData keeps JSON literal and uses single quotes', assert => {
        const prepared = umfiTextEntryXmlAttributes.prepareTextEntryRenderData({
            responseIdentifier: 'RESPONSE',
            'data-item-type': 'umfi-closed',
            'data-umfi-values': '[["apple","apples"]]',
            'data-umfi-managed-outcomes': '["APPLE_FOUND"]',
            'data-umfi-rp-managed': 'true'
        });

        assert.ok(prepared.attributesMarkup.indexOf('data-umfi-values=\'[["apple","apples"]]\'') > -1);
        assert.ok(prepared.attributesMarkup.indexOf('responseIdentifier="RESPONSE"') > -1);
        assert.strictEqual(prepared.attributesMarkup.indexOf('data-umfi-managed-outcomes'), -1);
        assert.strictEqual(prepared.attributesMarkup.indexOf('&quot;'), -1);
    });

    QUnit.test('stripInternalAuthoringAttrsFromItemXml removes internal attrs only', assert => {
        const xml =
            '<textEntryInteraction responseIdentifier="RESPONSE" data-umfi-values=\'[["France","French Republic"]]\' data-umfi-rp-managed="true"/>';
        const sanitized = umfiTextEntryXmlAttributes.stripInternalAuthoringAttrsFromItemXml(xml);

        assert.strictEqual(sanitized.indexOf('data-umfi-rp-managed'), -1);
        assert.ok(sanitized.indexOf('data-umfi-values=\'[["France","French Republic"]]\'') > -1);
    });
});
