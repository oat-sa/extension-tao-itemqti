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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test the minMax component
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['taoQtiItem/qtiCreator/widgets/component/minMax/minMax'], function(minMaxComponentFactory) {
    'use strict';

    var getKeyBoardEvent = function getKeyBoardEvent(eventName, key) {
        var event;
        try {
            event = new KeyboardEvent(eventName, {key: key});
        } catch (err) {
            event = document.createEvent('KeyboardEvent');
            event.initEvent(eventName, true, false);
            event.keyCode = key;
        }
        return event;
    };

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.expect(3);

        assert.equal(typeof minMaxComponentFactory, 'function', 'The module exposes a function');
        assert.equal(typeof minMaxComponentFactory(), 'object', 'The factory produces an object');
        assert.notStrictEqual(minMaxComponentFactory(), minMaxComponentFactory(), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'destroy'},
        {title: 'render'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'},
        {title: 'is'},
        {title: 'setState'},
        {title: 'getContainer'},
        {title: 'getElement'},
        {title: 'getTemplate'},
        {title: 'setTemplate'}
    ]).test('Component API ', function(data, assert) {
        var instance = minMaxComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The minMaxComponentFactory exposes the component method "' + data.title);
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'trigger'},
        {title: 'before'},
        {title: 'after'}
    ]).test('Eventifier API ', function(data, assert) {
        var instance = minMaxComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The minMaxComponentFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases.init([
        {title: 'getFields'},
        {title: 'getValue'},
        {title: 'getMinValue'},
        {title: 'getMaxValue'},
        {title: 'setValue'},
        {title: 'setMinValue'},
        {title: 'setMaxValue'},
        {title: 'updateThresholds'},
        {title: 'isFieldEnabled'},
        {title: 'enableField'},
        {title: 'disableField'}
    ]).test('Instance API ', function(data, assert) {
        var instance = minMaxComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The minMaxComponentFactory exposes the method "' + data.title + '"');
    });

    QUnit.module('Behavior');

    QUnit.test('fields', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(5);

        minMaxComponentFactory(container)
        .on('init', function() {
            var self = this;

            assert.deepEqual(this.getFields(), {min: 'min', max: 'max'}, 'The fields values are exposed');

            assert.equal(this.getValue('min'), 0, 'With the correct field the method is executed');
            assert.equal(this.getValue('max'), 0, 'With the correct field the method is executed');

            assert.throws(function() {
                self.getValue();
            }, TypeError, 'The field needs to be either min or max');

            assert.throws(function() {
                self.getValue('medium');
            }, TypeError, 'The field needs to be either min or max');

            ready();
        });
    });

    QUnit.test('Lifecycle', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(2);

        minMaxComponentFactory(container)
        .on('init', function() {
            assert.ok(!this.is('rendered'), 'The component is not rendered');
        })
        .on('render', function() {
            assert.ok(this.is('rendered'), 'The component is now rendered');

            this.destroy();
        })
        .on('destroy', function() {
            ready();
        });
    });

    QUnit.test('Rendering', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(12);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 1,
                toggler: true
            },
            max: {
                fieldName: 'max',
                value: 1,
                toggler: true
            },
            upperThreshold: 10
        })
        .on('render', function() {
            var element = this.getElement()[0];
            assert.deepEqual(container.querySelector('.min-max'), element, 'The component exists');

            assert.equal(element.querySelectorAll("[name=min]").length, 1, "The min input is rendered");
            assert.equal(element.querySelector("[name=min]").value, 1, "The min input has the correct default value ");
            assert.equal(element.querySelector("[name=min]").dataset.min, 1, "The min input has the correct default value ");
            assert.equal(element.querySelector("[name=min]").dataset.max, 10, "The min input has the correct default value ");
            assert.equal(element.querySelectorAll('[name="min-toggler"]').length, 1, "The min toggler is rendered");

            assert.equal(element.querySelectorAll("[name=max]").length, 1, "The max input is rendered");
            assert.equal(element.querySelector("[name=max]").value, 1, "The max input has the correct default value ");
            assert.equal(element.querySelector("[name=max]").dataset.min, 1, "The max input has the correct default value ");
            assert.equal(element.querySelector("[name=max]").dataset.max, 10, "The max input has the correct default value ");
            assert.equal(element.querySelectorAll('[name="max-toggler"]').length, 1, "The max toggler is rendered");

            ready();
        });
    });

    QUnit.test('enable min using toggler', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(11);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 0,
                toggler: true
            },
            max: {
                fieldName: 'max',
                value: 0,
                toggler: true
            }
        })
        .on('render', function() {
            var element = this.getElement()[0];
            var minInput = element.querySelector("[name=min]");
            var minToggler = element.querySelector('[name="min-toggler"]');

            assert.ok(!this.isFieldEnabled('min'), 'min starts disabled');
            assert.ok(minInput.classList.contains('disabled'), 'The min starts disabled');
            assert.ok(!minToggler.checked, 'The toggler starts unchecked');
            assert.equal(minInput.value, 0, 'min starts with a value at 0');
            assert.equal(this.getMinValue(), 0, 'min starts with a value at 0');

            this.on('enablemin', function() {

                assert.ok(this.isFieldEnabled('min'), 'min is now enabled');
                assert.ok(!minInput.classList.contains('disabled'), 'The min is not disabled anymore');
                assert.ok(minToggler.checked, 'The toggler is now checked');
                assert.equal(minInput.value, 1, 'min has now a value of 1');
                assert.equal(this.getMinValue(), 1, 'min now a value of 0');

                ready();
            });

            minToggler.click();
        });
    });

    QUnit.test('enable/disable max using method', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(13);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 0,
                toggler: true
            },
            max: {
                fieldName: 'max',
                value: 0,
                toggler: true
            }
        })
        .on('render', function() {
            var element = this.getElement()[0];
            var maxInput = element.querySelector('[name=max]');

            assert.ok(!this.isFieldEnabled('max'), 'max starts disabled');
            assert.ok(maxInput.classList.contains('disabled'), 'The max starts disabled');
            assert.equal(maxInput.value, 0, 'max starts with a value at 0');
            assert.equal(this.getMaxValue(), 0, 'max starts with a value at 0');

            this.on('enablemax', function() {

                assert.ok(this.isFieldEnabled('max'), 'max is now enabled');
                assert.ok(!maxInput.classList.contains('disabled'), 'The max is not disabled anymore');
                assert.equal(maxInput.value, 1, 'max has now a value of 1');
                assert.equal(this.getMaxValue(), 1, 'max has now a value of 1');

                this.disableField('max');
            });
            this.on('disablemax', function() {

                assert.ok(!this.isFieldEnabled('max'), 'max is now disabled');
                assert.ok(maxInput.classList.contains('disabled'), 'The max is now disabled');
                assert.equal(maxInput.value, 0, 'max has now a value of 0');
                assert.equal(this.getMaxValue(), 0, 'max has now a value of 0');

                ready();
            });

            this.enableField('max');
        });
    });

    QUnit.test('change values, upper bound', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(10);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 1,
                toggler: false
            },
            max: {
                fieldName: 'max',
                value: 1,
                toggler: false
            },
            lowerThreshold: 1,
            upperThreshold: 5
        })
        .on('render', function() {
            var self = this;
            var element = this.getElement()[0];
            var maxInput = element.querySelector('[name=max]');

            assert.equal(this.getMaxValue(), 1, 'max starts with a value at 1');

            this.setMaxValue(5);
            assert.equal(this.getMaxValue(), 5, 'max value has been updated');
            assert.equal(maxInput.value, 5, 'max value field has been updated');

            this.setMaxValue(6);
            assert.equal(this.getMaxValue(), 5, 'max value remains');
            assert.equal(maxInput.value, 5, 'max value remains');

            maxInput.value = 2;
            maxInput.dispatchEvent(getKeyBoardEvent('keyup', '2'));
            setTimeout(function() {

                assert.equal(self.getMaxValue(), 2, 'max value has been updated');
                assert.equal(maxInput.value, 2, 'max value field has been updated');

                maxInput.value = 12;

                maxInput.dispatchEvent(getKeyBoardEvent('keyup', '12'));

                setTimeout(function() {

                    assert.equal(self.getMaxValue(), 5, 'max value is at the upperbound');
                    assert.equal(maxInput.value, 5, 'max value is at the upperbound');
                    ready();
                }, 650);
            }, 650);
        });
    });

    QUnit.test('change values, lower bound', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(10);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 1,
                toggler: false
            },
            max: {
                fieldName: 'max',
                value: 1,
                toggler: false
            },
            lowerThreshold: 1,
            upperThreshold: 5
        })
        .on('render', function() {
            var self = this;
            var element = this.getElement()[0];
            var minInput = element.querySelector('[name=min]');

            assert.equal(this.getMinValue(), 1, 'min starts with a value at 1');

            this.setMinValue(5);
            assert.equal(this.getMinValue(), 5, 'min value has been updated');
            assert.equal(minInput.value, 5, 'min value field has been updated');

            this.setMinValue(6);
            assert.equal(this.getMinValue(), 5, 'min value remains');
            assert.equal(minInput.value, 5, 'min value remains');

            minInput.value = 2;
            minInput.dispatchEvent(getKeyBoardEvent('keyup', '2'));
            setTimeout(function() {

                assert.equal(self.getMinValue(), 2, 'min value has been updated');
                assert.equal(minInput.value, 2, 'min value field has been updated');

                minInput.value = -5;
                minInput.dispatchEvent(getKeyBoardEvent('keyup', '-5'));
                setTimeout(function() {

                    assert.equal(self.getMinValue(), 1, 'min value is at the lowerbound');
                    assert.equal(minInput.value, 1, 'min value is at the lowerbound');
                    ready();
                }, 650);
            }, 650);
        });
    });

    QUnit.test('change thresholds ', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(11);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 3,
                toggler: false
            },
            max: {
                fieldName: 'max',
                value: 3,
                toggler: false
            },
            lowerThreshold: 2,
            upperThreshold: 5,
            sync: false
        })
        .on('render', function() {
            var element = this.getElement()[0];

            assert.equal(this.getMinValue(), 3, 'min starts with a value at 3');
            assert.equal(this.getMaxValue(), 3, 'max starts with a value at 3');

            this.setMinValue(1);
            this.setMaxValue(1);
            assert.equal(this.getMinValue(), 3, 'min is not updated');
            assert.equal(this.getMaxValue(), 3, 'max is not update');

            this.setMinValue(6);
            this.setMaxValue(6);
            assert.equal(this.getMinValue(), 3, 'min is not updated');
            assert.equal(this.getMaxValue(), 3, 'max is not update');

            this.updateThresholds(1, 10);

            this.setMinValue(6);
            this.setMaxValue(6);
            assert.equal(this.getMinValue(), 6, 'min value can be set in the new range');
            assert.equal(this.getMaxValue(), 6, 'max value can be set in the new range');

            this.setMinValue(1);
            this.setMaxValue(1);
            assert.equal(this.getMinValue(), 1, 'min value can be set in the new range');
            assert.equal(this.getMaxValue(), 1, 'max value can be set in the new range');

            ready();
        });
    });

    QUnit.test('sync values', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('qunit-fixture');

        assert.expect(15);

        assert.equal(container.querySelector('.min-max'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {
            min: {
                fieldName: 'min',
                value: 2,
                toggler: false
            },
            max: {
                fieldName: 'max',
                value: 1,
                toggler: false
            },
            syncValues: true,
            lowerThreshold: 1,
            upperThreshold: 5
        })
        .on('render', function() {
            var element = this.getElement()[0];
            var minInput = element.querySelector('[name=min]');
            var maxInput = element.querySelector('[name=max]');

            assert.equal(this.getMinValue(), 2, 'min starts with a value at 2');
            assert.equal(this.getMaxValue(), 2, 'max starts with a value at 2, to be in sync');

            this.setMinValue(3);
            this.syncValues('min');

            assert.equal(this.getMinValue(), 3, 'min value has been updated');
            assert.equal(minInput.value, 3, 'min value field has been updated');

            assert.equal(this.getMaxValue(), 3, 'max has been updated according to min');
            assert.equal(maxInput.value, 3, 'max has been updated according to min');

            this.setMaxValue(2);
            this.syncValues('max');

            assert.equal(this.getMaxValue(), 2, 'max value has been updated');
            assert.equal(maxInput.value, 2, 'max value field has been updated');

            assert.equal(this.getMinValue(), 2, 'min has been updated according to max');
            assert.equal(minInput.value, 2, 'min has been updated according to max');

            minInput.value = NaN;
            this.syncValues('min');

            assert.equal(
                this.getMinValue(), this.getConfig().lowerThreshold, 'min value changed from NaN to lowerThreshold'
            );
            assert.equal(minInput.value, this.getConfig().lowerThreshold, 'min value field has been updated');

            maxInput.value = NaN;
            this.syncValues('max');

            assert.equal(
                this.getMaxValue(), this.getConfig().lowerThreshold, 'max value changed from NaN to lowerThreshold'
            );
            assert.equal(maxInput.value, this.getConfig().lowerThreshold, 'max value field has been updated');

            ready();
        });
    });

    QUnit.module('Visual test');

    QUnit.test('Rendering', function(assert) {
        var ready = assert.async();
        var container = document.getElementById('outside-container');

        assert.expect(1);

        assert.equal(container.querySelector('.minMax'), null, 'The component does not exists yet');

        minMaxComponentFactory(container, {

        })
        .on('render', function() {
            ready();
        });
    });
});
