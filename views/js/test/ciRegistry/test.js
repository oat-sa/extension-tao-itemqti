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
    'taoQtiItem/portableElementRegistry/factory/ciRegistry',
    'taoQtiItem/test/ciRegistry/data/testProvider',
    'taoQtiItem/qtiCreator/helper/qtiElements'
], function($, _, ciRegistry, testProvider, qtiElements) {
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
        {name: 'isEnabled', title: 'isEnabled'}
    ];

    QUnit.module('Custom Interaction Registry');

    QUnit
        .cases.init(testReviewApi)
        .test('instance API ', function(data, assert) {
            var registry = ciRegistry();
            assert.equal(typeof registry[data.name], 'function', 'The registry exposes a "' + data.title + '" function');
        });

    QUnit.test('load creator', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(4);

        registry.loadCreators().then(function(creators) {
            assert.ok(_.isPlainObject(creators), 'creators loaded');
            assert.ok(_.isObject(creators.samplePci), 'sample ci creator loaded');
            assert.equal(creators.samplePciDisabled, undefined, 'should have no ');
        }).then(function() {
            assert.ok(qtiElements.isBlock('customInteraction.samplePci'), 'sample ci loaded into model');
            ready();
        });
    });

    QUnit.test('getAuthoringData', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(4);

        registry.loadCreators().then(function() {
            var authoringData = registry.getAuthoringData('samplePci');
            assert.ok(_.isPlainObject(authoringData), 'authoring data is an object');
            assert.equal(authoringData.label, 'Sample Pci', 'label ok');
            assert.equal(authoringData.qtiClass, 'customInteraction.samplePci', 'qti class ok');
            assert.ok(authoringData.icon.indexOf('taoQtiItem/views/js/test/ciRegistry/data/samplePcicreator/img/icon.svg') > 0, 'label ok');
            ready();
        });
    });

    QUnit.test('get', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(7);

        registry.loadRuntimes().then(function() {

            var pci = registry.get('samplePci');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.equal(pci.typeIdentifier, 'samplePci', 'type identifier ok');
            assert.equal(pci.version, '1.0.0', 'type version ok');

            //Get a specific version
            pci = registry.get('samplePci', '1.0.0');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.equal(pci.typeIdentifier, 'samplePci', 'type identifier ok');
            assert.equal(pci.version, '1.0.0', 'type version ok');

            //Not existing version
            pci = registry.get('samplePci', '9.9.9');
            assert.equal(typeof pci, 'undefined', 'not existing version');

            ready();
        });
    });

    QUnit.test('getRuntime', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(9);

        registry.loadRuntimes().then(function() {

            var pci = registry.getRuntime('samplePci');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.hook, 'samplePci/runtime/samplePci.amd.js', 'hook correct');
            assert.equal(pci.label, 'Sample Pci', 'label correct');

            //Get a specific version
            pci = registry.getRuntime('samplePci', '1.0.0');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.hook, 'samplePci/runtime/samplePci.amd.js', 'hook correct');
            assert.equal(pci.label, 'Sample Pci', 'label correct');

            //Not existing version
            pci = registry.getRuntime('samplePci', '9.9.9');
            assert.equal(typeof pci, 'undefined', 'not existing version');

            ready();
        });
    });

    QUnit.test('getBaseUrl', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(7);

        registry.loadRuntimes().then(function() {

            var pci = registry.getRuntime('samplePci');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.baseUrl, registry.getBaseUrl('samplePci'), 'has base url set');

            //Get a specific version
            pci = registry.getRuntime('samplePci', '1.0.0');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.baseUrl, registry.getBaseUrl('samplePci'), 'has base url set');

            //Not existing version
            assert.equal('', registry.getBaseUrl('samplePci', 'x.x.x'), 'has no base url');

            ready();
        });
    });

    QUnit.test('getCreator', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(9);

        registry.loadCreators().then(function() {

            var pci = registry.getCreator('samplePci');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.hook, 'samplePci/pciCreator.js', 'hook correct');
            assert.equal(pci.label, 'Sample Pci', 'label correct');

            //Get a specific version
            pci = registry.getCreator('samplePci', '1.0.0');
            assert.ok(_.isPlainObject(pci), 'runtime data is loaded');
            assert.ok(pci.baseUrl, 'has base url set');
            assert.equal(pci.hook, 'samplePci/pciCreator.js', 'hook correct');
            assert.equal(pci.label, 'Sample Pci', 'label correct');

            //Not existing version
            pci = registry.getCreator('samplePci', '9.9.9');
            assert.equal(typeof pci, 'undefined', 'not existing version');

            ready();
        });
    });

    QUnit.test('getAllVersions', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(4);

        registry.loadRuntimes().then(function() {
            var all = registry.getAllVersions();

            assert.ok(_.isArray(all.samplePci), 'samplePci returned');
            assert.deepEqual(all.samplePci, ['1.0.0'], 'samplePci has one version loaded');

            assert.ok(_.isArray(all.samplePciDisabled), 'samplePciDisabled returned');
            assert.deepEqual(all.samplePciDisabled, ['1.0.0'], 'samplePciDisabled has one version loaded');

            ready();
        });
    });

    QUnit.test('error handling - get', function(assert) {
        var ready = assert.async();
        assert.expect(2);
        ciRegistry().on('error', function(err) {
            assert.equal(err.typeIdentifier, 'inexistingCustomInteraction', 'correct error catched');
            assert.equal(err.version, '1.0.0', 'correct error catched');
            ready();
        }).getCreator('inexistingCustomInteraction', '1.0.0');
    });

    QUnit.test('error handling - load', function(assert) {
        var ready = assert.async();

        var inexistingProvider = 'taoQtiItem/test/ciRegistry/data/inexistingProvider';
        var registry = ciRegistry().registerProvider(inexistingProvider);

        assert.expect(3);

        registry.loadCreators().then(function() {
            assert.ok(false, 'should not be resolved');
            ready();
        }).catch(function(err) {
            assert.ok(_.isArray(err.requireModules), 'error module list ok');
            assert.equal(err.requireModules.length, 1, 'error module list count ok');
            assert.equal(err.requireModules[0], inexistingProvider, 'error module list count ok');
            ready();
        });
    });

    QUnit.test('enable/disable', function(assert) {
        var ready = assert.async();

        assert.expect(3);

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        registry.loadCreators().then(function() {

            assert.equal(registry.isEnabled('samplePci'), true, 'sample ci is enabled');

            registry.disable('samplePci');
            assert.equal(registry.isEnabled('samplePci'), false, 'sample ci disabled enabled');

            registry.enable('samplePci');
            assert.equal(registry.isEnabled('samplePci'), true, 'sample ci is enabled again');

            ready();
        });
    });

    QUnit.test('registerProvider', function(assert) {
        var ready = assert.async();

        var sampleProvider = {
            load: function load() {
                return {
                    'samplePciA01': [
                        {
                            'response': {'baseType': 'integer', 'cardinality': 'single'},
                            'creator': {
                                'icon': 'likertScaleInteraction/creator/img/icon.svg',
                                'hook': 'likertScaleInteraction/pciCreator.js',
                                'libraries': ['likertScaleInteraction/creator/tpl/markup.tpl', 'likertScaleInteraction/creator/tpl/propertiesForm.tpl', 'likertScaleInteraction/creator/widget/Widget.js', 'likertScaleInteraction/creator/widget/states/Question.js', 'likertScaleInteraction/creator/widget/states/Answer.js', 'likertScaleInteraction/creator/widget/states/states.js']
                            },
                            'typeIdentifier': 'samplePciA01',
                            'label': 'Likert Scale',
                            'short': 'Likert',
                            'description': 'A simple implementation of likert scale.',
                            'version': '0.4.*',
                            'author': 'Sam Sipasseuth',
                            'email': 'sam@taotesting.com',
                            'tags': ['mcq', 'likert'],
                            'runtime': {
                                'hook': 'likertScaleInteraction/runtime/likertScaleInteraction.min.js',
                                'libraries': [],
                                'stylesheets': ['likertScaleInteraction/runtime/css/base.css', 'likertScaleInteraction/runtime/css/likertScaleInteraction.css'],
                                'mediaFiles': ['likertScaleInteraction/runtime/assets/ThumbDown.png', 'likertScaleInteraction/runtime/assets/ThumbUp.png', 'likertScaleInteraction/runtime/css/img/bg.png'],
                                'src': ['likertScaleInteraction/runtime/js/likertScaleInteraction.js', 'likertScaleInteraction/runtime/js/renderer.js']
                            },
                            'enabled': true,
                            'model': 'PCI',
                            'xmlns': 'http://www.imsglobal.org/xsd/portableCustomInteraction',
                            'baseUrl': 'http://tao.docker:8086/tao/File/accessFile/NWE4NmU1NTljNmM3YiBQQ0kvYzJmNzQ4MjI1ZjIzOWYxMGRhMDZlNmY4NjUwMDhkYWI=/'
                        }
                    ]
                };
            }
        };

        var registry = ciRegistry().registerProvider('sampleProvider', sampleProvider);

        assert.expect(3);

        registry.loadRuntimes().then(function() {

            var pci;

            assert.ok(_.isPlainObject(registry.get('samplePciA01')), 'runtime data is loaded');

            pci = registry.get('samplePciA01');

            assert.equal(pci.typeIdentifier, 'samplePciA01', 'type identifier ok');
            assert.equal(pci.version, '0.4.*', 'type version ok');

            ready();
        });
    });

    QUnit.test('resetProviders', function(assert) {
        var ready = assert.async();

        var sampleProvider = {
            load: function load() {
                return {
                    'samplePciA01': [
                        {
                            'response': {'baseType': 'integer', 'cardinality': 'single'},
                            'creator': {
                                'icon': 'likertScaleInteraction/creator/img/icon.svg',
                                'hook': 'likertScaleInteraction/pciCreator.js',
                                'libraries': ['likertScaleInteraction/creator/tpl/markup.tpl', 'likertScaleInteraction/creator/tpl/propertiesForm.tpl', 'likertScaleInteraction/creator/widget/Widget.js', 'likertScaleInteraction/creator/widget/states/Question.js', 'likertScaleInteraction/creator/widget/states/Answer.js', 'likertScaleInteraction/creator/widget/states/states.js']
                            },
                            'typeIdentifier': 'samplePciA01',
                            'label': 'Likert Scale',
                            'short': 'Likert',
                            'description': 'A simple implementation of likert scale.',
                            'version': '0.4.*',
                            'author': 'Sam Sipasseuth',
                            'email': 'sam@taotesting.com',
                            'tags': ['mcq', 'likert'],
                            'runtime': {
                                'hook': 'likertScaleInteraction/runtime/likertScaleInteraction.min.js',
                                'libraries': [],
                                'stylesheets': ['likertScaleInteraction/runtime/css/base.css', 'likertScaleInteraction/runtime/css/likertScaleInteraction.css'],
                                'mediaFiles': ['likertScaleInteraction/runtime/assets/ThumbDown.png', 'likertScaleInteraction/runtime/assets/ThumbUp.png', 'likertScaleInteraction/runtime/css/img/bg.png'],
                                'src': ['likertScaleInteraction/runtime/js/likertScaleInteraction.js', 'likertScaleInteraction/runtime/js/renderer.js']
                            },
                            'enabled': true,
                            'model': 'PCI',
                            'xmlns': 'http://www.imsglobal.org/xsd/portableCustomInteraction',
                            'baseUrl': 'http://tao.docker:8086/tao/File/accessFile/NWE4NmU1NTljNmM3YiBQQ0kvYzJmNzQ4MjI1ZjIzOWYxMGRhMDZlNmY4NjUwMDhkYWI=/'
                        }
                    ]
                };
            }
        };

        var registry = ciRegistry().registerProvider('sampleProvider', sampleProvider);

        assert.expect(9);

        registry.loadRuntimes().then(function() {

            var pci;

            assert.ok(_.isPlainObject(registry.get('samplePciA01')), 'runtime data is loaded');

            pci = registry.get('samplePciA01');

            assert.equal(pci.typeIdentifier, 'samplePciA01', 'type identifier ok');
            assert.equal(pci.version, '0.4.*', 'type version ok');

            registry
                .resetProviders()
                .registerProvider('taoQtiItem/test/ciRegistry/data/testProvider')
                .loadRuntimes().then(function() {

                    assert.ok(_.isPlainObject(registry.get('samplePci')), 'runtime data is loaded');
                    assert.equal(registry.get('samplePci').typeIdentifier, 'samplePci', 'type identifier ok');
                    assert.equal(registry.get('samplePci').version, '1.0.0', 'type version ok');

                    assert.ok(_.isPlainObject(registry.get('samplePciDisabled')), 'runtime data is loaded');
                    assert.equal(registry.get('samplePciDisabled').typeIdentifier, 'samplePciDisabled', 'type identifier ok');
                    assert.equal(registry.get('samplePciDisabled').version, '1.0.0', 'type version ok');

                    ready();
                });

        });
    });

    QUnit.test('include', function(assert) {
        var ready = assert.async();

        var registry = ciRegistry().registerProvider('taoQtiItem/test/ciRegistry/data/testProvider');

        assert.expect(7);

        registry.loadCreators({
            include: ['samplePciDisabled']
        }).then(function() {
            var all = registry.getAllVersions();

            //We can force loading disabled pci by using the include option
            assert.ok(_.isArray(all.samplePciDisabled), 'samplePciDisabled loaded');
            assert.deepEqual(all.samplePciDisabled, ['1.0.0'], 'samplePciDisabled has one version loaded');

            //Not included
            assert.ok(typeof all.samplePci, 'undefined', 'samplePciDisabled not loaded');

            registry.loadCreators({
                include: ['samplePci']
            }).then(function() {

                all = registry.getAllVersions();

                //We can force loading disabled pci by using the include option
                assert.ok(_.isArray(all.samplePciDisabled), 'samplePciDisabled loaded');
                assert.deepEqual(all.samplePciDisabled, ['1.0.0'], 'samplePciDisabled has one version loaded');

                //Loaded the other pci
                assert.ok(_.isArray(all.samplePci), 'samplePci loaded');
                assert.deepEqual(all.samplePci, ['1.0.0'], 'samplePci has one version loaded');

                ready();
            });

        });
    });
});

