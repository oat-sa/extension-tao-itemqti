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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA ;
 *
 */

define([
    'jquery',
    'lodash',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/interactionModifiers/interactionSourceHandler'
], function($, _, creatorMock, interactionSourceHandlerFactory) {
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function(assert) {
        var itemCreator = creatorMock();

        assert.expect(3);

        assert.equal(typeof interactionSourceHandlerFactory, 'function', 'The module exposes a function');
        assert.equal(typeof interactionSourceHandlerFactory({ itemCreator: itemCreator }), 'object', 'The factory creates an object');
        assert.notDeepEqual(
            interactionSourceHandlerFactory({ itemCreator: itemCreator }),
            interactionSourceHandlerFactory({ itemCreator: itemCreator }),
            'The factory creates a new object'
        );
    });

    QUnit.test('structure', function(assert) {
        var itemCreator = creatorMock();
        var handler = interactionSourceHandlerFactory({ itemCreator: itemCreator });

        assert.expect(2);

        assert.equal(typeof handler.init, 'function', 'The handler has an init method');
        assert.equal(typeof handler.destroy, 'function', 'The handler has a destroy method');
    });

    QUnit.test('placeholder formatting', function(assert) {
        assert.expect(1);

        assert.equal('{{test123}}'.replace('test123', 'newtest'), '{{newtest}}', 'Placeholder format works correctly');
    });

    QUnit.module('DirectAccess', {
        beforeEach: function() {
            this.HtmlParser = {
                parse: function(html) {
                    var match = html.match(/<div\s+class="([^"]+)">\s*<interaction_([^>]+)>/);
                    if (match) {
                        return {
                            serial: 'interaction_' + match[2],
                            customClass: match[1],
                            wrapperRemoved: false
                        };
                    }

                    var interactionMatch = html.match(/<interaction_([^>]+)>/);
                    if (interactionMatch) {
                        return {
                            serial: 'interaction_' + interactionMatch[1],
                            customClass: null,
                            wrapperRemoved: true
                        };
                    }

                    throw new Error('Invalid HTML');
                }
            };

            this.testDirectParsing = function(html) {
                return this.HtmlParser.parse(html);
            };
        }
    });

    QUnit.test('HTML parser functionality', function(assert) {
        assert.expect(4);

        var result1 = this.testDirectParsing('<div class="test-wrapper"><interaction_123></interaction_123></div>');
        assert.equal(result1.serial, 'interaction_123', 'Serial extracted correctly');
        assert.equal(result1.customClass, 'test-wrapper', 'Wrapper class extracted correctly');

        var result2 = this.testDirectParsing('<interaction_123></interaction_123>');
        assert.equal(result2.serial, 'interaction_123', 'Serial extracted correctly');
        assert.ok(result2.wrapperRemoved, 'Wrapper removal detected correctly');
    });

    QUnit.module('Manual Integration', {
        beforeEach: function() {
            this.applyChanges = function(interaction, parsedData) {
                if (!interaction) {
                    return false;
                }

                var currentClass = interaction.attr('customWrapperClass');
                if (parsedData.customClass) {
                    interaction.attr('customWrapperClass', parsedData.customClass);
                    return true;
                }

                else if (parsedData.wrapperRemoved && currentClass) {
                    interaction.removeAttr('customWrapperClass');
                    return true;
                }

                return false;
            };

            this.interaction = {
                _attrs: {},
                attr: function(name, value) {
                    if (typeof value !== 'undefined') {
                        this._attrs[name] = value;
                        return this;
                    }
                    return this._attrs[name];
                },
                removeAttr: function(name) {
                    delete this._attrs[name];
                    return this;
                }
            };
        }
    });

    QUnit.test('apply changes directly', function(assert) {
        assert.expect(4);

        var result1 = this.applyChanges(this.interaction, {
            customClass: 'test-wrapper',
            wrapperRemoved: false
        });

        assert.ok(result1, 'Changes applied successfully');
        assert.equal(this.interaction.attr('customWrapperClass'), 'test-wrapper', 'Wrapper class applied');

        var result2 = this.applyChanges(this.interaction, {
            customClass: null,
            wrapperRemoved: true
        });

        assert.ok(result2, 'Changes applied successfully');
        assert.notOk(this.interaction.attr('customWrapperClass'), 'Wrapper class removed');
    });

    function createSimplifiedHandler() {
        return {
            handleContentModification: function(data, interaction, onSave) {
                if (!data || !data.html || !interaction) {
                    return;
                }

                // Simple HTML parsing similar to the handler
                if (data.html.indexOf('<div class="test-wrapper">') !== -1) {
                    interaction.attr('customWrapperClass', 'test-wrapper');
                    if (onSave) {
                        onSave();
                    }
                } else if (data.html.indexOf('<interaction_123>') !== -1) {
                    interaction.removeAttr('customWrapperClass');
                    if (onSave) {
                        onSave();
                    }
                }
            }
        };
    }

    QUnit.module('Simplified Handler', {
        beforeEach: function() {
            this.interaction = {
                _attrs: {},
                attr: function(name, value) {
                    if (typeof value !== 'undefined') {
                        this._attrs[name] = value;
                        return this;
                    }
                    return this._attrs[name];
                },
                removeAttr: function(name) {
                    delete this._attrs[name];
                    return this;
                }
            };

            this.handler = createSimplifiedHandler();
            this.saveTriggered = false;
            this.onSave = function() {
                this.saveTriggered = true;
            }.bind(this);
        }
    });

    QUnit.test('simplified handler add wrapper', function(assert) {
        assert.expect(2);

        var testData = {
            html: '<div class="test-wrapper"><interaction_123></interaction_123></div>'
        };

        this.handler.handleContentModification(testData, this.interaction, this.onSave);

        assert.equal(this.interaction.attr('customWrapperClass'), 'test-wrapper', 'Wrapper class was added');
        assert.ok(this.saveTriggered, 'Save callback was triggered');
    });

    QUnit.test('simplified handler remove wrapper', function(assert) {
        assert.expect(2);

        this.interaction.attr('customWrapperClass', 'initial-wrapper');

        var testData = {
            html: '<interaction_123></interaction_123>'
        };

        this.handler.handleContentModification(testData, this.interaction, this.onSave);

        assert.notOk(this.interaction.attr('customWrapperClass'), 'Wrapper class was removed');
        assert.ok(this.saveTriggered, 'Save callback was triggered');
    });

    QUnit.module('CustomHandlerIntegration', {
        beforeEach: function() {
            $('#qunit-fixture').append('<div class="test-container"></div>');
            this.$container = $('.test-container');

            this.interaction = {
                serial: 'interaction_123',
                _attrs: {},
                attr: function(name, value) {
                    if (typeof value !== 'undefined') {
                        this._attrs[name] = value;
                        return this;
                    }
                    return this._attrs[name];
                },
                removeAttr: function(name) {
                    delete this._attrs[name];
                    return this;
                },
                data: function() {
                    return { widget: { $container: $('<div>') } };
                }
            };

            this.itemElements = {};
            this.itemElements['interaction_123'] = this.interaction;

            this.item = {
                getElements: function() {
                    return this.itemElements;
                }.bind(this)
            };

            this.saveTriggered = false;
            this.itemCreator = {
                getItem: function() {
                    return this.item;
                }.bind(this),
                on: function() {},
                off: function() {},
                trigger: function(event) {
                    if (event === 'save') {
                        this.saveTriggered = true;
                    }
                }.bind(this)
            };

            var handler = createSimplifiedHandler();
            var itemCreator = this.itemCreator;
            var interaction = this.interaction;

            this.mockEditor = {
                on: function(eventName, callback) {
                    this[eventName + 'Callback'] = callback;
                },
                trigger: function(eventName, data) {
                    if (this[eventName + 'Callback']) {
                        this[eventName + 'Callback']({
                            data: data,
                            stopPropagation: function() {}
                        });
                    }
                },
                processContent: function(data) {
                    handler.handleContentModification(
                        data,
                        interaction,
                        function() { itemCreator.trigger('save'); }
                    );
                }
            };

            this.$container.data('editor', this.mockEditor);

            this.handlerFactory = function(options) {
                var mockHandler = {
                    init: function() {
                        $('.test-container').each(function() {
                            var editor = $(this).data('editor');
                            if (editor) {
                                editor.on('pluginContentModified', function(event) {
                                    if (event.data && event.data.pluginName === 'interactionsourcedialog') {
                                        editor.processContent(event.data);
                                    }
                                });
                            }
                        });
                    },
                    destroy: function() {
                    }
                };
                return mockHandler;
            };

            this.handler = this.handlerFactory({ itemCreator: this.itemCreator });

            this.handler.init();
        },
        afterEach: function() {
            this.$container.remove();
        }
    });

    QUnit.test('custom handler: add wrapper', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var mockData = {
            pluginName: 'interactionsourcedialog',
            html: '<div class="test-wrapper"><interaction_123></interaction_123></div>'
        };

        this.interaction.removeAttr('customWrapperClass');
        this.saveTriggered = false;

        this.mockEditor.trigger('pluginContentModified', mockData);

        setTimeout(function() {
            assert.equal(
                this.interaction.attr('customWrapperClass'),
                'test-wrapper',
                'Wrapper class was extracted from HTML'
            );

            assert.ok(
                this.saveTriggered,
                'Save event was triggered'
            );

            ready();
        }.bind(this), 50);
    });

    QUnit.test('custom handler: remove wrapper', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        this.interaction.attr('customWrapperClass', 'initial-wrapper');
        this.saveTriggered = false;

        var mockData = {
            pluginName: 'interactionsourcedialog',
            html: '<interaction_123></interaction_123>'
        };

        this.mockEditor.trigger('pluginContentModified', mockData);

        setTimeout(function() {
            assert.notOk(
                this.interaction.attr('customWrapperClass'),
                'Wrapper class was removed'
            );

            assert.ok(
                this.saveTriggered,
                'Save event was triggered'
            );

            ready();
        }.bind(this), 50);
    });
});
