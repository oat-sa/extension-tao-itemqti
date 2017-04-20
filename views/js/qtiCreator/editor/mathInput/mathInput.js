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
 * This component present a MathQuill (Latex Wysiwyg) input with a toolbar that allows to add some predefined symbols
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'jquery',
    'ui/component',
    'taoQtiItem/lib/mathquill/mathquill',
    'tpl!taoQtiItem/qtiCreator/editor/mathInput/tpl/mathInput',
    'css!taoQtiItem/lib/mathquill/mathquill'
], function(
    _,
    __,
    $,
    componentFactory,
    MathQuill,
    layoutTpl
) {
    'use strict';

    var eventNs = '.mathInputWysiwyg';

    /**
     * 'cmd' vs 'write'
     * ================
     * 'write': You're supposed to pass fully formed LaTeX to 'write', such as '\log\left\{\right\}'. The idea is, it inserts
     * that LaTeX math to the left of the cursor. The LaTeX passed in will be inserted at the current cursor position
     * or replace the current selection, and the cursor ends up to the right of what was just inserted.
     *
     * 'cmd': You're only supposed to pass a single MathQuill command to 'cmd', such as '\sqrt'. The idea is, it's as if
     * you just typed in that MathQuill command. If there is a current selection, it will end up inside the square root,
     * otherwise it inserts the square root at the current cursor position, but the cursor now instead ends up inside
     * the square root command.
     *
     * src: https://github.com/mathquill/mathquill/issues/74
     */
    var allTools = {
            frac:       { label: 'x/y',         latex: '\\frac',        fn: 'cmd',      desc: __('Fraction') },
            sqrt:       { label: '&radic;',     latex: '\\sqrt',        fn: 'cmd',      desc: __('Square root') },
            exp:        { label: 'x&#8319;',    latex: '^',             fn: 'cmd',      desc: __('Exponent') },
            log:        { label: 'log',         latex: '\\log',         fn: 'cmd',      desc: __('Log') },
            ln:         { label: 'ln',          latex: '\\ln',          fn: 'cmd',      desc: __('Ln') },
            e:          { label: '&#8494;',     latex: '\\mathrm{e}',   fn: 'write',    desc: __('Euler\'s constant') },
            infinity:   { label: '&#8734;',     latex: '\\infty',       fn: 'cmd',      desc: __('Infinity') },
            lbrack:     { label: '[',           latex: '\\lbrack',      fn: 'cmd',      desc: __('Left bracket') },
            rbrack:     { label: ']',           latex: '\\rbrack',      fn: 'cmd',      desc: __('Right bracket') },
            pi:         { label: '&pi;',        latex: '\\pi',          fn: 'cmd',      desc: __('Pi') },
            cos:        { label: 'cos',         latex: '\\cos',         fn: 'cmd',      desc: __('Cosinus') },
            sin:        { label: 'sin',         latex: '\\sin',         fn: 'cmd',      desc: __('Sinus') },
            lte:        { label: '&le;',        latex: '\\le',          fn: 'cmd',      desc: __('Lower than or equal') },
            gte:        { label: '&ge;',        latex: '\\ge',          fn: 'cmd',      desc: __('Greater than or equal') },
            times:      { label: '&times;',     latex: '\\times',       fn: 'cmd',      desc: __('Multiply') },
            divide:     { label: '&divide;',    latex: '\\div',         fn: 'cmd',      desc: __('Divide') },
            plusminus:  { label: '&#177;',      latex: '\\pm',          fn: 'cmd',      desc:__( 'Plus/minus') }
        },
        allToolGroups = [
            { id: 'functions',  tools: ['sqrt', 'frac', 'exp', 'log', 'ln'] },
            { id: 'symbols',    tools: ['e', 'infinity', 'lbrack', 'rbrack'] },
            { id: 'trigo',      tools: ['pi', 'sin', 'cos'] },
            { id: 'comparison', tools: ['lte', 'gte'] },
            { id: 'operands',   tools: ['times', 'divide', 'plusminus'] }
        ];

    /**
     * Create the toolbar markup with event attached
     * @param {jQuery} $container - where to render the toolbar
     * @param {Object} mathField - MathQuill input field
     */
    function createToolbar($container, mathField) {
        $container.empty();

        // create buttons
        _.forOwn(allToolGroups, function(toolGroup) {
            $container.append(createToolGroup(toolGroup.tools, toolGroup.id));
        });

        // add behaviour
        // using mousedown instead of click so we can apply the button command without loosing the current selection
        $container
            .off('mousedown' + eventNs)
            .on('mousedown' + eventNs, function(e) {
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
     * @param {String[]} toolGroup - array of tools id composing the tool group
     * @param {String} toolGroupId
     * @returns {jQuery} the group of tool buttons
     */
    function createToolGroup(toolGroup, toolGroupId) {
        var $toolGroup = $('<div>', {
            'class': 'math-input-toolgroup',
            'data-identifier': toolGroupId
        });

        toolGroup.forEach(function(toolId) {
            var toolConfig = allTools[toolId];
            toolConfig.id = toolId;

            $toolGroup.append(createTool(toolConfig));
        });
        return $toolGroup;
    }

    /**
     * Create a single button
     * @param {Object} config
     * @param {String} config.id - id of the tool
     * @param {String} config.latex - latex code to be generated
     * @param {String} config.fn - Mathquill function to be called (ie. cmd or write)
     * @param {String} config.desc - mouse over description of the button
     * @param {String} config.label - label of the rendered button
     * @returns {jQuery} the created button
     */
    function createTool(config) {
        return $('<button>', {
            'class': 'small btn-info math-input-tool',
            'data-identifier': config.id,
            'data-latex': config.latex,
            'data-fn': config.fn,
            title: config.desc,
            html: config.label
        });
    }


    /**
     * The component factory
     */
    return function mathInputFactory() {
        var mathInputApi = {
            /**
             * @param {String} latexString
             */
            setLatex: function setLatex(latexString) {
                if (this.mathField) {
                    this.mathField.latex(latexString);
                }
            },

            /**
             * @returns {String} the current latex string contained in the MathQuill object
             */
            getLatex: function getLatex() {
                if (this.mathField) {
                    return this.mathField.latex();
                }
            },

            /**
             * Turns a DOM element into a MathQuill field
             * @param {jQuery} $element
             * @private
             */
            _initMathQuill: function _initMathQuill($element) {
                var self = this,
                    MQ = MathQuill.getInterface(2),
                    MQConfig = {
                        spaceBehavesLikeTab: true,
                        handlers: {
                            edit: function onChange() {
                                self.trigger('change', self.mathField.latex());
                            }
                        }
                    };

                this.mathField = MQ.MathField($element.get(0), MQConfig);
            }
        };

        /**
         * @returns {component}
         */
        return componentFactory(mathInputApi)
            .setTemplate(layoutTpl)
            .on('render', function init() {
                var $component = this.getElement(),
                    $toolbar = $component.find('.math-input-toolbar'),
                    $inputField = $component.find('.math-input-mathquill');

                this._initMathQuill($inputField);
                createToolbar($toolbar, this.mathField);

                // prevent dragging when the field is rendered in a draggable component
                $inputField.on('mousedown' + eventNs, function preventDrag(e) {
                    e.stopPropagation();
                });
            })
            .on('destroy', function() {
                var $component = this.getElement(),
                    $toolbar = $component.find('.math-input-toolbar'),
                    $inputField = $component.find('.math-input-mathquill');

                $toolbar.off(eventNs);
                $inputField.off(eventNs);

                if (this.mathField) {
                    this.mathField.revert().html();
                    this.mathField = null;
                }
            });
    };
});