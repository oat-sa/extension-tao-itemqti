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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'context',
    'taoQtiItem/portableElementRegistry/factory/ciRegistry',
    'taoQtiItem/test/ciRegistry/data/testProvider',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function ($, _, context, ciRegistry, testProvider, qtiElements) {
    'use strict';

    var testReviewApi = [
        {name: 'get', title: 'get'},
        {name: 'registerProvider', title: 'registerProvider'},
        {name: 'getAllVersions', title: 'getAllVersions'},
        {name: 'getRuntime', title: 'getRuntime'},
        {name: 'getCreator', title: 'getCreator'},
        {name: 'getBaseUrl', title: 'getBaseUrl'},
        {name: 'loadRuntimes', title: 'loadRuntimes'},
        {name: 'loadCreators', title: 'loadCreators'},
        {name: 'getAuthoringData', title: 'getAuthoringData'},
        {name: 'enable', title: 'enable'},
        {name: 'disable', title: 'disable'},
        {name: 'isEnabled', title: 'isEnabled'},
    ];

    QUnit.module('Custom Interaction Registry');

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function (data, assert) {
            var registry = ciRegistry();
            assert.equal(typeof registry[data.name], 'function', 'The registry exposes a "' + data.title + '" function');
        });


    QUnit.asyncTest('load creator', function (assert) {

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        QUnit.expect(4);

        registry.loadCreators().then(function (creators) {
            assert.ok(_.isPlainObject(creators), 'creators loaded');
            assert.ok(_.isObject(creators.samplePci), 'sample ci creator loaded');
            assert.equal(creators.samplePciDisabled, undefined, 'should have no ');
        }).then(function () {
            assert.ok(qtiElements.isBlock('customInteraction.samplePci'), 'sample ci loaded into model');
            QUnit.start();
        });

    });

    QUnit.asyncTest('getAuthoringData', function (assert) {

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        QUnit.expect(4);

        registry.loadCreators().then(function () {
            var authoringData = registry.getAuthoringData('samplePci');
            assert.ok(_.isPlainObject(authoringData), 'authoring data is an object');
            assert.equal(authoringData.label, 'Sample Pci', 'label ok');
            assert.equal(authoringData.qtiClass, 'customInteraction.samplePci', 'qti class ok');
            assert.ok(authoringData.icon.indexOf('taoQtiItem/views/js/test/ciRegistry/data/samplePcicreator/img/icon.svg') > 0, 'label ok');
            QUnit.start();
        });

    });

    QUnit.asyncTest('error handling - get', function (assert) {
        QUnit.expect(2);
        ciRegistry().on('error', function (err) {
            assert.equal(err.typeIdentifier, 'inexistingCustomInteraction', 'correct error catched');
            assert.equal(err.version, '1.0.0', 'correct error catched');
            QUnit.start();
        }).getCreator('inexistingCustomInteraction', '1.0.0');
    });

    QUnit.asyncTest('error handling - load', function (assert) {

        var inexistingProvider = 'taoQtiItem/test/ciRegistry/data/inexistingProvider';
        var registry = ciRegistry().registerProvider(inexistingProvider);

        QUnit.expect(4);

        registry.loadCreators().then(function () {
            assert.ok(false, 'should not be resolved');
            QUnit.start();
        }).catch(function (err) {
            assert.equal(err.requireType, 'scripterror', 'script error catched');
            assert.ok(_.isArray(err.requireModules), 'error module list ok');
            assert.equal(err.requireModules.length, 1, 'error module list count ok');
            assert.equal(err.requireModules[0], inexistingProvider, 'error module list count ok');
            QUnit.start();
        });
    });

    QUnit.asyncTest('enable/disable', function (assert) {

        QUnit.expect(3);

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        registry.loadCreators().then(function () {

            assert.equal(registry.isEnabled('samplePci'), true, 'sample ci is enabled');

            registry.disable('samplePci');
            assert.equal(registry.isEnabled('samplePci'), false, 'sample ci disabled enabled');

            registry.enable('samplePci');
            assert.equal(registry.isEnabled('samplePci'), true, 'sample ci is enabled again');

            QUnit.start();
        });

    });

});

