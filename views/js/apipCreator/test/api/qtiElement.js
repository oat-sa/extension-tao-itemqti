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
    'taoQtiItem/apipCreator/api/qtiElement',
    'taoQtiItem/apipCreator/api/apipItem',
    'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
], function (QtiElement, ApipItem, xml) {
    'use strict';
    var apipItem = new ApipItem(xml);

    QUnit.test("qtiElement.getAccessElements()", function () {
        var qtiElement = apipItem.getQtiElementBySerial('img1'),
            accessElements = qtiElement.getAccessElements();
        QUnit.equal(accessElements.length, 1);
        QUnit.equal(accessElements[0].data.getAttribute('identifier'), 'ae000');
    });

    QUnit.test("qtiElement.getAccessElementByInclusionOrder()", function () {
        var qtiElement = apipItem.getQtiElementBySerial('prompt1'),
            accessElements = qtiElement.getAccessElementByInclusionOrder('textOnlyDefaultOrder');
        
        QUnit.equal(accessElements.data.getAttribute('identifier'), 'ae001');
        QUnit.equal(accessElements.serial, 'accessElement2');
    });

    QUnit.test("qtiElement.createAccessElement()", function () {
        var qtiElement = apipItem.getQtiElementBySerial('prompt1'),
        accessElement = qtiElement.createAccessElement();
        
        QUnit.ok(accessElement.serial.indexOf('accessElement') === 0);
        QUnit.equal(accessElement.data.getAttribute('serial'), accessElement.serial);
        QUnit.notEqual(apipItem.getAccessElementBySerial(accessElement.serial), null);
    });

    /*QUnit.test("qtiElement.getNativeOrder()", function () {
    });*/
});