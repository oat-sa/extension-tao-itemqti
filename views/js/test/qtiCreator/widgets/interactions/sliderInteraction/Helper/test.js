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

    const response = {
        setCorrect: function setCorrect(correct) {
        }
    }

    QUnit.module('responseManager');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.ok(typeof sliderInteractionHelper.responseManager === 'function', 'The module expose a function');
    });

    QUnit.test('Test manager', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        const testResponse = _.clone(response);
        testResponse.setCorrect = function (val) {
            assert.equal(val, 0, 'Default value used');
            ready();
        }
        sliderInteractionHelper.responseManager(interaction, testResponse, 0);
    });

    QUnit.test('Check bound range', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        feedback.on('error', function (msg) {
            assert.equal(msg, 'Lower bound can not be bigger than upper bound.', 'Error triggered')
            ready();
        });
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 1;
        sliderInteractionHelper.responseManager(interaction, response, 0);
    });

    QUnit.test('Check only possible response failed', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        dialogConfirm.off('message').on('message', function (msg) {
            assert.equal(msg, 'Change response ["0"] to the only possible value "2".', 'Dialog has correct message');
            ready();
        })
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 2;
        sliderInteractionHelper.responseManager(interaction, response, 0);
    });

    QUnit.test('Check only possible response correct', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        const testResponse = _.clone(response);
        testResponse.setCorrect = function (val) {
            assert.equal(val, 2, 'Default value used');
            ready();
        }
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 2;
        sliderInteractionHelper.responseManager(interaction, testResponse, 2);
    });

    QUnit.test('Current response is bigger than upper bound', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        dialogConfirm.off('message').on('message', function (msg) {
            assert.equal(msg, 'Change response ["5"] to the upper bound value "3".', 'Dialog has correct message');
            ready();
        })
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 3;
        sliderInteractionHelper.responseManager(interaction, response, 5);
    });

    QUnit.test('Current response is lower than lower bound', function (assert) {
        assert.expect(1);
        const ready = assert.async();
        dialogConfirm.off('message').on('message', function (msg) {
            assert.equal(msg, 'Change response ["1"] to the lower bound value "2".', 'Dialog has correct message');
            ready();
        })
        const testInteraction = _.clone(interaction);
        testInteraction.attributes.lowerBound = 2;
        testInteraction.attributes.upperBound = 3;
        sliderInteractionHelper.responseManager(interaction, response, 1);
    });
});
