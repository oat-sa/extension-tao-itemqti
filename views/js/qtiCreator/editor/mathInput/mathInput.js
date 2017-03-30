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
    'ui/component',
    'taoQtiItem/lib/mathquill/mathquill',
    'tpl!taoQtiItem/qtiCreator/editor/mathInput/tpl/mathInput',
    'css!taoQtiItem/lib/mathquill/mathquill'
], function(
    _,
    $,
    componentFactory,
    MathQuill,
    layoutTpl
) {
    'use strict';

    var allTools = {
            frac:   { label: 'x/y',         latex: '\\frac',    fn: 'cmd',      desc: 'Fraction' },
            sqrt:   { label: '&radic;',     latex: '\\sqrt',    fn: 'cmd',      desc: 'Square root' },
            exp:    { label: 'x&#8319;',    latex: '^',         fn: 'cmd',      desc: 'Exponent' },
            log:    { label: 'log',         latex: '\\log',     fn: 'write',    desc: 'Log' },
            ln:     { label: 'ln',          latex: '\\ln',      fn: 'write',    desc: 'Ln' },
            e:      { label: '&#8494;',     latex: '\\mathrm{e}',fn: 'write',   desc: 'Euler\'s constant' },
            pi:     { label: '&pi;',        latex: '\\pi',      fn: 'write',    desc: 'Pi' },
            cos:    { label: 'cos',         latex: '\\cos',     fn: 'write',    desc: 'Cosinus' },
            sin:    { label: 'sin',         latex: '\\sin',     fn: 'write',    desc: 'Sinus' },
            lte:    { label: '&le;',        latex: '\\le',      fn: 'write',    desc: 'Lower than or equal' },
            gte:    { label: '&ge;',        latex: '\\ge',      fn: 'write',    desc: 'Greater than or equal' },
            times:  { label: '&times;',     latex: '\\times',   fn: 'cmd',      desc: 'Multiply' },
            divide: { label: '&divide;',    latex: '\\div',     fn: 'cmd',      desc: 'Divide' }
        },
        allToolGroups = {
            functions:  ['sqrt', 'frac', 'exp', 'log', 'ln', 'e'],
            trigo:      ['pi', 'sin', 'cos'],
            comparison: ['lte', 'gte'],
            operands:   ['times', 'divide']
        };

    /**
     * Create the toolbar markup with event attached
     */
    function createToolbar($container, mathField) {
        $container.empty();

        // create buttons
        _.forOwn(allToolGroups, function(toolGroup, toolGroupId) {
            $container.append(createToolGroup(toolGroup, toolGroupId));
        });

        // add behaviour
        $container.off('mousedown.mathInput');
        $container.on('mousedown.mathInput', function(e) {
            var $target = $(e.target),
                fn = $target.data('fn'),
                latex = $target.data('latex');

            e.stopPropagation();
            e.preventDefault();

            switch (fn) {
                case 'cmd':
                    mathField.cmd(latex);
                    break;
                case 'write':
                    mathField.write(latex);
                    break;
            }

            mathField.focus();
        });
    }


    /**
     * Create a group of buttons
     * @returns {JQuery|string} the created element or an empty string
     */
    function createToolGroup(toolGroup, toolGroupId) {
        var $toolGroup = $('<div>', {
                'class': 'math-entry-toolgroup',
                'data-identifier': toolGroupId
            }),
            activeTools = 0;

        toolGroup.forEach(function(toolId) {
            var toolConfig = allTools[toolId];
            toolConfig.id = toolId;

            $toolGroup.append(createTool(toolConfig));
            activeTools++;
        });

        return (activeTools > 0) ? $toolGroup : '';
    }

    /**
     * Create a single button
     * @param {Object} config
     * @param {String} config.id    - id of the tool
     * @param {String} config.latex - latex code to be generated
     * @param {String} config.fn    - Mathquill function to be called (ie. cmd or write)
     * @param {String} config.label - label of the rendered button
     * @returns {jQuery} - the created button
     */
    function createTool(config) {
        return $('<button>', { // todo: use button if possible?
            'class': 'small btn-info math-entry-tool',
            'data-identifier': config.id,
            'data-latex': config.latex,
            'data-fn': config.fn,
            html: config.label
        });
    }


    /**
     * The factory !
     */
    return function mathInputFactory() {
        var mathInputApi;

        mathInputApi = {
            setLatex: function setLatex(latexString) {
                this.mathField.latex(latexString);
            },

            getLatex: function getLatex() {
                return this.mathField.latex();
            }
        };

        return componentFactory(mathInputApi)
            .setTemplate(layoutTpl)
            .on('render', function init() {
                var self = this,
                    $component = this.getElement(),
                    $toolbar = $component.find('.math-input-toolbar'),
                    MQ = MathQuill.getInterface(2),
                    MQConfig = {
                        handlers: {
                            edit: function onChange() {
                                self.trigger('change', self.mathField.latex());
                            }
                        }
                    };

                this.mathField = MQ.MathField($component.find('.math-input-mathquill').get(0), MQConfig);
                createToolbar($toolbar, this.mathField);
            })
            .on('destroy', function() {
                // todo destroy me wildly
            });
    };
});