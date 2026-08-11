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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'core/eventifier',
    'taoQtiItem/qtiCreator/helper/saveChanges',
], function (eventifier, saveChanges) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', assert => {
        assert.expect(2);
        assert.equal(typeof saveChanges, 'function', 'The module exposes a function');
        assert.equal(saveChanges(eventifier()) instanceof Promise, true, 'The factory produces a promise');
    });

    QUnit.module('Behavior');

    QUnit.test('save success', assert => {
        const ready = assert.async();
        const itemCreator = eventifier();

        assert.expect(1);
        itemCreator.on('save', () => itemCreator.trigger('saved'));
        saveChanges(itemCreator)
            .then(() => {
                assert.ok(true, 'The item is saved');
            })
            .catch(() => {
                assert.ok(false, 'The process should not fail');
            })
            .then(ready);
    });

    QUnit.test('save failure', assert => {
        const ready = assert.async();
        const itemCreator = eventifier();
        const error = new Error('TEST');

        assert.expect(1);
        itemCreator.on('save', () => itemCreator.trigger('error', error));
        saveChanges(itemCreator)
            .then(() => {
                assert.ok(false, 'The item should not be saved');
            })
            .catch(err => {
                assert.equal(err, error, 'The process must fail');
            })
            .then(ready);
    });
});
