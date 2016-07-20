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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/runner/provider/manager/userModules',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/runner/provider/manager/userModules/data/qti.json'
], function($, userModules, qtiItemRunner, itemData){
    'use strict';

    QUnit.module('userModules');

    QUnit.test('module', function(assert){
        QUnit.expect(1);

        assert.ok(typeof userModules === 'object', 'The module expose an object');
    });

    QUnit.asyncTest('loader should require user modules defined in config', function(assert) {
        QUnit.expect(3);

        userModules.load(['taoQtiItem/test/runner/provider/manager/userModules/data/userModule1'])
            .then(function() {
                assert.ok(window.__userModulesTest, 'global __userModulesTest exists');
                assert.ok(window.__userModulesTest.module1, 'global __userModulesTest has a module1 property');
                assert.equal(window.__userModulesTest.module1, 'userModule1 loaded', 'module1 has the right value');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'error in user module loading: ' + err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('loader should be called by itemRunner', function(assert) {
        var $container = $('#qunit-fixture');

        require.config({
            config : {
                'taoQtiItem/runner/provider/manager/userModules' : {"userModules":['taoQtiItem/test/runner/provider/manager/userModules/data/userModule2']}
            }
        });

        QUnit.expect(3);

        qtiItemRunner('qti', itemData)
            .on('render', function() {
                assert.ok(window.__userModulesTest, 'global __userModulesTest exists');
                assert.ok(window.__userModulesTest.module2, 'global __userModulesTest has a module2 property');
                assert.equal(window.__userModulesTest.module2, 'userModule2 loaded', 'module2 has the right value');
                QUnit.start();
            })
            .on('error', function(err) {
                assert.ok(false, 'error in user module loading: ' + err.message);
                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('loader should work if no modules are defined', function(assert) {
        QUnit.expect(1);

        userModules.load([])
            .then(function() {
                assert.ok(true, 'no errors have been thrown');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'error in user module loading: ' + err.message);
                QUnit.start();
            });
    });

    // please disable coverage in QUnit UI for this test to pass
    QUnit.asyncTest('should return an error if module is not found', function(assert) {
        QUnit.expect(1);

        require.config({
            waitSeconds: 1
        });

        userModules.load(['i/do/not/exist'])
            .then(function() {
                assert.ok(false, 'an error should have been thrown');
                QUnit.start();
            })
            .catch(function() {
                assert.ok(true, 'error in user module loading:');
                QUnit.start();
            });
    });

});
