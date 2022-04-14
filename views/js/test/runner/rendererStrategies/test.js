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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */
define([
    'core/logger',
    'taoQtiItem/runner/rendererStrategies'
], function (loggerFactory, rendererStrategies) {

    QUnit.module('rendererStrategies API');

    QUnit.test('module', assert => {
        assert.notEqual(typeof rendererStrategies, 'undefined', 'The module exports something');
        assert.equal(typeof rendererStrategies, 'function', 'The module exports a function');
    });

    QUnit.cases.init([
        { title: 'registerProvider' },
        { title: 'getProvider' },
        { title: 'getAvailableProviders' },
        { title: 'clearProviders' }
    ]).test('registry API ', (data, assert) => {
        assert.equal(typeof rendererStrategies[data.title], 'function', `The registry exposes the method ${data.title}`);
    });

    QUnit.module('Providers');

    QUnit.cases.init([
        { title: 'commonRenderer' },
        { title: 'reviewRenderer' }
    ]).test('provider registered ', (data, assert) => {
        const provider = rendererStrategies.getProvider(data.title);
        assert.notEqual(typeof provider, 'undefined', `The provider ${data.title} is registered`);
        assert.equal(typeof provider.init, 'function', `The provider ${data.title} has a init() method`);
        assert.equal(typeof provider.getRenderer, 'function', `The provider ${data.title} has a getRenderer() method`);
        assert.equal(provider.name, data.title, `The provider ${data.title} has the correct name`);
    });

    QUnit.cases.init([{
        title: 'void renderer',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'no renderer',
        name: '',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'unknown renderer',
        name: 'unknownRenderer',
        expected: 'commonRenderer',
        warn: true
    }, {
        title: 'common renderer',
        name: 'commonRenderer',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'review renderer',
        name: 'reviewRenderer',
        expected: 'reviewRenderer',
        warn: false
    }, {
        title: 'author view renderer',
        name: 'author',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'candidate view renderer',
        name: 'candidate',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'proctor renderer',
        name: 'proctor',
        expected: 'reviewRenderer',
        warn: false
    }, {
        title: 'scorer renderer',
        name: 'scorer',
        expected: 'reviewRenderer',
        warn: false
    }, {
        title: 'testConstructor view renderer',
        name: 'testConstructor',
        expected: 'commonRenderer',
        warn: false
    }, {
        title: 'tutor renderer',
        name: 'tutor',
        expected: 'reviewRenderer',
        warn: false
    }]).test('renderer created ', (data, assert) => {
        const logger = loggerFactory('taoQtiItem/runner/rendererStrategies').reset();
        const renderer = rendererStrategies(data.name);
        assert.notEqual(typeof renderer, 'undefined', `The renderer ${data.title} is created`);
        assert.equal(typeof renderer.init, 'function', `The renderer ${data.title} has a init() method`);
        assert.equal(typeof renderer.getName, 'function', `The renderer ${data.title} has a getName() method`);
        assert.equal(typeof renderer.getRenderer, 'function', `The renderer ${data.title} has a getRenderer() method`);
        assert.equal(renderer.getName(), data.expected, `The renderer ${data.title} has the expected name ${data.expected}`);
        assert.equal(logger.wasCalled('warn'), data.warn, 'A warning has been issued when creating the renderer if needed');
    });
});

