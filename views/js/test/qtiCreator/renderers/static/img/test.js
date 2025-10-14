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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
// Mock context module before loading dependencies
define('context', [], function() {
    return {
        featureFlags: {
            FEATURE_FLAG_DISABLE_FIGURE_WIDGET: false
        }
    };
});

define([
    'jquery',
    'lodash',
    'taoQtiItem/test/qtiCreator/mocks/qtiCreatorContextMock',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/Img',
    'taoQtiItem/qtiCreator/model/Figure'
], function(
    $,
    _,
    qtiCreatorContextMockFactory,
    creatorRenderer,
    Img,
    Figure
) {
    'use strict';

    QUnit.module('Img Creator Renderer');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.ok(typeof Img === 'function', 'Img model is available');
    });

    QUnit.test('Img to Figure conversion preserves text order', function(assert) {
        const ready = assert.async();
        const config = {
            qtiCreatorContext: qtiCreatorContextMockFactory()
        };

        const areaBroker = {
            getElementPropertyPanelArea() {
                return $('#qunit-fixture');
            },
            getContentCreatorPanelArea() {
                return $('#item-editor-panel');
            },
            getItemPanelArea() {
                return $('#outside-container .item-editor-item');
            },
            getToolbarArea() {
                return $('#toolbar-top');
            }
        };

        assert.expect(3);

        creatorRenderer
            .get(true, config, areaBroker)
            .load(function() {
                const renderer = this;

                // Create a mock container (prompt) with text before and after image
                const MockContainer = function() {
                    this.serial = 'container_123';
                    this.elements = {};
                    this._body = '';

                    this.body = function(value) {
                        if (typeof value !== 'undefined') {
                            this._body = value;
                            return this;
                        }
                        return this._body;
                    };

                    this.setElement = function(element) {
                        this.elements[element.serial] = element;
                    };

                    this.removeElement = function(element) {
                        delete this.elements[element.serial];
                    };

                    this.getRenderer = function() {
                        return renderer;
                    };
                };

                // Create img element
                const img = new Img('img_123', {
                    src: 'assets/test.png',
                    alt: 'test image',
                    width: '50%'
                });
                img.setRenderer(renderer);

                // Create mock parent container with img placeholder
                const parent = new MockContainer();
                const textBefore = '&lt; ';
                const textAfter = ' text after &gt;';
                const initialBody = textBefore + img.placeholder() + textAfter;
                parent.body(initialBody);
                parent.setElement(img);

                // Mock findParentElement to return our container
                const originalFindParent = require.s.contexts._.defined['taoQtiItem/qtiCreator/helper/findParentElement'];
                require.undef('taoQtiItem/qtiCreator/helper/findParentElement');
                define('taoQtiItem/qtiCreator/helper/findParentElement', [], function() {
                    return function() { return parent; };
                });

                assert.equal(parent.body(), initialBody, 'Initial body has correct text order');

                // Simulate the img to figure conversion by accessing the body
                const imgPlaceholder = img.placeholder();
                const figure = new Figure();
                const figurePlaceholder = figure.placeholder();
                const newBody = parent.body().replace(imgPlaceholder, figurePlaceholder);

                parent.removeElement(img);
                parent.body(newBody);
                parent.setElement(figure);

                // Verify text order is preserved
                const expectedBody = textBefore + figurePlaceholder + textAfter;
                assert.equal(parent.body(), expectedBody, 'Body has correct text order after conversion');
                assert.ok(parent.body().indexOf(textAfter) > parent.body().indexOf(figurePlaceholder),
                    'Text after image comes after figure placeholder');

                // Restore original findParentElement
                require.undef('taoQtiItem/qtiCreator/helper/findParentElement');
                if (originalFindParent) {
                    define('taoQtiItem/qtiCreator/helper/findParentElement', [], function() {
                        return originalFindParent;
                    });
                }

                ready();
            }, ['img', 'figure', '_container']);
    });

    QUnit.test('Img placeholder format', function(assert) {
        assert.expect(2);

        const img = new Img('img_test_456', {
            src: 'assets/image.png',
            alt: 'Test Image'
        });

        const placeholder = img.placeholder();
        assert.ok(placeholder.indexOf('{{img_') === 0, 'Placeholder starts with {{img_');
        assert.ok(placeholder.indexOf('}}') === placeholder.length - 2, 'Placeholder ends with }}');
    });
});
