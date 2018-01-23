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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/portableLib/OAT/util/event'
], function ($, event) {
    'use strict';

    QUnit.module('Module');

    QUnit.test('Module export', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof event === 'object', 'The module expose an object');
    });

    QUnit
        .cases([
            {title: 'addEventMgr'}
        ])
        .test('Eventifier API', function (data, assert) {
            QUnit.expect(1);
            assert.ok(typeof event[data.title] === 'function', 'eventifier implements ' + data.title);
        });

    QUnit
        .cases([
            {title: 'on'},
            {title: 'off'},
            {title: 'trigger'}
        ])
        .test('Eventified object', function (data, assert) {
            var eventified = {};
            event.addEventMgr(eventified);
            QUnit.expect(1);

            assert.ok(typeof eventified[data.title] === 'function', 'eventified object implements ' + data.title);
        });

    QUnit.module('.on()');

    QUnit.asyncTest('allows to register a listener', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(4);

        emitter.on('test', function(param1, param2, param3) {
            assert.ok(true, 'in event listener');
            assert.equal(param1, 1, 'first parameter is correct');
            assert.equal(param2, 'two', 'second parameter is correct');
            assert.equal(param3.three, 3, 'third parameter is correct');
            QUnit.start();
        });

        emitter.trigger('test', [ 1, 'two', { three: 3 } ]);
    });

    QUnit.asyncTest('allows to register a listener with a namespace', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(4);

        emitter.on('test.ns', function(param1, param2, param3) {
            assert.ok(true, 'in "test" listener');
            assert.equal(param1, 1, 'first parameter is correct');
            assert.equal(param2, 'two', 'second parameter is correct');
            assert.equal(param3.three, 3, 'third parameter is correct');
            QUnit.start();
        });

        emitter.trigger('test', [ 1, 'two', { three: 3 } ]);
    });

    QUnit.asyncTest('allows to register listeners for multiple events separately', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(8);

        emitter.on('test1', function(param1, param2, param3) {
            assert.ok(true, 'in "test1" listener');
            assert.equal(param1, 1, 'first parameter is correct');
            assert.equal(param2, 'two', 'second parameter is correct');
            assert.equal(param3.three, 3, 'third parameter is correct');
        });

        emitter.on('test2', function(param1, param2, param3) {
            assert.ok(true, 'in "test2" listener');
            assert.equal(param1, 4, 'first parameter is correct');
            assert.equal(param2, 'five', 'second parameter is correct');
            assert.equal(param3.six, 6, 'third parameter is correct');
            QUnit.start();
        });

        emitter.trigger('test1', [ 1, 'two', { three: 3 } ]);
        emitter.trigger('test2', [ 4, 'five', { six: 6 } ]);
    });

    QUnit.asyncTest('allows to register listeners for multiple events at once', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(8);

        emitter.on('test1 test2', function(param1, param2, param3) {
            if (this.type === 'test1') {
                assert.ok(true, 'in "test1" listener');
                assert.equal(param1, 1, 'first parameter is correct');
                assert.equal(param2, 'two', 'second parameter is correct');
                assert.equal(param3.three, 3, 'third parameter is correct');

            } else if (this.type === 'test2') {
                assert.ok(true, 'in "test2" listener');
                assert.equal(param1, 4, 'first parameter is correct');
                assert.equal(param2, 'five', 'second parameter is correct');
                assert.equal(param3.six, 6, 'third parameter is correct');
                QUnit.start();
            }
        });

        emitter.trigger('test1', [ 1, 'two', { three: 3 } ]);
        emitter.trigger('test2', [ 4, 'five', { six: 6 } ]);
    });

    QUnit.asyncTest('allows to register listeners for multiple events at once, with namespaces', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(8);

        emitter.on('test1.ns1 test2.ns3', function(param1, param2, param3) {
            if (this.type === 'test1') {
                assert.ok(true, 'in "test1" listener');
                assert.equal(param1, 1, 'first parameter is correct');
                assert.equal(param2, 'two', 'second parameter is correct');
                assert.equal(param3.three, 3, 'third parameter is correct');

            } else if (this.type === 'test2') {
                assert.ok(true, 'in "test2" listener');
                assert.equal(param1, 4, 'first parameter is correct');
                assert.equal(param2, 'five', 'second parameter is correct');
                assert.equal(param3.six, 6, 'third parameter is correct');
                QUnit.start();
            }
        });

        emitter.trigger('test1', [ 1, 'two', { three: 3 } ]);
        emitter.trigger('test2', [ 4, 'five', { six: 6 } ]);
    });

    QUnit.asyncTest('allows to register multiple listeners for the same event', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(8);

        emitter.on('test', function(param1, param2, param3) {
            assert.ok(true, 'in first listener');
            assert.equal(param1, 1, 'first parameter is correct');
            assert.equal(param2, 'two', 'second parameter is correct');
            assert.equal(param3.three, 3, 'third parameter is correct');
        });

        emitter.on('test', function(param1, param2, param3) {
            assert.ok(true, 'in first listener');
            assert.equal(param1, 1, 'first parameter is correct');
            assert.equal(param2, 'two', 'second parameter is correct');
            assert.equal(param3.three, 3, 'third parameter is correct');
            QUnit.start();
        });

        emitter.trigger('test', [ 1, 'two', { three: 3 } ]);
    });


    QUnit.module('.off()');

    QUnit.asyncTest('allows to un-register all listeners at once for an event', function(assert) {
        var emitter = {};
        event.addEventMgr(emitter);

        QUnit.expect(1);

        emitter.on('test', function() {
            assert.ok(false, 'I should not be called');
            QUnit.start();
        });

        emitter.on('test', function() {
            assert.ok(false, 'I should not be called');
            QUnit.start();
        });

        emitter.off('test');
        emitter.trigger('test');

        assert.ok(true);
        QUnit.start();
    });
});