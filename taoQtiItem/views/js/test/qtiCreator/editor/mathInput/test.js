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
], function(_, $, mathInputFactory) {
    'use strict';

    var fixtureContainer = $('#qunit-fixture');

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.expect(1);

        assert.ok(typeof mathInputFactory === 'function', 'The module expose a function');
    });

    QUnit
        .cases.init([
            {title: 'setLatex'},
            {title: 'getLatex'}
        ])
        .test('component API', function(data, assert) {
            var mathInput = mathInputFactory();

            assert.expect(1);
            assert.equal(typeof mathInput[data.title], 'function', 'The component has the method ' + data.title);
        });

    QUnit.module('mathInput');

    QUnit.test('setLatex() / getLatex()', function(assert) {
        var ready = assert.async();
        var mathInput = mathInputFactory(),
            $container = $(fixtureContainer);

        assert.expect(3);

        mathInput
            .on('render', function() {
                var sampleLatex = '\\frac{1}{69}';

                assert.equal(mathInput.getLatex(), '', 'there is no content yet');

                mathInput.setLatex(sampleLatex);
                assert.equal(mathInput.getLatex(), sampleLatex, 'correct Latex expression has been set');

                mathInput.destroy();

                assert.ok(_.isUndefined(mathInput.getLatex()), 'content has been destroyed');
                ready();
            })
            .init()
            .render($container);
    });

    QUnit
        .cases.init([
            {title: 'frac', latex: '\\frac{ }{ }'},
            {title: 'sqrt', latex: '\\sqrt{ }'},
            {title: 'exp', latex: '^{ }'},
            {title: 'log', latex: '\\log'},
            {title: 'ln', latex: '\\ln'},
            {title: 'e', latex: '\\mathrm{e}'},
            {title: 'infinity', latex: '\\infty'},
            {title: 'lbrack', latex: '\\left[\\right]'},
            {title: 'rbrack', latex: '\\left[\\right]'},
            {title: 'pi', latex: '\\pi'},
            {title: 'cos', latex: '\\cos'},
            {title: 'sin', latex: '\\sin'},
            {title: 'lte', latex: '\\le'},
            {title: 'gte', latex: '\\ge'},
            {title: 'times', latex: '\\times'},
            {title: 'divide', latex: '\\div'},
            {title: 'plusminus', latex: '\\pm'}
        ])
        .test('buttons', function(data, assert) {
            var ready = assert.async();
            var mathInput = mathInputFactory(),
                $container = $(fixtureContainer);

            assert.expect(2);

            mathInput
                .on('render', function() {
                    var $button = $container.find('[data-identifier="' + data.title + '"]');
                    assert.equal($button.length, 1, 'button has been rendered');

                    $button.trigger('mousedown');
                    assert.equal(mathInput.getLatex(), data.latex, 'button creates the correct latex');

                    mathInput.destroy();

                    ready();
                })
                .init()
                .render($container);
        });

    QUnit.module('Visual test');

    QUnit.test('display and play', function(assert) {
        var ready = assert.async();
        var mathInput = mathInputFactory(),
            $container = $('#outside-container'),
            $latexResponse = $('<span>', {text: '_'});

        assert.expect(1);

        mathInput
            .on('render', function() {
                $container.append($('<div>', {text: 'Latex: '}).append($latexResponse));

                assert.ok(true);
                ready();
            })
            .on('change', function() {
                $latexResponse.html(this.getLatex());
            })
            .init()
            .render($container);
    });

});
