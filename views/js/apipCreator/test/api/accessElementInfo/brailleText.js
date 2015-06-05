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
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0];
            
        QUnit.equal(
            brailleTextElement.getAttribute('brailleTextString'),
            brailleTextElement.data.querySelector('brailleTextString').innerHTML
        );
        
        QUnit.equal(
            brailleTextElement.getAttribute('brailleTextString.contentLinkIdentifier'),
            brailleTextElement.data.querySelector('brailleTextString').getAttribute('contentLinkIdentifier')
        );

        
    });
    
    QUnit.test("AccessElementInfo.setAttribute()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText')[0];
            
        brailleTextElement.setAttribute('brailleTextString.contentLinkIdentifier', 'brailletextnv000_test');
        QUnit.equal(
            brailleTextElement.data.querySelector('brailleTextString').getAttribute('contentLinkIdentifier'),
            'brailletextnv000_test'
        );

        QUnit.equal(
            brailleTextElement.getAttribute('brailleTextString.wrong'),
            null
        );
    });
});