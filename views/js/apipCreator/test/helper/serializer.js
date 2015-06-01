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
 define(
    [
        'jquery',
        '/taoQtiItem/views/js/apipCreator/helper/serializer.js',
        'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
    ], 
    function ($, serializer, xml) {
        'use strict';
        var xmlDoc = (new DOMParser()).parseFromString(xml, "text/xml");

        QUnit.test("serializer.serialize()", function () {
            var xmlString = serializer.serialize(xmlDoc);
            QUnit.ok(xmlString.indexOf('<assessmentItem xmlns="http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p2"') === 0);
        });

        QUnit.test("serializer.serialize() non xml document given", function () {
            QUnit.throws(function () {
                serializer.serialize('wrong');
            }, TypeError);
        });
    }
);