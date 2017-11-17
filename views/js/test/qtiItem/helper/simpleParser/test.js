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
        .test('Simple elements parsing: ', function(data, assert) {
            var parsed = simpleParser.parse(data.xml);
            var serialRegexp = /{{([a-z_]+)_[0-9a-z]*}}/i;

            var body = parsed.body,
                parsedBody = body.body.replace(serialRegexp, '{{$1_XXX}}'),
                bodyElementsSerials = Object.keys(body.elements),
                serial = bodyElementsSerials[0];

            QUnit.expect(4);

            assert.equal(bodyElementsSerials.length, 1, '1 element has been found');
            assert.equal(parsedBody, data.expectedBody, 'parsed body is correct: ' + parsedBody);
            assert.equal(serial.indexOf(data.expectedElement), 0, 'element is of the expected type, with serial ' + bodyElementsSerials[0]);
            assert.deepEqual(body.elements[serial].attributes, data.expectedAttributes, 'element has the expected attributes');
        });

    QUnit
        .cases([
            {
                title: 'regular tooltip',
                xml: '<div>this is a tooltip: '
                    + '<span data-role="tooltip-target" aria-describedby="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Target</strong></span>'
                    + '<span data-role="tooltip-content" aria-hidden="true" id="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Content</strong></span>'
                    + '. How cool is that???</div>',
                expectedBody: 'this is a tooltip: {{_tooltip_XXX}}. How cool is that???',
                expectedElement: '_tooltip',
                expectedAttributes: {
                    "aria-describedby": "_tooltip-63etvf7pktf2jb16d2a09y"
                },
                expectedTarget: 'my <strong>Target</strong>',
                expectedContent: 'my <strong>Content</strong>'
            }, {
                title: 'empty tooltip',
                xml: '<div>this is a tooltip: '
                    + '<span data-role="tooltip-target" aria-describedby="_tooltip-63etvf7pktf2jb16d2a09y"></span>'
                    + '<span data-role="tooltip-content" aria-hidden="true" id="_tooltip-63etvf7pktf2jb16d2a09y"></span>'
                    + '. How cool is that???</div>',
                expectedBody: 'this is a tooltip: {{_tooltip_XXX}}. How cool is that???',
                expectedElement: '_tooltip',
                expectedAttributes: {
                    "aria-describedby": "_tooltip-63etvf7pktf2jb16d2a09y"
                },
                expectedTarget: '',
                expectedContent: ''
            }
        ])
        .test('Valid tooltip parsing: ', function(data, assert) {
            var parsed = simpleParser.parse(data.xml);
            var serialRegexp = /{{([a-z_]+)_[0-9a-z]*}}/i;

            var body = parsed.body,
                parsedBody = body.body.replace(serialRegexp, '{{$1_XXX}}'),
                bodyElementsSerials = Object.keys(body.elements),
                serial = bodyElementsSerials[0],
                tooltip = body.elements[serial];

            QUnit.expect(8);

            assert.equal(bodyElementsSerials.length, 1, '1 element has been found');
            assert.equal(parsedBody, data.expectedBody, 'parsed body is correct: ' + parsedBody);
            assert.equal(serial.indexOf(data.expectedElement), 0, 'element is of the expected type, with serial ' + bodyElementsSerials[0]);
            assert.deepEqual(tooltip.attributes, data.expectedAttributes, 'element has the expected attributes');

            assert.equal(tooltip.content, data.expectedContent, 'tooltip has the correct content');
            assert.equal(tooltip.body.body, data.expectedTarget, 'tooltip has the correct target');
            assert.ok(! _.isUndefined(tooltip.elements), 'tooltip has an element property');
            assert.ok(! _.isUndefined(tooltip.body.elements), 'tooltip body has an element property');
        });

    QUnit
        .cases([
            {
                title: 'orphan target',
                xml: '<div>this is a tooltip: '
                    + '<span data-role="tooltip-target" aria-describedby="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Target</strong></span>'
                    + '. How cool is that???</div>',
                expectedBody: 'this is a tooltip: <span data-role="tooltip-target" aria-describedby="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Target</strong></span>. How cool is that???'
            }, {
                title: 'orphan content',
                xml: '<div>this is a tooltip: '
                    + '<span data-role="tooltip-content" aria-hidden="true" id="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Content</strong></span>'
                    + '. How cool is that???</div>',
                expectedBody: 'this is a tooltip: <span data-role="tooltip-content" aria-hidden="true" id="_tooltip-63etvf7pktf2jb16d2a09y">my <strong>Content</strong></span>. How cool is that???'
            }
        ])
        .test('Incomplete tooltip parsing: ', function(data, assert) {
            var parsed = simpleParser.parse(data.xml);
            var serialRegexp = /{{([a-z_]+)_[0-9a-z]*}}/i;

            var body = parsed.body,
                parsedBody = body.body.replace(serialRegexp, '{{$1_XXX}}'),
                bodyElementsSerials = Object.keys(body.elements || {});

            QUnit.expect(2);

            assert.equal(bodyElementsSerials.length, 0, 'no elements have been found');
            assert.equal(parsedBody, data.expectedBody, 'parsed body is correct: ' + parsedBody);
        });

});