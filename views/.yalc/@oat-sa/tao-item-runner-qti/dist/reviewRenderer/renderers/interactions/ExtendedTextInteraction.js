define(['jquery', 'lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/patternMask', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction', 'taoQtiItem/qtiCommonRenderer/helpers/container'], function ($$1, _, Handlebars, Helpers0, patternMaskHelper, extendedTextInteraction, containerHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    patternMaskHelper = patternMaskHelper && Object.prototype.hasOwnProperty.call(patternMaskHelper, 'default') ? patternMaskHelper['default'] : patternMaskHelper;
    extendedTextInteraction = extendedTextInteraction && Object.prototype.hasOwnProperty.call(extendedTextInteraction, 'default') ? extendedTextInteraction['default'] : extendedTextInteraction;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "id=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " "
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program7(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " data-scrolling=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['data-scrolling'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program9(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " data-scrolling-height=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['data-scrolling-height'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program11(depth0,data) {
      
      var stack1, helper;
      if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

    function program13(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n        ";
      stack1 = (helper = helpers.equal || (depth0 && depth0.equal),options={hash:{},inverse:self.program(18, program18, data),fn:self.program(14, program14, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format), "xhtml", options) : helperMissing.call(depth0, "equal", ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format), "xhtml", options));
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      return buffer;
      }
    function program14(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n            ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.maxStringLoop), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        ";
      return buffer;
      }
    function program15(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n                <div class=\"text-container text-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + " solid";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" name=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "_"
        + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
        + "\"></div>\n            ";
      return buffer;
      }
    function program16(depth0,data) {
      
      
      return " attributes.class";
      }

    function program18(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n            ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.maxStringLoop), {hash:{},inverse:self.noop,fn:self.program(19, program19, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        ";
      return buffer;
      }
    function program19(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n                <pre class=\"text-container text-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + " solid";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n                    name=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "_"
        + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
        + "\" ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.patternMask), {hash:{},inverse:self.noop,fn:self.program(20, program20, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " aria-labelledby=\"";
      if (helper = helpers.promptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.promptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"></pre>\n            ";
      return buffer;
      }
    function program20(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "pattern=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.patternMask)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n                    ";
      return buffer;
      }

    function program22(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n        ";
      stack1 = (helper = helpers.equal || (depth0 && depth0.equal),options={hash:{},inverse:self.program(25, program25, data),fn:self.program(23, program23, data),data:data},helper ? helper.call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format), "xhtml", options) : helperMissing.call(depth0, "equal", ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format), "xhtml", options));
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      return buffer;
      }
    function program23(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n        <div class=\"text-container text-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + " solid";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"></div>\n        ";
      return buffer;
      }

    function program25(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n            <pre class=\"text-container text-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.format)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + " solid";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n                    name=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "_"
        + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
        + "\" ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.patternMask), {hash:{},inverse:self.noop,fn:self.program(20, program20, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " aria-labelledby=\"";
      if (helper = helpers.promptId) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.promptId); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"></pre>\n        ";
      return buffer;
      }

    function program27(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n            <span class=\"count-chars\">0</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "of", options) : helperMissing.call(depth0, "__", "of", options)))
        + " <span class=\"count-expected-length\">"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.expectedLength)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "chars", options) : helperMissing.call(depth0, "__", "chars", options)))
        + " "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "recommended", options) : helperMissing.call(depth0, "__", "recommended", options)))
        + ".\n        ";
      return buffer;
      }

    function program29(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n            ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.maxLength), {hash:{},inverse:self.program(32, program32, data),fn:self.program(30, program30, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n            ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.maxWords), {hash:{},inverse:self.program(36, program36, data),fn:self.program(34, program34, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        ";
      return buffer;
      }
    function program30(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n                <span class=\"text-counter-chars\"><span class=\"count-chars\">0</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "of", options) : helperMissing.call(depth0, "__", "of", options)))
        + " <span class=\"count-max-length\">";
      if (helper = helpers.maxLength) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.maxLength); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "chars", options) : helperMissing.call(depth0, "__", "chars", options)))
        + " "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "maximum", options) : helperMissing.call(depth0, "__", "maximum", options)))
        + ".</span>\n            ";
      return buffer;
      }

    function program32(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n                <span class=\"text-counter-chars\" style=\"display: none\"><span class=\"count-chars\">0</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "of", options) : helperMissing.call(depth0, "__", "of", options)))
        + " <span class=\"count-max-length\">";
      if (helper = helpers.maxLength) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.maxLength); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "chars", options) : helperMissing.call(depth0, "__", "chars", options)))
        + " "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "maximum", options) : helperMissing.call(depth0, "__", "maximum", options)))
        + ".</span>\n            ";
      return buffer;
      }

    function program34(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n                <span class=\"text-counter-words\"><span class=\"count-words\">0</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "of", options) : helperMissing.call(depth0, "__", "of", options)))
        + " <span class=\"count-max-words\">";
      if (helper = helpers.maxWords) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.maxWords); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "words", options) : helperMissing.call(depth0, "__", "words", options)))
        + " "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "maximum", options) : helperMissing.call(depth0, "__", "maximum", options)))
        + ".</span>\n            ";
      return buffer;
      }

    function program36(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n                <span class=\"text-counter-words\" style=\"display: none\"><span class=\"count-words\">0</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "of", options) : helperMissing.call(depth0, "__", "of", options)))
        + " <span class=\"count-max-words\">";
      if (helper = helpers.maxWords) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.maxWords); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "words", options) : helperMissing.call(depth0, "__", "words", options)))
        + " "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "maximum", options) : helperMissing.call(depth0, "__", "maximum", options)))
        + ".</span>\n            ";
      return buffer;
      }

      buffer += "<div ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " class=\"qti-interaction qti-blockInteraction qti-extendedTextInteraction";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-qti-class=\"extendedTextInteraction\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['data-scrolling']), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['data-scrolling-height']), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"instruction-container\"></div>\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.multiple), {hash:{},inverse:self.program(22, program22, data),fn:self.program(13, program13, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"text-counter\">\n        ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.expectedLength), {hash:{},inverse:self.program(29, program29, data),fn:self.program(27, program27, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    </div>\n</div>\n";
      return buffer;
      });
    function template(data, options, asString) {
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
     * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
     *
     */

    /**
     * * Disables the ckEditor and renders the interaction as usual
     *
     * @param {Object} interaction
     * @returns {*}
     */
    const render = interaction => {
        return new Promise(resolve => {
            let $el, expectedLength, minStrings, patternMask, placeholderType;
            const $container = containerHelper.get(interaction);
            const multiple = _isMultiple(interaction);
            const placeholderText = interaction.attr('placeholderText');

            if (!multiple) {
                $el = $container.find('.text-container');
                if (placeholderText) {
                    $el.attr('placeholder', placeholderText);
                }
                $el.on('keyup.commonRenderer change.commonRenderer', () => {
                    containerHelper.triggerResponseChangeEvent(interaction, {});
                });

                resolve();

                //multiple inputs
            } else {
                $el = $container.find('.text-container');
                minStrings = interaction.attr('minStrings');
                expectedLength = interaction.attr('expectedLength');
                patternMask = interaction.attr('patternMask');

                //set the fields width
                if (expectedLength) {
                    expectedLength = parseInt(expectedLength, 10);

                    if (expectedLength > 0) {
                        $el.each(function () {
                            $$1(this).css('width', expectedLength + 'em');
                        });
                    }
                }

                //set the fields placeholder
                if (placeholderText) {
                    /**
                     * The type of the fileds placeholder:
                     * multiple - set placeholder for each field
                     * first - set placeholder only for first field
                     * none - dont set placeholder
                     */
                    placeholderType = 'first';

                    if (placeholderType === 'multiple') {
                        $el.each(function () {
                            $$1(this).attr('placeholder', placeholderText);
                        });
                    } else if (placeholderType === 'first') {
                        $el.first().attr('placeholder', placeholderText);
                    }
                }
                resolve();
            }
        });
    };

    /**
     * Get the interaction format
     * @param {Object} interaction - the extended text interaction model
     * @returns {String} format in 'plain', 'xhtml', 'preformatted'
     */
    const _getFormat = interaction => {
        const format = interaction.attr('format');
        if (['plain', 'xhtml', 'preformatted'].includes(format)) {
            return format;
        }
        return 'plain';
    };

    /**
     * return the value of the textarea or ckeditor data
     * @param  {Object} interaction
     * @param  {Boolean} raw Tells if the returned data does not have to be filtered (i.e. XHTML tags not removed)
     * @return {String}             the value
     */
    const _getTextContainerValue = interaction => {
        if (_getFormat(interaction) === 'xhtml') {
            return containerHelper.get(interaction).find('.text-container')[0].innerHTML;
        } else {
            return containerHelper.get(interaction).find('.text-container')[0].innerText;
        }
    };

    /**
     * Whether or not multiple strings are expected from the candidate to
     * compose a valid response.
     *
     * @param {Object} interaction - the extended text interaction model
     * @returns {Boolean} true if a multiple
     */
    const _isMultiple = interaction => {
        const attributes = interaction.getAttributes();
        const response = interaction.getResponseDeclaration();
        return !!(
            attributes.maxStrings &&
            (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered')
        );
    };

    /**
     * Creates an input limiter object
     * @param {Object} interaction - the extended text interaction
     * @returns {Object} the limiter
     */
    const inputLimiter = interaction => {
        const $container = containerHelper.get(interaction);
        const expectedLength = interaction.attr('expectedLength');
        const expectedLines = interaction.attr('expectedLines');
        const patternMask = interaction.attr('patternMask');
        let $textarea, $charsCounter, $wordsCounter, maxWords, maxLength, $maxLengthCounter, $maxWordsCounter;
        let enabled = false;

        if (expectedLength || expectedLines || patternMask) {
            enabled = true;

            $textarea = $$1('.text-container', $container);
            $charsCounter = $$1('.count-chars', $container);
            $wordsCounter = $$1('.count-words', $container);
            $maxLengthCounter = $$1('.count-max-length', $container);
            $maxWordsCounter = $$1('.count-max-words', $container);

            if (patternMask !== '') {
                maxWords = parseInt(patternMaskHelper.parsePattern(patternMask, 'words'), 10);
                maxLength = parseInt(patternMaskHelper.parsePattern(patternMask, 'chars'), 10);
                maxWords = _.isNaN(maxWords) ? 0 : maxWords;
                maxLength = _.isNaN(maxLength) ? 0 : maxLength;
                $maxLengthCounter.text(maxLength);
                $maxWordsCounter.text(maxWords);
            }
        }

        /**
         * The limiter instance
         */
        const limiter = {
            /**
             * Is the limiter enabled regarding the interaction configuration
             */
            enabled: enabled,

            /**
             * Get the number of words that are actually written in the response field
             * @return {Number} number of words
             */
            getWordsCount: () => {
                let value = _getTextContainerValue(interaction) || '';
                if (_.isEmpty(value)) {
                    return 0;
                }
                // convert it to text
                if (_getFormat(interaction) === 'xhtml') {
                    const div = document.createElement('div');
                    div.innerHTML = value;
                    value = div.textContent || div.innerText || '';
                }
                // leading and trailing white space don't qualify as words
                return value.trim().replace(/\s+/gi, ' ').split(' ').length;
            },

            /**
             * Get the number of characters that are actually written in the response field
             * @return {Number} number of characters
             */
            getCharsCount: () => {
                let value = _getTextContainerValue(interaction) || '';

                // convert it to text
                if (_getFormat(interaction) === 'xhtml') {
                    const div = document.createElement('div');
                    div.innerHTML = value;
                    value = div.textContent || div.innerText || '';
                }
                // remove NO-BREAK SPACE in empty lines added and all new line symbols
                return value.replace(/[\r\n]{1}\xA0[\r\n]{1}/gm, '\r').replace(/[\r\n]+/gm, '').length;
            },

            /**
             * Update the counter element
             */
            updateCounter: function udpateCounter() {
                $charsCounter.text(this.getCharsCount());
                $wordsCounter.text(this.getWordsCount());
            }
        };

        return limiter;
    };

    /**
     * Reset the textarea / ckEditor
     * @param {Object} interaction - the extended text interaction model
     */
    const resetResponse = interaction => {
        containerHelper.get(interaction).find('.text-container')[0].innerText = '';
    };

    const setText = (interaction, text) => {
        if (['plain', 'preformatted'].includes(_getFormat(interaction))) {
            containerHelper.get(interaction).find('.text-container')[0].innerText = text;
        } else {
            containerHelper.get(interaction).find('.text-container')[0].innerHTML = text;
        }

        const limiter = inputLimiter(interaction);
        if (limiter.enabled) {
            limiter.updateCounter();
        }
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     *
     * @param {Object} interaction - the extended text interaction model
     * @returns {object}
     */
    const getResponse = interaction => {
        const $container = containerHelper.get(interaction);
        const attributes = interaction.getAttributes();
        const responseDeclaration = interaction.getResponseDeclaration();
        const baseType = responseDeclaration.attr('baseType');
        const numericBase = attributes.base || 10;
        const multiple = _isMultiple(interaction);
        let ret = multiple ? { list: {} } : { base: {} };
        let values;
        let value = '';

        if (multiple) {
            values = [];

            $container.find('.text-container').each(function (i) {
                const $el = $$1(this);

                if (attributes.placeholderText && $el.innerText === attributes.placeholderText) {
                    values[i] = '';
                } else {
                    if (baseType === 'integer') {
                        values[i] = parseInt($el.innerText, numericBase);
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    } else if (baseType === 'float') {
                        values[i] = parseFloat($el.innerText);
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    } else if (baseType === 'string') {
                        values[i] = $el.innerText;
                    }
                }
            });

            ret.list[baseType] = values;
        } else {
            if (attributes.placeholderText && _getTextContainerValue(interaction) === attributes.placeholderText) {
                value = '';
            } else {
                if (baseType === 'integer') {
                    value = parseInt(_getTextContainerValue(interaction), numericBase);
                } else if (baseType === 'float') {
                    value = parseFloat(_getTextContainerValue(interaction));
                } else if (baseType === 'string') {
                    value = _getTextContainerValue(interaction);
                }
            }

            ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;
        }

        return ret;
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     *
     * @param {Object} interaction - the extended text interaction model
     * @param {object} response
     */
    const setResponse = (interaction, response) => {
        const _setMultipleVal = (identifier, value) => {
            interaction.getContainer().find(`#${identifier}`)[0].innerHTML = value;
        };

        const baseType = interaction.getResponseDeclaration().attr('baseType');

        if (response.base === null && Object.keys(response).length === 1) {
            response = { base: { string: '' } };
        }

        if (response.base && typeof response.base[baseType] !== 'undefined') {
            setText(interaction, response.base[baseType]);
        } else if (response.list && response.list[baseType]) {
            for (let i in response.list[baseType]) {
                const serial = typeof response.list.serial === 'undefined' ? '' : response.list.serial[i];
                _setMultipleVal(`${serial}_${i}`, response.list[baseType][i]);
            }
        } else {
            throw new Error('wrong response format in argument.');
        }
    };

    /**
     * Expose the common renderer for the extended text interaction
     * @exports qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction
     */

    var ExtendedTextInteraction = Object.assign({}, extendedTextInteraction, {
        template,
        render,
        getResponse,
        setResponse,
        resetResponse,
        setText,
        inputLimiter
    });

    return ExtendedTextInteraction;

});
