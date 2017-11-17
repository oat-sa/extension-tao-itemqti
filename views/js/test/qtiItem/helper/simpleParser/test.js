/**
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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/helper/simpleParser',
    'text!taoQtiItem/test/samples/qtiv2p1/extended_text_rubric/qti.xml',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/core/Container',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer'
], function($, _, simpleParser, sampleXML, Loader, Container, XmlRenderer){
    'use strict';

    QUnit.module('This is a very old test');

    QUnit.test('parse inline sample', function(assert){

        var $rubricBlockXml = $(sampleXML).find('rubricBlock');
        var mathNs = 'm';//for 'http://www.w3.org/1998/Math/MathML'
        var data = simpleParser.parse($rubricBlockXml, {
            ns : {
                math : mathNs
            }
        });
        var loader;

        QUnit.stop();

        QUnit.ok(data.body.body, 'has body');
        QUnit.equal(_.size(data.body.elements), 4, 'elements ok');

        loader = new Loader();
        loader.loadRequiredClasses(data, function(){
            var xmlRenderer;
            var container = new Container();
            this.loadContainer(container, data.body);

            xmlRenderer = new XmlRenderer({shuffleChoices : false});
            xmlRenderer.load(function(){
                var xml = container.render(this);

                var $container = $('<prompt>').html(xml);
                var containerData = simpleParser.parse($container, {
                    ns : {
                        math : mathNs
                    }
                });
                var containerBis = new Container();
                loader.loadContainer(containerBis, containerData.body);

                QUnit.start();
                assert.equal(xml.length, containerBis.render(this).length);
            });
        });
    });

    QUnit.module('Parser test');

    QUnit
        .cases([
            {
                title: 'img',
                xml: '<div>this is an image: <img src="my/image.png" />. How cool is that???</div>',
                expectedBody: 'this is an image: {{img_XXX}}. How cool is that???',
                expectedElement: 'img',
                expectedAttributes: { src: 'my/image.png' }
            },
            {
                title: 'printedVariable',
                xml: '<div>this is a printedVariable: <printedVariable identifier="SCORE_TOTAL" base="10" powerForm="false" delimiter=";" mappingIndicator="=" format="%2g" index="-1" field="test"/>. How cool is that???</div>',
                expectedBody: 'this is a printedVariable: {{printedVariable_XXX}}. How cool is that???',
                expectedElement: 'printedVariable',
                expectedAttributes: {
                    "identifier": "SCORE_TOTAL",
                    "base": "10",
                    "powerForm": "false",
                    "delimiter": ";",
                    "mappingIndicator": "=",
                    "format": "%2g",
                    "index": "-1",
                    "field": "test"
                }
            }
        ])
        .test('Elements parsing: ', function(data, assert) {
            var parsed = simpleParser.parse(data.xml);
            var serialRegexp = /{{([a-z_]+)_[0-9a-z]*}}/i;

            var body = parsed.body,
                parsedBody = body.body.replace(serialRegexp, '{{$1_XXX}}'),
                bodyElementsSerials = Object.keys(body.elements),
                serial = bodyElementsSerials[0];

            assert.equal(bodyElementsSerials.length, 1, '1 element has been found');
            assert.equal(parsedBody, data.expectedBody, 'parsed body is correct: ' + parsedBody);
            assert.equal(serial.indexOf(data.expectedElement), 0, 'element is of the expected type, with serial ' + bodyElementsSerials[0]);
            assert.deepEqual(body.elements[serial].attributes, data.expectedAttributes, 'element has the expected attributes');
        });

});