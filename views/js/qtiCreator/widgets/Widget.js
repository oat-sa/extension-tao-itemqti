/*
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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'jquery',
    'core/promise',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/helper/invalidator',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'core/logger'
], function (_, $, Promise, Element, invalidator, styleEditor, loggerFactory) {
    'use strict';

    const _pushState = function (widget, stateName) {
        const currentState = new widget.registeredStates[stateName](widget);
        widget.stateStack.push(currentState);
        currentState.init();
        if (stateName === 'deleting') {
            // stylesheet clean
            const passageSerial = widget.$container[0].dataset['serial'];
            styleEditor.removeStylesheetOnDeletePassage(passageSerial);
        }
    };

    const _popState = function (widget) {
        const state = widget.stateStack.pop();
        if (state) {
            state.exit();
        }
    };

    const createEventName = (widget, name, ns) => {
        const eventName = `${name}.qti-widget.${widget.serial}`;
        if (ns) {
            return `${eventName}.${ns}`;
        }
        return eventName;
    };
    /**
     * Create a logger
     */
    const logger = loggerFactory('taoQtiItem/qtiCreator/widget');

    const Widget = {
        /**
         * Intialize qti element creator widget
         *
         * @param {Object} element - standard qti object
         * @param {Jquery} $original - tje proginal DOM element of the qti element
         * @param {JQuery} $form - the property form of the qti element
         * @param {Object} options
         * @fires ready.qti-widget after it is executed
         * @returns {Object} The initialized widget
         */
        init: function (element, $original, $form, options) {
            if (element instanceof Element) {
                options = options || {};

                this.element = element;
                this.serial = element.getSerial();
                this.$original = $original;
                this.$form = $form;
                this.stateStack = [];

                this.registeredStates = {};

                //build container from origin element
                this.buildContainer();

                //attach the widget to widget $container and element:
                this.$original.data('widget', this);
                this.$container.data('widget', this);

                this.element.data('widget', this);

                //clean old referenced event
                this.offEvents(); //not sure if still required after state definition

                //pass the options to the initCreator for custom options usage
                _.forEach(this.getRequiredOptions(), function (opt) {
                    if (!options[opt]) {
                        throw new Error(`missing required option for image creator : ${opt}`);
                    }
                });
                this.options = options;
                Promise.resolve(this.initCreator(options)).then(() => {
                    //communicate the widget readiness
                    if (_.isFunction(this.options.ready)) {
                        this.options.ready.call(this, this);
                    }
                    this.$container.trigger('ready.qti-widget', [this]);
                });

                //init state after creator init
                if (this.options.state) {
                    this.changeState(this.options.state);
                } else {
                    this.changeState('sleep');
                }
            } else {
                throw new Error('element is not a QTI Element');
            }
            return this;
        },
        getAreaBroker: function getAreaBroker() {
            const element = this.element,
                renderer = element.getRenderer();

            if (renderer) {
                return renderer.getAreaBroker();
            }
        },
        getCreatorContext: function getCreatorContext() {
            const element = this.element,
                renderer = element.getRenderer();

            if (renderer) {
                return renderer.getCreatorContext();
            }
        },
        getRequiredOptions: function () {
            return [];
        },
        buildContainer: function () {
            throw new Error('method buildContainer must be implemented');
        },
        build: function (element, $container, $form, options) {
            return this.clone().init(element, $container, $form, options);
        },
        clone: function () {
            return _.clone(this);
        },
        initCreator: function () {
            //prepare all common actions, event handlers and dom for every state of the widget

            const $interaction = this.$container.find('.qti-interaction');
            const serial = $interaction.data('serial');

            this.$container.on('resize.itemResizer', function () {
                $(window).trigger(`resize.qti-widget.${serial}`);
            });
        },
        getCurrentState: function () {
            return _.last(this.stateStack);
        },
        /**
         * Very important method:
         * It changes the state of the widget by checking the relation between
         * the target and the current states.
         *
         * @param {string} stateName
         * @returns {object} this
         */
        changeState: function (stateName) {
            let state,
                superStateName,
                currentState = this.getCurrentState(),
                exitedStates,
                enteredStates,
                i;

            logger.info(`changing state of ${this.serial}: ${(currentState || {}).name} => ${stateName}`);

            if (this.registeredStates[stateName]) {
                state = new this.registeredStates[stateName]();
            } else {
                throw new Error(`unknown target state : ${stateName}`);
            }

            if (currentState) {
                // hide widget tooltips when interaction leaves response mapping ('map') state:
                if (currentState.name === 'map' && state.name !== 'map') {
                    this.$container.find('[data-has-tooltip]').each(function (j, el) {
                        $(el).data('$tooltip').hide();
                    });
                }

                if (currentState.name === state.name) {
                    return this;
                } else if (_.indexOf(state.superState, currentState.name) >= 0) {
                    //initialize super states in reverse order:
                    for (i = _.indexOf(state.superState, currentState.name) - 1; i >= 0; i--) {
                        superStateName = state.superState[i];
                        _pushState(this, superStateName);
                    }
                } else if (_.indexOf(currentState.superState, state.name) >= 0) {
                    //just exit as much state as needed to get to it:
                    for (i = 0; i <= _.indexOf(currentState.superState, state.name); i++) {
                        _popState(this);
                    }

                    return this;
                } else {
                    //first, exit the current state
                    _popState(this);

                    //then, exit super states in order:
                    exitedStates = _.difference(currentState.superState, state.superState);
                    _.forEach(exitedStates, () => {
                        _popState(this);
                    });

                    //finally, init super states in reverse order:
                    enteredStates = _.difference(state.superState, currentState.superState);
                    _.forEachRight(enteredStates, _superStateName => {
                        _pushState(this, _superStateName);
                    });
                }
            } else {
                _.forEachRight(state.superState, _superStateName => {
                    _pushState(this, _superStateName);
                });
            }

            _pushState(this, stateName);
            return this;
        },
        registerState: function (name, State) {
            if (name && State) {
                this.registeredStates[name] = State;
            } else {
                throw new Error('missing required arguments in state registration');
            }
        },
        registerStates: function (states) {
            _.forIn(states, (State, name) => {
                this.registerState(name, State);
            });
        },
        afterStateInit: function (callback, ns) {
            $(document).on(createEventName(this, 'afterStateInit', ns), callback);
        },
        beforeStateInit: function (callback, ns) {
            $(document).on(createEventName(this, 'beforeStateInit', ns), callback);
        },
        afterStateExit: function (callback, ns) {
            $(document).on(createEventName(this, 'afterStateExit', ns), callback);
        },
        beforeStateExit: function (callback, ns) {
            $(document).on(createEventName(this, 'beforeStateExit', ns), callback);
        },
        offEvents: function (ns) {
            $(document).off(createEventName(this, '', ns));

            this.$container.off('resize.itemResizer');
        },
        destroy: function () {
            logger.info(`destroying widget ${this.serial}`);

            //to call exit method and clean up listeners
            this.changeState('sleep');

            //remove editable widgets
            this.$container.find('[data-edit]').remove();
            $(`[data-widget-component=${this.serial}]`).remove();

            //clean old referenced event
            this.offEvents();
        },
        rebuild: function (options) {
            let element, postRenderOpts, $container, renderer;

            options = options || {};

            element = this.element;
            postRenderOpts = {};
            if (_.isFunction(options.ready)) {
                postRenderOpts.ready = options.ready;
            }

            $container = null;
            if (options.context && options.context.length) {
                //if the context option is provided, the function will fetch the widget container that in this context
                //mandatory for detached of duplicated DOM element (e.g. ckEditor)
                $container = options.context.find(`.widget-box[data-serial=${element.serial}]`);
            } else if (this.$container.length && $.contains(document, this.$container[0])) {
                //if the container exist and is NOT detached
                $container = this.$container;
            } else {
                //otherwise use less performance efficient selector
                $container = $(`.widget-box[data-serial=${element.serial}]`);
            }
            let contentEditableState = $container.attr('contenteditable');

            //once required data ref has been set, destroy it:
            this.destroy();

            //we assume that the element still has its renderer set, check renderer:
            renderer = element.getRenderer();

            if (renderer && renderer.isRenderer) {
                if (renderer.name === 'creatorRenderer') {
                    element.render($container);
                    element.postRender(postRenderOpts);
                    element.data('widget').$container.attr('contenteditable', contentEditableState);
                    return element.data('widget');
                } else {
                    throw new Error('The renderer is no longer the creatorRenderer');
                }
            } else {
                throw new Error('No renderer found to rebuild the widget');
            }
        },

        refresh: function () {
            const currentState = this.getCurrentState().name;

            this.rebuild({
                ready: function (widget) {
                    widget.changeState(currentState);
                }
            });
        },

        //assign an event listener that lives with the state
        on: function (qtiElementEventName, callback, live) {
            const eventNames = qtiElementEventName.replace(/\s+/g, ' ').split(' '),
                $document = $(document);

            _.forEach(eventNames, eventName => {
                const eventNameToken = [eventName, 'qti-widget', this.serial];

                if (!live) {
                    eventNameToken.push(this.getCurrentState().name);
                }

                //bind each individual event listener to the document
                $document.on(eventNameToken.join('.'), (e, data) => {
                    callback.call(this, data, e);
                });
            });

            return this; //for chaining
        },
        /**
         * Get / Set the validation state
         * @param {String} [what] - key to identify the validation
         * @param {Boolean} [valid] - false to invalidate
         * @param {String} [why] - message
         * @returns {boolean} - if what return isValid
         */
        isValid: function (what, valid, why) {
            const element = this.element;

            if (typeof what === 'undefined') {
                //get
                return invalidator.isValid(element);
            } else if (valid) {
                invalidator.valid(element, what);
            } else {
                invalidator.invalid(element, what, why, this.getCurrentState().name);
            }
        }
    };

    return Widget;
});
