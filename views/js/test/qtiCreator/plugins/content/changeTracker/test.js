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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * Test the changeTracker plugin
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/content/changeTracker'
], function ($, creatorMock, changeTrackerPlugin){
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function(assert){
        var itemCreator = creatorMock();

        QUnit.expect(3);

        assert.equal(typeof changeTrackerPlugin, 'function', 'The module exposes a function');
        assert.equal(typeof changeTrackerPlugin(itemCreator), 'object', 'The factory creates an object');
        assert.notDeepEqual(changeTrackerPlugin(itemCreator), changeTrackerPlugin(itemCreator), 'The factory creates an new object');
    });

    QUnit.test('plugin', function(assert){
        var itemCreator = creatorMock();
        var plugin;

        QUnit.expect(11);

        plugin = changeTrackerPlugin(itemCreator);

        assert.equal(typeof plugin.init, 'function', 'The plugin has an init method');
        assert.equal(typeof plugin.render, 'function', 'The plugin has a render method');
        assert.equal(typeof plugin.destroy, 'function', 'The plugin has a destroy method');
        assert.equal(typeof plugin.enable, 'function', 'The plugin has an enable method');
        assert.equal(typeof plugin.disable, 'function', 'The plugin has a disable method');
        assert.equal(typeof plugin.show, 'function', 'The plugin has a show method');
        assert.equal(typeof plugin.hide, 'function', 'The plugin has an hide method');
        assert.equal(typeof plugin.getHost, 'function', 'The plugin has a getHost method');
        assert.equal(typeof plugin.getName, 'function', 'The plugin has a getName method');
        assert.equal(typeof plugin.getConfig, 'function', 'The plugin has a getConfig method');
        assert.equal(typeof plugin.getAreaBroker, 'function', 'The plugin has a getAreaBroker method');
    });


    QUnit.module('behavior', {
        teardown: function(){
            $('.modal').remove();
            window.onbeforeunload = null;
        }
    });

    QUnit.asyncTest('preview without changes', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixtures'), {}, item);
        var plugin;

        QUnit.expect(1);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });
        itemCreator.on('preview', function(){
            assert.ok(true, 'preview called');

            plugin.destroy();
            QUnit.start();
        });
        itemCreator.trigger('preview');
    });

    QUnit.asyncTest('preview with changes', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixtures'), {}, item);
        var plugin;

        QUnit.expect(4);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });

        itemCreator.on('preview', function(){
            assert.ok(true, 'preview called');

            plugin.destroy();
            QUnit.start();
        });

        itemValue = 'bar';
        itemCreator.trigger('preview');

        setTimeout(function(){
            var $dialog = $('.modal');
            var $save     = $('.save', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($save.length, 1, 'The save button exists');

            $save.click();

        }, 100);
    });

    QUnit.asyncTest('preview with changes but not saved', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixtures'), {}, item);
        var plugin;

        QUnit.expect(4);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            assert.ok(false, 'Save must not be called');

            plugin.destroy();
            QUnit.start();
        });

        itemCreator.on('preview', function(){
            assert.ok(true, 'preview called');

            plugin.destroy();
            QUnit.start();
        });

        itemValue = 'bar';
        itemCreator.trigger('preview');

        setTimeout(function(){
            var $dialog = $('.modal');
            var $dontsave     = $('.dontsave', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($dontsave.length, 1, 'The "dont save" button exists');

            $dontsave.click();

        }, 100);
    });

    QUnit.asyncTest('cancel preview', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixture'), {}, item);
        var plugin;

        QUnit.expect(5);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            assert.ok(false, 'The item must not be saved');
            QUnit.start();
        });

        itemCreator.on('preview', function(){
            assert.ok(false, 'The item must not be previewed');
            QUnit.start();
        });

        itemValue = 'bar';
        itemCreator.trigger('preview');

        setTimeout(function(){
            var $dialog = $('.modal');
            var $cancel     = $('.cancel', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($cancel.length, 1, 'The cancel button exists');

            $cancel.click();

            setTimeout(function(){

                assert.equal($dialog.length, 1, 'The modal exists');
                assert.ok(!$dialog.hasClass('opened'), 'The modal is closed');

                plugin.destroy();
                QUnit.start();

            }, 100);

        }, 100);
    });

    QUnit.asyncTest('exit with changes', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixture'), {}, item);
        var plugin;

        QUnit.expect(4);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });

        itemCreator.on('exit', function(){
            assert.ok(true, 'exit called');

            plugin.destroy();
            QUnit.start();
        });

        itemValue = { noz : 'bar' };
        itemCreator.trigger('exit');

        setTimeout(function(){
            var $dialog = $('.modal');
            var $save     = $('.save', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($save.length, 1, 'The save button exists');

            $save.click();

        }, 100);
    });

    QUnit.asyncTest('cancel on changes', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixture'), {}, item);
        var plugin;

        QUnit.expect(4);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('cancel', function(){
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });

        itemCreator.on('exit', function(){
            assert.ok(true, 'exit called');

            plugin.destroy();
            QUnit.start();
        });

        itemValue = { noz : 'bar' };
        itemCreator.trigger('exit');

        setTimeout(function(){
            var $dialog = $('.modal');
            var $cancel     = $('.cancel', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($cancel.length, 1, 'The cancel button exists');

            $cancel.click();

            setTimeout(function () {
                assert.equal($('.modal').length, 0, 'The modal was cancelled');
                QUnit.start();
            }, 1000);
        }, 100);
    });

    QUnit.asyncTest('exit with changes from styles', function(assert){
        var itemValue = 'foo';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('qunit-fixture'), {}, item);
        var plugin;

        QUnit.expect(4);

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });

        itemCreator.on('exit', function(){
            assert.ok(true, 'exit called');

            plugin.destroy();
            QUnit.start();
        });

        $(document).trigger('stylechange.qti-creator');
        setTimeout(function(){
            itemCreator.trigger('exit');
        });

        setTimeout(function(){
            var $dialog = $('.modal');
            var $save     = $('.save', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($save.length, 1, 'The save button exists');

            $save.click();

        }, 100);
    });


    QUnit.asyncTest('click outside the container', function(assert){
        var $fixture  = $('#qunit-fixture');
        var $outside   = $('.outside', $fixture);
        var itemValue = ' foo ';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('.container', $fixture), {}, item);
        var plugin;

        QUnit.expect(6);

        assert.equal($fixture.length, 1, 'The fixture container exists');
        assert.equal($outside.length, 1, 'The outside link exists');

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            $outside.on('click',function(e){
                e.preventDefault();
                assert.ok(true, 'outside link clicked');

                plugin.destroy();
                QUnit.start();
            });
            setTimeout(function(){
                itemCreator.trigger('saved');
            }, 10);
        });

        itemValue = 'foo';

        $outside.click();

        setTimeout(function(){
            var $dialog = $('.modal');
            var $save     = $('.save', $dialog);
            assert.equal($dialog.length, 1, 'The modal exists');
            assert.ok($dialog.hasClass('opened'), 'The modal is opened');
            assert.equal($save.length, 1, 'The save button exists');

            $save.click();

        }, 100);
    });

    QUnit.asyncTest('click inside the container', function(assert){
        var $fixture  = $('#qunit-fixture');
        var $inside   = $('.inside', $fixture);
        var itemValue = ' foo ';
        var item = {
            toArray: function toArray(){
                return itemValue;
            }
        };
        var itemCreator = creatorMock($('.container', $fixture), {}, item);
        var plugin;

        QUnit.expect(3);

        assert.equal($fixture.length, 1, 'The fixture container exists');
        assert.equal($inside.length, 1, 'The outside link exists');

        plugin = changeTrackerPlugin(itemCreator, itemCreator.getAreaBroker());

        plugin.init();

        itemCreator.on('save', function(){
            assert.ok(false, 'The item must not be saved');
            QUnit.start();
        });

        itemValue = 'bar';

        $inside.click();

        setTimeout(function(){
            var $dialog = $('.modal');
            assert.equal($dialog.length, 0, 'No modals is created');

            plugin.destroy();
            QUnit.start();
        }, 100);
    });
});

