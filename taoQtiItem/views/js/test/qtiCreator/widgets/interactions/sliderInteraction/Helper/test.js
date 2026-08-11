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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'ui/feedback',
    'ui/dialog/confirm',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Helper'
], function(
    _,
    feedback,
    dialogConfirm,
    sliderInteractionHelper
) {
    'use strict';

    const interaction = {
        attributes: {
            lowerBound: 0,
            upperBound: 0,
            step: 1,
        }
    }

    const response = { setCorrect: function setCorrect(correct) {} }

    QUnit.module('responseManager');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.ok(typeof sliderInteractionHelper.responseManager === 'function', 'The module expose a function');
    });

    QUnit.test('Test manager', function (assert) {
        assert.expect(2);
        const responseManager = sliderInteractionHelper.responseManager(interaction, 0);
        assert.ok(responseManager.isValid());
        assert.equal(responseManager.getErrorMessage(), '');
    });

    QUnit.test('Check bound range', function (assert) {
        assert.expect(2);
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 1;
        const responseManager = sliderInteractionHelper.responseManager(testInteraction, 0);
        assert.equal(responseManager.isValid(), false);
        assert.equal(responseManager.getErrorMessage(), 'Lower bound is bigger than upper bound.');
    });

    QUnit.test('Check only possible response failed', function (assert) {
        assert.expect(2);
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 2;
        const responseManager = sliderInteractionHelper.responseManager(testInteraction, 0);
        assert.equal(responseManager.isValid(), false);
        assert.equal(responseManager.getErrorMessage(), 'Response ["0"] should be the only possible value "2".');
    });

    QUnit.test('Check only possible response correct', function (assert) {
        assert.expect(2);
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 2;
        sliderInteractionHelper.responseManager(testInteraction, 2);
        const responseManager = sliderInteractionHelper.responseManager(testInteraction, 2);
        assert.equal(responseManager.isValid(), true);
        assert.equal(responseManager.getErrorMessage(), '');
    });

    QUnit.test('Current response is bigger than upper bound', function (assert) {
        assert.expect(2);
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 3;
        const responseManager = sliderInteractionHelper.responseManager(testInteraction, 5);
        assert.equal(responseManager.isValid(), false);
        assert.equal(responseManager.getErrorMessage(), 'Response ["5"] is bigger than the upper bound value "3".');
    });

    QUnit.test('Current response is lower than lower bound', function (assert) {
        assert.expect(2);
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 3;
        const responseManager = sliderInteractionHelper.responseManager(testInteraction, 1);
        assert.equal(responseManager.isValid(), false);
        assert.equal(responseManager.getErrorMessage(), 'Response ["1"] is lower than the lower bound value "2".');
    });
});
