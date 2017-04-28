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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/editor/mathInput/mathInput'
], function (_, $, mathInputFactory) {
    'use strict';

    var fixtureContainer = $('#qunit-fixture');

    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof mathInputFactory === 'function', 'The module expose a function');
    });

    QUnit
        .cases([
            { title: 'setLatex' },
            { title: 'getLatex' }
        ])
        .test('component API', function(data, assert) {
            var mathInput = mathInputFactory();

            QUnit.expect(1);
            assert.equal(typeof mathInput[data.title], 'function', 'The component has the method ' + data.title);
        });

    QUnit.module('mathInput');

    QUnit.asyncTest('setLatex() / getLatex()', function(assert) {
        var mathInput = mathInputFactory(),
            $container = $(fixtureContainer);

        QUnit.expect(3);

        mathInput
            .on('render', function(){
                var sampleLatex = '\\frac{1}{69}';

                assert.equal(mathInput.getLatex(), '', 'there is no content yet');

                mathInput.setLatex(sampleLatex);
                assert.equal(mathInput.getLatex(), sampleLatex, 'correct Latex expression has been set');

                mathInput.destroy();

                assert.ok(_.isUndefined(mathInput.getLatex()), 'content has been destroyed');
                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit
        .cases([
            { title: 'frac',        latex: '\\frac{ }{ }' },
            { title: 'sqrt',        latex: '\\sqrt{ }' },
            { title: 'exp',         latex: '^{ }' },
            { title: 'log',         latex: '\\log' },
            { title: 'ln',          latex: '\\ln' },
            { title: 'e',           latex: '\\mathrm{e}' },
            { title: 'infinity',    latex: '\\infty' },
            { title: 'lbrack',      latex: '[' },
            { title: 'rbrack',      latex: ']' },
            { title: 'pi',          latex: '\\pi' },
            { title: 'cos',         latex: '\\cos' },
            { title: 'sin',         latex: '\\sin' },
            { title: 'lte',         latex: '\\le' },
            { title: 'gte',         latex: '\\ge' },
            { title: 'times',       latex: '\\times' },
            { title: 'divide',      latex: '\\div' },
            { title: 'plusminus',   latex: '\\pm' }
        ])
        .asyncTest('buttons', function(data, assert) {
            var mathInput = mathInputFactory(),
                $container = $(fixtureContainer);

            QUnit.expect(2);

            mathInput
                .on('render', function(){
                    var $button = $container.find('[data-identifier="' + data.title + '"]');
                    assert.equal($button.length, 1, 'button has been rendered');

                    $button.trigger('mousedown');
                    assert.equal(mathInput.getLatex(), data.latex, 'button creates the correct latex');

                    QUnit.start();
                })
                .init()
                .render($container);
        });

    QUnit.asyncTest('stop clic propagation', function(assert) {
        var mathInput = mathInputFactory(),
            $container = $(fixtureContainer);

        QUnit.expect(1);

        mathInput
            .on('render', function(){
                var $component = this.getElement(),
                    $inputField = $component.find('.math-input-mathquill');

                assert.equal($inputField.length, 1, 'inputField has been found');

                $component.on('mousedown', function() {
                    assert.ok(false, 'Event should not propagate to the component\'s root element');
                    QUnit.start();
                });

                $inputField.trigger('mousedown');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function (assert) {
        var mathInput = mathInputFactory(),
            $container = $('#outside-container'),
            $latexResponse = $('<span>', { text: '_' });

        QUnit.expect(1);

        mathInput
            .on('render', function(){
                $container.append($('<div>', { text: 'Latex: ' }).append($latexResponse));

                assert.ok(true);
                QUnit.start();
            })
            .on('change', function() {
                $latexResponse.html(this.getLatex());
            })
            .init()
            .render($container);
    });

});