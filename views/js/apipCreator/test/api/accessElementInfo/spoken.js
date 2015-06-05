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
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
            
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText'),
            spokenTextElement.data.querySelector('spokenText').innerHTML
        );
        
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText.contentLinkIdentifier'),
            spokenTextElement.data.querySelector('spokenText').getAttribute('contentLinkIdentifier')
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.contentLinkIdentifier'),
            spokenTextElement.data.querySelector('audioFileInfo').getAttribute('contentLinkIdentifier')
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            'apip_exemplar01resources/apip_exemplar01.mp3'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].fileHref'),
            spokenTextElement.getAttribute('audioFileInfo.fileHref')
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].fileHref'),
            'apip_exemplar01resources/apip_exemplar02.mp3'
        );
    });
    
    QUnit.test("AccessElementInfo.setAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
            
        spokenTextElement.setAttribute('audioFileInfo[1].contentLinkIdentifier', 'verbaltext000_test');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].contentLinkIdentifier'),
            'verbaltext000_test'
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[3].contentLinkIdentifier'),
            null
        );
        //create new audioFileInfo node
        spokenTextElement.setAttribute('audioFileInfo[3].contentLinkIdentifier', 'verbaltext000_new');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[3].contentLinkIdentifier'),
            'verbaltext000_new'
        );
        
    });
});