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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/helpers/placeholder'
], function ($, placeholder) {
    'use strict';

    QUnit.module('placeholder');

    QUnit.test('module', function (assert) {
        QUnit.expect(2);

        assert.ok(typeof placeholder === 'object', 'The module expose an object');
        assert.ok(typeof placeholder.score === 'function', 'The module expose a score function');
    });

    QUnit.module('placeholder.score');

    QUnit.test('placeholder with a given value', function (assert) {
        var $container = $('#fixture-score');
        var $element = $container.find('.score');
        var expectedValue = 'foo';
        var widget = {
            $container: $container
        };

        QUnit.expect(2);

        assert.equal(typeof $element.attr('placeholder'), 'undefined', 'There is no placeholder value at this time');

        placeholder.score(widget, expectedValue);

        assert.equal($element.attr('placeholder'), expectedValue, 'The placeholder has the expected value');
    });

    QUnit.test('placeholder with a default value in the response', function (assert) {
        var $container = $('#fixture-score');
        var $element = $container.find('.score');
        var expectedValue = 'foo';
        var widget = {
            $container: $container,
            element: {
                getResponseDeclaration: function getResponseDeclaration() {
                    return {
                        getMappingAttribute: function getMappingAttribute(name) {
                            if (name === 'defaultValue') {
                                return expectedValue;
                            }
                        }
                    };
                }
            }
        };

        QUnit.expect(2);

        assert.equal(typeof $element.attr('placeholder'), 'undefined', 'There is no placeholder value at this time');

        placeholder.score(widget);

        assert.equal($element.attr('placeholder'), expectedValue, 'The placeholder has the expected value');
    });

    QUnit.test('placeholder with no default value in the response', function (assert) {
        var $container = $('#fixture-score');
        var $element = $container.find('.score');
        var expectedValue = '';
        var widget = {
            $container: $container,
            element: {
                getResponseDeclaration: function getResponseDeclaration() {
                    return {
                        getMappingAttribute: function getMappingAttribute(name) {
                        }
                    };
                }
            }
        };

        QUnit.expect(2);

        assert.equal(typeof $element.attr('placeholder'), 'undefined', 'There is no placeholder value at this time');

        placeholder.score(widget);

        assert.equal($element.attr('placeholder'), expectedValue, 'The placeholder has the expected value');
    });

});
