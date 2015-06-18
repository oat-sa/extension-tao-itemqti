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

    QUnit.test("AccessElementInfo.remvove()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0];
            
        QUnit.ok($.contains(apipItem.xpath("//apip:accessibilityInfo")[0], brailleTextElement.data));
        brailleTextElement.remove();
        QUnit.ok(!$.contains(apipItem.xpath("//apip:accessibilityInfo")[0], brailleTextElement.data));
    });
    
    QUnit.test("AccessElementInfo.getAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0],
            spokenTextElement;
        
        QUnit.equal(
            brailleTextElement.getAttribute('brailleTextString'),
            'In the figure, what fraction of the rectangle ABCD is shaded?'
        );

        accessElement = apipItem.getAccessElementBySerial('accessElement1');
        spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText'),
            'Figure of rectangle A-B-C-D. The rectangle is divided into twelve equally sized squares. Four of the squares are shaded.'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('textToSpeechPronunciation'),
            'Figure of rect-tangle A-B-C-D. The rect-tangle is divided into twelve equally sized squares. Four of the squares are shaded.'
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.mimeType'),
            'audio/mpeg'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            'apip_exemplar01resources/apip_exemplar01.mp3'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.startTime'),
            '1000'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.duration'),
            '3000'
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].mimeType'),
            'audio/mpeg'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].fileHref'),
            'apip_exemplar01resources/apip_exemplar01.mp3'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].startTime'),
            '1000'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].duration'),
            '3000'
        );

        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].mimeType'),
            'audio/mpeg'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].fileHref'),
            'apip_exemplar01resources/apip_exemplar02.mp3'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].startTime'),
            '4000'
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].duration'),
            '6000'
        );
    });
    
    
    QUnit.test("AccessElementInfo.setAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0],
            spokenTextElement;
        
        brailleTextElement.setAttribute('brailleTextString', 'testValue1');
        QUnit.equal(
            brailleTextElement.getAttribute('brailleTextString'),
            'testValue1'
        );
        
        spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
        //check that audioFileInfo is not exists.
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            null
        );

        //create audioFileInfo attribute
        spokenTextElement.setAttribute('audioFileInfo.fileHref', 'hrefValue');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            'hrefValue'
        );
        
        
        accessElement = apipItem.getAccessElementBySerial('accessElement1');
        spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
        
        spokenTextElement.setAttribute('spokenText', 'testValue1'),
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText'),
            'testValue1'
        );

        spokenTextElement.setAttribute('textToSpeechPronunciation', 'testValue2');
        QUnit.equal(
            spokenTextElement.getAttribute('textToSpeechPronunciation'),
            'testValue2'
        );

        spokenTextElement.setAttribute('audioFileInfo.mimeType', 'testValue3');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.mimeType'),
            'testValue3'
        );

        spokenTextElement.setAttribute('audioFileInfo.fileHref', 'testValue4');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            'testValue4'
        );

        spokenTextElement.setAttribute('audioFileInfo.startTime', 'testValue5');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.startTime'),
            'testValue5'
        );

        spokenTextElement.setAttribute('audioFileInfo.duration', 'testValue6');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.duration'),
            'testValue6'
        );


        spokenTextElement.setAttribute('audioFileInfo[1].mimeType', 'testValue7');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].mimeType'),
            'testValue7'
        );

        spokenTextElement.setAttribute('audioFileInfo[1].mimeType', 'testValue7_redefine');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].mimeType'),
            'testValue7_redefine'
        );
        
        spokenTextElement.setAttribute('audioFileInfo[1].fileHref', 'testValue8');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].fileHref'),
            'testValue8'
        );

        spokenTextElement.setAttribute('audioFileInfo[1].startTime', 'testValue9');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].startTime'),
            'testValue9'
        );

        spokenTextElement.setAttribute('audioFileInfo[1].duration', 'testValue10');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[1].duration'),
            'testValue10'
        );


        spokenTextElement.setAttribute('audioFileInfo[2].mimeType', 'testValue11');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].mimeType'),
            'testValue11'
        );

        spokenTextElement.setAttribute('audioFileInfo[2].fileHref', 'testValue12');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].fileHref'),
            'testValue12'
        );

        spokenTextElement.setAttribute('audioFileInfo[2].startTime', 'testValue13');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].startTime'),
            'testValue13'
        );

        spokenTextElement.setAttribute('audioFileInfo[2].duration', 'testValue14');
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo[2].duration'),
            'testValue14'
        );
    });
    
    QUnit.test("AccessElementInfo.removeAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
        
        spokenTextElement.setAttribute('spokenText', 'testValue1'),
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText'),
            'testValue1'
        );
        spokenTextElement.removeAttribute('spokenText');
        QUnit.equal(
            spokenTextElement.getAttribute('spokenText'),
            null
        );


        spokenTextElement.setAttribute('audioFileInfo[1].fileHref', 'testValue2');
        spokenTextElement.setAttribute('audioFileInfo[2].fileHref', 'testValue3');
        QUnit.equal(
            spokenTextElement.apipItem.xpath('apip:audioFileInfo', spokenTextElement.data).length,
            2
        );
        
        spokenTextElement.removeAttribute('audioFileInfo[2]');
        QUnit.equal(
            spokenTextElement.apipItem.xpath('apip:audioFileInfo', spokenTextElement.data).length,
            1
        );
        QUnit.equal(
            spokenTextElement.getAttribute('audioFileInfo.fileHref'),
            'testValue2'
        );


        spokenTextElement.removeAttribute('audioFileInfo');
        QUnit.equal(
            spokenTextElement.apipItem.xpath('apip:audioFileInfo', spokenTextElement.data).length,
            0
        );
    });
    
    QUnit.test("AccessElementInfo.getAttributeNum()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            spokenTextElement = accessElement.getAccessElementInfo('spoken')[0];
            
        QUnit.equal(
            spokenTextElement.getAttributeNum('audioFileInfo'),
            2
        );
        QUnit.equal(
            spokenTextElement.getAttributeNum('audioFileInfo.fileHref'),
            2
        );

        QUnit.equal(
            spokenTextElement.getAttributeNum('spokenText'),
            1
        );
        QUnit.equal(
            spokenTextElement.getAttributeNum('textToSpeechPronunciation'),
            1
        );
    });
    
    QUnit.test("AccessElementInfo.getAssociatedAccessElement()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0];
            
        QUnit.equal(
            brailleTextElement.getAssociatedAccessElement().serial,
            accessElement.serial
        );
    });
});