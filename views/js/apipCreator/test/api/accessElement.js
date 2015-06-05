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
    'lodash',
    'jquery',
    'taoQtiItem/apipCreator/api/accessElement',
    'taoQtiItem/apipCreator/api/apipItem',
    'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
], function (_, $, AccessElement, ApipItem, xml) {
    'use strict';
    var apipItem = new ApipItem(xml);

    QUnit.test("accessElement.getQtiElement()", function () {
        var accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            qtiElements = accessElement.getQtiElements();
            
        QUnit.equal(qtiElements.length, 1);
        QUnit.equal(qtiElements[0].data.getAttribute('id'), 'image1');
        QUnit.equal(qtiElements[0].serial, 'img1');
    });
    
    
    QUnit.test("accessElement.addQtiElement()", function () {
        var accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            qtiElement = apipItem.getQtiElementBySerial('prompt1'),
            qtiElements = accessElement.getQtiElements();
            
        QUnit.equal(qtiElements.length, 1);
        
        accessElement.addQtiElement(qtiElement);
        QUnit.equal(accessElement.getQtiElements().length, (qtiElements.length + 1));
        
        qtiElement = apipItem.getQtiElementBySerial('markup1');
        
        accessElement.addQtiElement(qtiElement);
        QUnit.equal(accessElement.getQtiElements().length, (qtiElements.length + 2));
    });
    
    
    QUnit.test("accessElement.remove()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            identifier = accessElement.data.getAttribute('identifier');
            
        QUnit.equal(identifier, 'ae000');
        QUnit.equal(apipItem.xpath("//*[@serial='" + accessElement.serial + "']").length, 1);
        QUnit.ok(apipItem.xpath("//apip:elementOrder[@identifierRef='" + identifier + "']").length > 0);
        
        accessElement.remove();
        
        QUnit.equal(apipItem.xpath("//*[@serial='" + accessElement.serial + "']").length, 0);
        QUnit.equal(apipItem.xpath("//*[@serial='" + accessElement.serial + "']").length, 0);
        QUnit.equal(apipItem.xpath("//apip:elementOrder[@identifierRef='" + identifier + "']").length, 0);
    });
    
    
    QUnit.test("accessElement.getAccessElementInfo()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement1'),
            infoNodes = accessElement.getAccessElementInfo(),
            brailleTextElement = accessElement.getAccessElementInfo('brailleText');
            
        QUnit.equal(infoNodes.length, 2);
        
        _.forEach(infoNodes, function (infoNode) {
            QUnit.ok($.contains(accessElement.data, infoNode.data.parentNode));
        });
        
        QUnit.equal(brailleTextElement.length, 1);
        QUnit.equal(brailleTextElement[0].data.localName, 'brailleText');
    });
    
    
    QUnit.test("accessElement.createAccessElementInfo()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement8'),
            signingTextElement,
            spokenTextElement,
            brailleTextElement;
            
        //create brailleText element
        QUnit.equal(accessElement.getAccessElementInfo('brailleText'), null); 
        brailleTextElement = accessElement.createAccessElementInfo('brailleText');
        
        QUnit.equal(accessElement.getAccessElementInfo('brailleText').length, 1); 
        QUnit.equal(brailleTextElement.data.localName, 'brailleText');
        QUnit.ok($.contains(accessElement.data, brailleTextElement.data));


        //create signing element (signFileASL type)
        QUnit.equal(accessElement.getAccessElementInfo('signing'), null);
        signingTextElement = accessElement.createAccessElementInfo('signing');
        
        QUnit.equal(accessElement.getAccessElementInfo('signing').length, 1); 
        QUnit.equal(signingTextElement.data.localName, 'signing');
        QUnit.ok($.contains(accessElement.data, signingTextElement.data));
        QUnit.equal(signingTextElement.data.querySelector('signFileSignedEnglish'), null); 
        
        //create signing element (signFileSignedEnglish type)
        accessElement.getAccessElementInfo('signing')[0].remove(); 
        QUnit.equal(accessElement.getAccessElementInfo('signing'), null); 
        signingTextElement = accessElement.createAccessElementInfo('signing', {type:'signFileSignedEnglish'});
        
        QUnit.equal(accessElement.getAccessElementInfo('signing').length, 1); 
        QUnit.equal(signingTextElement.data.localName, 'signing');
        QUnit.ok($.contains(accessElement.data, signingTextElement.data));
        QUnit.equal(signingTextElement.data.querySelectorAll('signFileSignedEnglish').length, 1); 
        
        
        //create spoken element
        accessElement.getAccessElementInfo('spoken')[0].remove(); 
        QUnit.equal(accessElement.getAccessElementInfo('spoken'), null); 
        spokenTextElement = accessElement.createAccessElementInfo('spoken');
        
        QUnit.equal(accessElement.getAccessElementInfo('spoken').length, 1); 
        QUnit.equal(spokenTextElement.data.localName, 'spoken');
        QUnit.ok($.contains(accessElement.data, spokenTextElement.data));
    });
    
    
    QUnit.test("accessElement.getInclusionOrders()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            inclusionOrders = accessElement.getInclusionOrders();
            
        QUnit.ok(_.isArray(inclusionOrders));
        QUnit.ok(_.indexOf(inclusionOrders, 'textOnlyDefaultOrder') >=0 );
        QUnit.ok(_.indexOf(inclusionOrders, 'textGraphicsDefaultOrder') >=0 );
        QUnit.ok(_.indexOf(inclusionOrders, 'brailleDefaultOrder') >=0 );
        QUnit.ok(_.indexOf(inclusionOrders, 'brailleDefaultOrder') >=0 );
        QUnit.ok(_.indexOf(inclusionOrders, 'aslDefaultOrder') >=0 );
        QUnit.equal(inclusionOrders.length, 5);
    });
    
    
    QUnit.test("accessElement.setInclusionOrder()", function () {
        var apipItem = new ApipItem(xml),
            accessElement = apipItem.getAccessElementBySerial('accessElement2'),
            identifier = accessElement.data.getAttribute('identifier');
        
        QUnit.equal(apipItem.xpath("//apip:textOnlyOnDemandOrder/apip:elementOrder[@identifierRef='" + identifier + "']").length, 0);
        accessElement.setInclusionOrder('textOnlyOnDemandOrder', 5);
        QUnit.equal(apipItem.xpath("//apip:textOnlyOnDemandOrder/apip:elementOrder[@identifierRef='" + identifier + "']").length, 1);
        QUnit.ok(apipItem.xpath("//apip:textOnlyOnDemandOrder/apip:elementOrder[@identifierRef='" + identifier + "']/apip:order")[0].innerHTML == 5);
        
        
        QUnit.ok(apipItem.xpath("//apip:textOnlyDefaultOrder/apip:elementOrder[@identifierRef='" + identifier + "']/apip:order")[0].innerHTML == 2);
        accessElement.setInclusionOrder('textOnlyDefaultOrder', 7);
        QUnit.ok(apipItem.xpath("//apip:textOnlyDefaultOrder/apip:elementOrder[@identifierRef='" + identifier + "']/apip:order")[0].innerHTML == 7);
    });
});