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
define([
    'taoQtiItem/apipCreator/api/apipItem', 
    'taoQtiItem/apipCreator/helper/parser',
    'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
], function (ApipItem, parser, xml) {
    'use strict';
    var apipItem = new ApipItem(xml);

    QUnit.test("ApipItem.getItemBodyModel()", function () {
        QUnit.equal(apipItem.getItemBodyModel().tagName, 'itemBody');
        //ensure that element was cloned.
        QUnit.notEqual(apipItem.getItemBodyModel(), $(xml).find('itemBody')[0]);
    });

    QUnit.test("creator.getQtiElementBySerial()", function () {
        var qtiChoiceElement = apipItem.getQtiElementBySerial('simpleChoice1'),
            qtiImgElement = apipItem.getQtiElementBySerial('img1'),
            qtiNamespaceDivElement = apipItem.getQtiElementBySerial('div2');
        
        QUnit.equal(typeof qtiChoiceElement, 'object');
        QUnit.ok(qtiChoiceElement.data.tagName && qtiChoiceElement.data.tagName === 'simpleChoice');
        QUnit.equal(qtiChoiceElement.serial, 'simpleChoice1');


        QUnit.equal(typeof qtiImgElement, 'object');
        QUnit.ok(qtiImgElement.data.tagName && qtiImgElement.data.tagName === 'img');
        QUnit.equal(qtiImgElement.serial, 'img1');
        
        QUnit.equal(typeof qtiNamespaceDivElement, 'object');
        QUnit.ok(qtiNamespaceDivElement.data.tagName && qtiNamespaceDivElement.data.localName === 'div');
        QUnit.equal(qtiNamespaceDivElement.serial, 'div2');

        QUnit.equal(apipItem.getQtiElementBySerial('wrongSerial'), null);
    });

    QUnit.test("creator.getAccessElementBySerial()", function () {
        var acccessElement = apipItem.getAccessElementBySerial('accessElement1');
        QUnit.equal(typeof acccessElement, 'object');
        QUnit.ok(acccessElement.data.localName && acccessElement.data.localName === 'accessElement');
        QUnit.equal(acccessElement.serial, 'accessElement1');

        QUnit.equal(apipItem.getAccessElementBySerial('wrongSerial'), null);
    });

    QUnit.test("creator.getAccessElementsByInclusionOrder()", function () {
        var acccessElement = apipItem.getAccessElementsByInclusionOrder('textOnlyDefaultOrder');
        QUnit.equal(acccessElement.length, 6);
        //todo check inclusion order here
    });

    QUnit.test("creator.toXML()", function () {
        var xmlString = apipItem.toXML(),
            xml = parser.stringToXml(xmlString);

        QUnit.equal($(xml).find('[serial]').length, 0);
        QUnit.equal($(xml).find('assessmentItem').length, 1);
    });
    
    QUnit.test("creator.addSerialAttr()", function () {
        var apipItem = new ApipItem(xml),
            spanNum = apipItem.$apipDoc.find('span').length,
            penultQtiElement = apipItem.getQtiElementBySerial('span' + (spanNum-1)),
            qtiElement = apipItem.getQtiElementBySerial('span' + spanNum);
        
        QUnit.equal(penultQtiElement.serial, 'span' + (spanNum-1));
        QUnit.equal(qtiElement.serial, 'span' + spanNum);
        
        penultQtiElement.data.setAttribute('serial', 'span' + (spanNum + 1));
        qtiElement.data.removeAttribute('serial');
        
        apipItem.addSerialAttr(qtiElement.data);
        
        QUnit.equal(apipItem.xpath("//*[@serial='" + qtiElement.data.getAttribute('serial') + "']").length , 1);
    });
});