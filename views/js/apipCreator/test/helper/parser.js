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
        'taoQtiItem/apipCreator/helper/parser',
        'taoQtiItem/apipCreator/helper/serializer',
        'text!/taoQtiItem/views/js/apipCreator/test/assets/apip_example_exemplar01.xml'
    ], 
    function (parser, serializer, xml) {
        QUnit.test("parser.parse() parse form xml document", function () {
            var xmlDoc = parser.stringToXml(xml);
            QUnit.ok(xmlDoc.documentElement && xmlDoc.documentElement.nodeName === 'assessmentItem');
        });

        QUnit.test("parser.parse() parse form xml string", function () {
            var xmlString = xml,
                xmlDoc;

            xmlDoc = parser.parse(xmlString);
            QUnit.ok(xmlDoc.documentElement && xmlDoc.documentElement.nodeName === 'assessmentItem');
        });

        QUnit.test("parser.parse() check serial attribute", function () {
            var xmlDoc = parser.parse(xml);
            QUnit.ok($(xmlDoc).find('*').length === $(xmlDoc).find('[serial]').length, 'Each node has "serial" attribute');
        });
    }
);