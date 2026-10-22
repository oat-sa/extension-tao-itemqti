define(['lodash', 'taoQtiItem/qtiItem/helper/util', 'handlebars', 'lib/handlebars/helpers'], function (_, util, Handlebars, Helpers0) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<div id=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" class=\"small feedback-info item-instruction\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    <span class=\"icon-info icon\"></span><span class=\"instruction-message\">";
      if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</span>\n</div>\n";
      return buffer;
      });
    function instructionTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    var _notificationLevels = ['info', 'warning', 'error', 'success'];

    var Instruction = function(interaction, message, callback) {
        this.interaction = interaction;
        this.defaultMessage = message || '';
        this.currentMessage = '';
        this.level = 'info';
        this.serial = util.buildSerial('instruction_');
        this.callback = callback;
        this.$dom = null;
        this.state = false;
    };

    Instruction.isValidLevel = function(level) {
        return _.indexOf(_notificationLevels, level) >= 0;
    };

    Instruction.prototype.setState = function(state) {
        this.state = state;
    };

    Instruction.prototype.checkState = function(state) {
        return this.state === state;
    };

    Instruction.prototype.getId = function() {
        return this.serial;
    };

    Instruction.prototype.create = function($container) {
        $container.append(
            instructionTpl({
                message: this.defaultMessage,
                serial: this.serial
            })
        );

        this.$dom = $container.find('#' + this.serial);
    };

    Instruction.prototype.update = function(options) {
        var level = options && options.level ? options.level : '',
            message = options && options.message ? options.message : '',
            timeout = options && options.timeout ? options.timeout : 0,
            start = options && typeof options.start === 'function' ? options.start : null,
            stop = options && typeof options.stop === 'function' ? options.stop : null;

        if (level && Instruction.isValidLevel(level)) {
            this.$dom.removeClass('feedback-' + this.level).addClass('feedback-' + level);
            this.$dom
                .find('.icon')
                .removeClass('icon-' + this.level)
                .addClass('icon-' + level);
            this.level = level;
        }

        if (message) {
            this.$dom.find('.instruction-message').html(message);
            this.currentMessage = message;
        }

        if (timeout) {
            var _this = this;
            if (start) {
                start.call(_this);
            }
            _this.timer = setTimeout(function() {
                if (stop) {
                    stop.call(_this);
                }
                _this.timer = null;
            }, timeout);
        }
    };

    Instruction.prototype.setLevel = function(level, timeout) {
        var options = {
            level: level
        };

        if (timeout) {
            options.timeout = parseInt(timeout);
            options.stop = function() {
                this.setLevel('info');
            };
        }

        this.update(options);
    };

    Instruction.prototype.getLevel = function() {
        return this.level;
    };

    Instruction.prototype.setMessage = function(message, timeout) {
        this.update({ message: message, timeout: timeout });
    };

    Instruction.prototype.reset = function() {
        this.update({ level: 'info', message: this.defaultMessage });
        this.state = false;
    };

    Instruction.prototype.validate = function(data) {
        if (typeof this.callback === 'function') {
            this.callback.call(this, data);
        }
    };

    return Instruction;

});
