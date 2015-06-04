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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
require([
    'jquery',
    'taoQtiItem/apipCreator/api/accessElementInfo',
    'taoQtiItem/apipCreator/api/apipItem',
    'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
], function ($, AccessElementInfo, ApipItem, xml) {
    'use strict';

    QUnit.test("AccessElementInfo.getAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            signingTextElement = accessElement.getAccessElementInfo('signing')[0];
            
        QUnit.equal(
            signingTextElement.getAttribute('signFileASL.videoFileInfo.fileHref'),
            signingTextElement.data.querySelector('fileHref').innerHTML
        );

        QUnit.equal(
            signingTextElement.getAttribute('signFileASL.videoFileInfo.contentLinkIdentifier'),
            signingTextElement.data.querySelector('videoFileInfo').getAttribute('contentLinkIdentifier')
        );
    });
    
    QUnit.test("AccessElementInfo.setAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            signingTextElement = accessElement.getAccessElementInfo('signing')[0];
            
        signingTextElement.setAttribute('signFileASL.videoFileInfo.contentLinkIdentifier', 'verbaltext000_test');
        QUnit.equal(
            signingTextElement.getAttribute('signFileASL.videoFileInfo.contentLinkIdentifier'),
            'verbaltext000_test'
        );

        signingTextElement.setAttribute('signFileASL.videoFileInfo.fileHref', 'fileHref_test');
        QUnit.equal(
            signingTextElement.getAttribute('signFileASL.videoFileInfo.fileHref'),
            'fileHref_test'
        );
    });
});