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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/scaleSynchronizationManager'
], function (_, manager) {
    'use strict';

    function mockSelector() {
        const state = {
            _destroyed: false,
            value: null,
            updates: [],
            destroyCalls: 0
        };
        return {
            get _destroyed() { return state._destroyed; },
            destroy() { state._destroyed = true; state.destroyCalls++; },
            getCurrentValue() { return state.value; },
            updateAvailableScales(active) { state.updates.push(active); },
            __setValue(v) { state.value = v; },
            __state: state
        };
    }

    QUnit.module('API');

    QUnit.test('module', assert => {
        assert.expect(2);
        assert.equal(typeof manager, 'object', 'The module exposes an object');
        assert.equal(typeof manager.init, 'function', 'The module exposes an init() function');
    });

    QUnit.module('Behavior');

    QUnit.test('init registers predefined scales and isolates per item', assert => {
        assert.expect(4);
        manager.reset();
        manager.init([{ uri: 'scale://A' }, { uri: 'scale://B' }], 'item-1');
        assert.ok(manager.isPredefinedScale('scale://A'), 'scale A is predefined');
        assert.ok(manager.isPredefinedScale('scale://B'), 'scale B is predefined');

        manager.init([{ uri: 'scale://C' }], 'item-2');
        assert.notOk(manager.isPredefinedScale('scale://A'), 'In item-2, scale A is not predefined');
        assert.ok(manager.isPredefinedScale('scale://C'), 'In item-2, scale C is predefined');
    });

    QUnit.test('register/unregister selector and duplicate outcome handling', assert => {
        assert.expect(6);
        manager.reset();
        manager.init([], 'item-3');

        const s1 = mockSelector();
        const s2 = mockSelector();
        const outcome = { serial: 'SAME' };

        // register first
        manager.registerSelector('sel1', s1, outcome);
        // duplicate registration with different selector id should destroy previous
        manager.registerSelector('sel2', s2, outcome);
        assert.ok(s1.__state._destroyed, 'First selector destroyed on duplicate outcome');

        // unregister
        manager.unregisterSelector('sel2', outcome);
        // re-register s1
        const s3 = mockSelector();
        manager.registerSelector('sel3', s3, { serial: 'NEW' });
        // cleanupOrphaned should not destroy anything now
        manager.cleanupOrphanedSelectors();
        assert.equal(s3.__state.destroyCalls, 0, 'No orphan cleanup on fresh mapping');

        // update registration mapping from OLD to NEW
        const s4 = mockSelector();
        manager.registerSelector('sel4', s4, { serial: 'OLD' });
        manager.updateSelectorRegistration('sel4', { serial: 'OLD' }, { serial: 'NEW2' });
        // Trigger an orphan cleanup now that mapping changed to ensure no side effect
        manager.cleanupOrphanedSelectors();
        assert.notOk(s4.__state._destroyed, 'Selector remains after mapping update');

        // ensure unregister without outcome removes mapping
        manager.unregisterSelector('sel4');
        // re-register under same id should work
        const s5 = mockSelector();
        manager.registerSelector('sel4', s5, { serial: 'NEW3' });
        assert.notOk(s5.__state._destroyed, 'Selector alive after unregister/register');

        // sanity: onScaleChange without predefined scale should not throw and should not update
        manager.onScaleChange('sel4', 'non-predefined');
        assert.deepEqual(s5.__state.updates, [], 'No updates when new scale is not predefined and none active');

        // set current value and allow detection via checkForActivePredefinedScales
        manager.init([{ uri: 'scale://X' }], 'item-3');
        const s6 = mockSelector();
        s6.__setValue('scale://X');
        manager.registerSelector('sel6', s6, { serial: 'S6' });
        assert.equal(manager.getActivePredefinedScale(), 'scale://X', 'Auto-detected predefined scale');
    });

    QUnit.test('onScaleChange locks to predefined and updates all selectors', assert => {
        assert.expect(4);
        manager.reset();
        manager.init([{ uri: 'scale://A' }], 'item-4');
        const s1 = mockSelector();
        const s2 = mockSelector();
        manager.registerSelector('sel1', s1, { serial: 'S1' });
        manager.registerSelector('sel2', s2, { serial: 'S2' });

        manager.onScaleChange('S1', 'scale://A');
        assert.equal(manager.getActivePredefinedScale(), 'scale://A', 'Active predefined scale set');
        assert.deepEqual(s1.__state.updates, ['scale://A'], 'Selector 1 updated');
        assert.deepEqual(s2.__state.updates, ['scale://A'], 'Selector 2 updated');

        // Re-apply same scale should be a no-op
        manager.onScaleChange('S2', 'scale://A');
        assert.equal(manager.getActivePredefinedScale(), 'scale://A', 'Active scale unchanged');
    });

    QUnit.test('reset destroys selectors and clears state', assert => {
        assert.expect(4);
        manager.reset();
        manager.init([], 'item-5');
        const s1 = mockSelector();
        const s2 = mockSelector();
        manager.registerSelector('sel1', s1, { serial: 'S1' });
        manager.registerSelector('sel2', s2, { serial: 'S2' });

        // reset specific item
        manager.reset('item-5');
        assert.ok(s1.__state._destroyed, 's1 destroyed');
        assert.ok(s2.__state._destroyed, 's2 destroyed');

        // reset all
        manager.init([], 'item-6');
        const s3 = mockSelector();
        manager.registerSelector('sel3', s3, { serial: 'S3' });
        manager.reset();
        assert.ok(s3.__state._destroyed, 's3 destroyed after reset all');
        assert.equal(manager._currentItemId, null, 'Current item cleared');
    });

    QUnit.module('Negative inputs');

    QUnit.test('init throws when itemId is missing or falsy; tolerates null/undefined scales', assert => {
        assert.expect(4);
        manager.reset();

        // Missing itemId should throw
        assert.throws(() => manager.init([], null), /itemId is required/i, 'Throws when itemId is null');
        assert.throws(() => manager.init([], undefined), /itemId is required/i, 'Throws when itemId is undefined');

        // Null/undefined scales are tolerated when itemId is provided
        assert.ok((() => { manager.init(null, 'neg-1'); return true; })(), 'init with null scales does not throw');
        // Re-init with undefined scales should also not throw and switch state to a new item
        assert.ok((() => { manager.init(undefined, 'neg-1b'); return true; })(), 'init with undefined scales does not throw');
    });

    QUnit.test('registerSelector tolerates null/undefined outcome (no throw, no auto-destroy)', assert => {
        assert.expect(3);
        manager.reset();
        manager.init([], 'neg-2');

        const s = (function mockSelector() {
            const state = { _destroyed: false };
            return {
                destroy() { state._destroyed = true; },
                getCurrentValue() { return null; },
                updateAvailableScales() {},
                __state: state
            };
        })();

        assert.ok((() => { manager.registerSelector('sel-null', s, null); return true; })(), 'register with null outcome does not throw');
        assert.notOk(s.__state._destroyed, 'selector not destroyed after registration with null outcome');
        assert.strictEqual(manager.getActivePredefinedScale(), null, 'no active predefined scale');
    });

    QUnit.test('onScaleChange with invalid params is a no-op (no throw)', assert => {
        assert.expect(4);
        manager.reset();
        manager.init([{ uri: 'scale://A' }], 'neg-3');
        const s1 = (function mockSelector() {
            const state = { updates: [] };
            return {
                getCurrentValue() { return null; },
                updateAvailableScales(active) { state.updates.push(active); },
                __state: state
            };
        })();
        manager.registerSelector('s1', s1, { serial: 'S1' });

        assert.ok((() => { manager.onScaleChange(null, null); return true; })(), 'onScaleChange(null, null) does not throw');
        assert.ok((() => { manager.onScaleChange(undefined, undefined); return true; })(), 'onScaleChange(undefined, undefined) does not throw');
        assert.strictEqual(manager.getActivePredefinedScale(), null, 'active predefined scale remains null');
        assert.deepEqual(s1.__state.updates, [], 'no selector updates performed');
    });

    QUnit.test('unregisterSelector on non-existent id is a no-op', assert => {
        assert.expect(3);
        manager.reset();
        manager.init([], 'neg-4');
        const s1 = (function mockSelector() {
            const state = { _destroyed: false };
            return { destroy() { state._destroyed = true; }, __state: state };
        })();
        manager.registerSelector('known', s1, { serial: 'K' });

        assert.ok((() => { manager.unregisterSelector('unknown'); return true; })(), 'unregisterSelector of unknown id does not throw');
        // Mapping integrity: running orphan cleanup should not destroy existing if mapping is valid
        manager.cleanupOrphanedSelectors();
        assert.notOk(s1.__state._destroyed, 'known selector not destroyed');
        assert.strictEqual(manager.getActivePredefinedScale(), null, 'active predefined scale unchanged');
    });

    QUnit.test('key methods throw when called before init', assert => {
        assert.expect(5);
        manager.reset();

        const s = (function mockSelector() {
            return { destroy() {}, getCurrentValue() { return null; }, updateAvailableScales() {} };
        })();

        assert.throws(() => manager.registerSelector('x', s, { serial: 'X' }), /Call init\(\) first/i, 'registerSelector throws before init');
        assert.throws(() => manager.onScaleChange('x', 'scale://A'), /Call init\(\) first/i, 'onScaleChange throws before init');
        assert.throws(() => manager.unregisterSelector('x'), /Call init\(\) first/i, 'unregisterSelector throws before init');
        assert.throws(() => manager.getActivePredefinedScale(), /Call init\(\) first/i, 'getActivePredefinedScale throws before init');
        assert.throws(() => manager.isPredefinedScale('scale://A'), /Call init\(\) first/i, 'isPredefinedScale throws before init');
    });
});
