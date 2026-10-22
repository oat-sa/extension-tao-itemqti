define(['lodash', 'jquery', 'i18n', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/Instruction', 'handlebars', 'lib/handlebars/helpers'], function (_, $$1, __, containerHelper, Instruction, Handlebars, Helpers0) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    Instruction = Instruction && Object.prototype.hasOwnProperty.call(Instruction, 'default') ? Instruction['default'] : Instruction;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<div class=\"small feedback-";
      if (helper = helpers.level) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.level); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + " item-notification\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    <span class=\"icon-";
      if (helper = helpers.level) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.level); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"></span><span class=\"feedback-message\">";
      if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n    <span title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Remove Message", options) : helperMissing.call(depth0, "__", "Remove Message", options)))
        + "\" class=\"icon-close close-trigger\"></span>\n</div>\n";
      return buffer;
      });
    function notifTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

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
     * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

    //stores the instructions
    var _instructions = {};

    /**
     * The instruction manager helps you in managing instructions and
     * constraints on a QTI Element, usually an interaction or a choice.
     *
     * @exports qtiCommonRenderer/helpers/Instructions/instructionManager
     */
    var instructionManager = {
        /**
         * Validate the instructions of an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         * @param {Object} [data] - any data to give to the instructions
         */
        validateInstructions: function (element, data) {
            var serial = element.getSerial();
            if (_instructions[serial]) {
                _.forEach(_instructions[serial], function (instruction) {
                    instruction.validate(data || {});
                });
            }
        },

        /**
         * Add a new instructions to an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         * @param {String} message - the message to give to display to the user when the instruction is validated
         * @param {Function} validateCallback - how to validate the instruction
         * @returns {Instruction} the created instruction
         */
        appendInstruction: function (element, message, validateCallback) {
            var serial = element.getSerial(),
                instruction = new Instruction(element, message, validateCallback);

            if (!_instructions[serial]) {
                _instructions[serial] = {};
            }
            _instructions[serial][instruction.getId()] = instruction;

            instruction.create($$1('.instruction-container', containerHelper.get(element)));

            return instruction;
        },

        /**
         * Remove instructions from an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         */
        removeInstructions: function (element) {
            _instructions[element.getSerial()] = {};
            containerHelper.get(element).find('.instruction-container').empty();
        },

        /**
         * Reset the instructions states for an element (but keeps configuration)
         * @param {Object} element - the qti object, ie. interaction, choice, etc.
         */
        resetInstructions: function (element) {
            var serial = element.getSerial();
            if (_instructions[serial]) {
                _.forEach(_instructions[serial], function (instruction) {
                    instruction.reset();
                });
            }
        },

        /**
         * Default instuction set with a min/max constraints.
         * @param {Object} interaction
         * @param {jQueryElement} $container
         * @param {Object} options
         * @param {Number} [options.min = 0] -
         * @param {Number} [options.max = 0] -
         * @param {Function} options.getResponse - a ref to a function that get the raw response (array) from the interaction in parameter
         * @param {Function} [options.onError] - called by once an error occurs with validateInstruction data in parameters
         */
        minMaxChoiceInstructions: function (interaction, options) {
            var self = this,
                min = options.min || 0,
                max = options.max || 0,
                getResponse = options.getResponse,
                onError = options.onError || _.noop(),
                choiceCount = options.choiceCount === false ? false : _.size(interaction.getChoices()),
                minInstructionSet = false,
                msg;

            if (!_.isFunction(getResponse)) {
                throw 'invalid parameter getResponse';
            }

            //if maxChoice = 0, inifinite choice possible
            if (max > 0 && (choiceCount === false || max < choiceCount)) {
                if (max === min) {
                    minInstructionSet = true;
                    msg =
                        max <= 1
                            ? __('You must select exactly %d choice', max)
                            : __('You must select exactly %d choices', max);

                    self.appendInstruction(interaction, msg, function (data) {
                        if (getResponse(interaction).length >= max) {
                            this.setLevel('success');
                            if (this.checkState('fulfilled')) {
                                this.update({
                                    level: 'warning',
                                    message: __('Maximum choices reached'),
                                    timeout: 2000,
                                    start: function () {
                                        onError(data);
                                    },
                                    stop: function () {
                                        this.update({ level: 'success', message: msg });
                                    }
                                });
                            }
                            this.setState('fulfilled');
                        } else {
                            this.reset();
                        }
                    });
                } else if (max > min) {
                    msg =
                        max <= 1
                            ? __('You can select maximum %d choice', max)
                            : __('You can select maximum %d choices', max);
                    self.appendInstruction(interaction, msg, function (data) {
                        if (getResponse(interaction).length >= max) {
                            this.setLevel('success');
                            this.setMessage(__('Maximum choices reached'));
                            if (this.checkState('fulfilled')) {
                                this.update({
                                    level: 'warning',
                                    timeout: 2000,
                                    start: function () {
                                        onError(data);
                                    },
                                    stop: function () {
                                        this.setLevel('info');
                                    }
                                });
                            }

                            this.setState('fulfilled');
                        } else {
                            this.reset();
                        }
                    });
                }
            }

            if (!minInstructionSet && min > 0 && (choiceCount === false || min < choiceCount)) {
                msg =
                    min <= 1
                        ? __('You must select at least %d choice', min)
                        : __('You must select at least %d choices', min);
                self.appendInstruction(interaction, msg, function () {
                    if (getResponse(interaction).length >= min) {
                        this.setLevel('success');
                    } else {
                        this.reset();
                    }
                });
            }
        },

        /**
         * Appends a instruction  notification message
         * @deprecated in favor of instructions
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         * @param {String} message - the message to give to display
         * @param {String} [level = 'info'] - the notification level in info, success, error or warning
         */
        appendNotification: function (element, message, level) {
            level = level || 'info';

            if (Instruction.isValidLevel(level)) {
                var $container = containerHelper.get(element);

                $container.find('.notification-container').prepend(
                    notifTpl({
                        level: level,
                        message: message
                    })
                );

                var $notif = $container.find('.item-notification:first');
                var _remove = function () {
                    $notif.fadeOut();
                };

                $notif.find('.close-trigger').on('click', _remove);
                setTimeout(_remove, 2000);

                return $notif;
            }
        },

        /**
         * Removes all the displayed notifications
         * @deprecated in favor of instructions
         */
        removeNotifications: function (element) {
            containerHelper.get(element).find('.item-notification').remove();
        }
    };

    return instructionManager;

});
