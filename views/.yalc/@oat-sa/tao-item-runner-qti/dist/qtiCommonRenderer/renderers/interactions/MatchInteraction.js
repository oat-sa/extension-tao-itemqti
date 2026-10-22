define(['jquery', 'lodash', 'i18n', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'], function ($$1, _, __, Handlebars, Helpers0, containerHelper, instructionMgr, pciResponse) { 'use strict';

  $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
  _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
  __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
  Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
  Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
  containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
  instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;
  pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;

  if (!Helpers0.__initialized) {
    Helpers0(Handlebars);
    Helpers0.__initialized = true;
  }
  var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
    var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

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
    
    var stack1, helper;
    if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
    else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
    if(stack1 || stack1 === 0) { return stack1; }
    else { return ''; }
    }

  function program9(depth0,data) {
    
    var stack1;
    stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
    if(stack1 || stack1 === 0) { return stack1; }
    else { return ''; }
    }

  function program11(depth0,data,depth1) {
    
    var buffer = "", stack1;
    buffer += "\n      <tr>\n        ";
    stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n        ";
    stack1 = helpers.each.call(depth0, (depth1 && depth1.matchSet1), {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tr>\n      ";
    return buffer;
    }
  function program12(depth0,data) {
    
    
    return "\n        <td>\n          <label>\n            <input type=\"checkbox\" >\n            <span class=\"icon-checkbox cross\"></span>\n          </label>\n        </td>\n        ";
    }

    buffer += "<div ";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " class=\"qti-interaction qti-blockInteraction qti-matchInteraction";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\" data-serial=\"";
    if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
    else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
    buffer += escapeExpression(stack1)
      + "\" data-qti-class=\"matchInteraction\"";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += ">\n  ";
    stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <div class=\"instruction-container\"></div>\n  <div class=\"match-interaction-area\">\n    <table class=\"matrix\">\n      <thead>\n      <tr>\n        <th> </th>\n        ";
    options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data};
    if (helper = helpers.matchSet1) { stack1 = helper.call(depth0, options); }
    else { helper = (depth0 && depth0.matchSet1); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
    if (!helpers.matchSet1) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tr>\n      </thead>\n      <tbody>\n      ";
    options={hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data};
    if (helper = helpers.matchSet2) { stack1 = helper.call(depth0, options); }
    else { helper = (depth0 && depth0.matchSet2); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
    if (!helpers.matchSet2) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data}); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tbody>\n    </table>\n  </div>\n  <div class=\"notification-container\"></div>\n</div>\n";
    return buffer;
    });
  function tpl(data, options, asString) {
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

  /**
   * TODO do not use global context var, it's value is shared between interaction instances
   *
   * Flag to not throw warning instruction if already
   * displaying the warning. If such a flag is not used,
   * disturbances can be seen by the candidate if he clicks
   * like hell on choices.
   */
  var inWarning = false;

  /**
   * Init rendering, called after template injected into the DOM
   * All options are listed in the QTI v2.1 information model:
   * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
   *
   * @param {object} interaction
   */
  var render = function(interaction) {
      var $container = containerHelper.get(interaction);

      // Initialize instructions system.
      _setInstructions(interaction);

      $container.on('click.commonRenderer', 'input[type=checkbox]', function(e) {
          _onCheckboxSelected(interaction, e);
      });

      instructionMgr.validateInstructions(interaction);
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
   * @param {object} interaction
   * @param {object} response
   */
  var setResponse = function(interaction, response) {
      var $container = containerHelper.get(interaction);
      response = _filterResponse(response);

      if (typeof response.list !== 'undefined' && typeof response.list.directedPair !== 'undefined') {
          _(response.list.directedPair).forEach(function(directedPair) {
              var x = $$1('th[data-identifier="' + directedPair[0] + '"]', $container).index() - 1;
              var y = $$1('th[data-identifier="' + directedPair[1] + '"]', $container)
                  .parent()
                  .index();

              $$1('.matrix > tbody tr', $container)
                  .eq(y)
                  .find('input[type=checkbox]')
                  .eq(x)
                  .prop('checked', true);
          });
      }

      instructionMgr.validateInstructions(interaction);
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
   * @param {object} interaction
   * @returns {object}
   */
  var getResponse = function(interaction) {
      var response = pciResponse.serialize(_getRawResponse(interaction), interaction);
      return response;
  };

  var resetResponse = function(interaction) {
      var $container = containerHelper.get(interaction);
      $$1('input[type=checkbox]:checked', $container).each(function() {
          $$1(this).prop('checked', false);
      });

      instructionMgr.validateInstructions(interaction);
  };

  var _filterResponse = function(response) {
      if (typeof response.list === 'undefined') {
          // Maybe it's a base?
          if (typeof response.base === 'undefined') {
              // Oops, it is even not a base.
              throw 'The given response is not compliant with PCI JSON representation.';
          } else {
              // It's a base, Is it a directedPair? Null?
              if (response.base === null) {
                  return { list: { directedPair: [] } };
              } else if (typeof response.base.directedPair === 'undefined') {
                  // Oops again, it is not a directedPair.
                  throw 'The matchInteraction only accepts directedPair values as responses.';
              } else {
                  return { list: { directedPair: [response.base.directedPair] } };
              }
          }
      } else if (typeof response.list.directedPair === 'undefined') {
          // Oops, not a directedPair.
          throw 'The matchInteraction only accept directedPair values as responses.';
      } else {
          return response;
      }
  };

  var _getRawResponse = function(interaction) {
      var $container = containerHelper.get(interaction);
      var values = [];

      $container.find('input[type=checkbox]:checked').each(function() {
          values.push(_inferValue(this));
      });

      return values;
  };

  var _inferValue = function(element) {
      var $element = $$1(element);
      var $container = $element.closest('.match-interaction-area');
      var y = $element.closest('tr').index();
      var x = $element.closest('td').index();
      var firstId = $$1('.matrix > thead th', $container)
          .eq(x)
          .data('identifier');
      var secondId = $$1('.matrix > tbody th', $container)
          .eq(y)
          .data('identifier');
      return [firstId, secondId];
  };

  var _onCheckboxSelected = function(interaction, e) {
      var choice;
      var currentResponse = _getRawResponse(interaction);
      var minAssociations = interaction.attr('minAssociations');
      var maxAssociations = interaction.attr('maxAssociations');

      if (maxAssociations === 0) {
          maxAssociations = _countChoices(interaction);
      }

      if (_.size(currentResponse) > maxAssociations) {
          // No more associations possible.
          e.preventDefault();
          instructionMgr.validateInstructions(interaction);
      } else if ((choice = _maxMatchReached(interaction, e.target)) !== false) {
          // Check if matchmax is respected for both choices
          // involved in the selection.
          e.preventDefault();
          instructionMgr.validateInstructions(interaction, choice);
      } else {
          containerHelper.triggerResponseChangeEvent(interaction, {});
          instructionMgr.validateInstructions(interaction);
      }
  };

  var _maxMatchReached = function(interaction, input) {
      var association = _inferValue(input);
      var overflow = false;

      _(association).forEach(function(identifier) {
          var choice = _getChoiceDefinitionByIdentifier(interaction, identifier);
          var matchMin = choice.attributes.matchMin;
          var matchMax = choice.attributes.matchMax;
          var assoc = _countAssociations(interaction, choice);

          if (matchMax > 0 && assoc > matchMax) {
              overflow = choice;
          }
      });

      return overflow;
  };

  var _countAssociations = function(interaction, choice) {
      var rawResponse = _getRawResponse(interaction);
      var count = 0;

      // How much time can we find rawChoice in rawResponses?
      _(rawResponse).forEach(function(response) {
          if (response[0] === choice.attributes.identifier || response[1] === choice.attributes.identifier) {
              count++;
          }
      });

      return count;
  };

  var _countChoices = function(interaction) {
      var $container = containerHelper.get(interaction);
      return $container.find('input[type=checkbox]').length;
  };

  var _getChoiceDefinitionByIdentifier = function(interaction, identifier) {
      var rawChoices = _getRawChoices(interaction);
      return rawChoices[identifier];
  };

  var _getRawChoices = function(interaction) {
      var rawChoices = {};

      _(interaction.choices).forEach(function(matchset) {
          _(matchset).forEach(function(choice) {
              rawChoices[choice.attributes.identifier] = choice;
          });
      });

      return rawChoices;
  };

  var _setInstructions = function(interaction) {
      var msg;
      var minAssociations = interaction.attr('minAssociations');
      var maxAssociations = interaction.attr('maxAssociations');
      var choiceCount = _countChoices(interaction);

      // Super closure is here again to save our souls! Houray!
      // ~~~~~~~ |==||||0__

      var superClosure = function() {
          var onMaxChoicesReached = function(report, msg) {
              if (inWarning === false) {
                  inWarning = true;

                  report.update({
                      level: 'warning',
                      message: __('Maximum number of choices reached.'),
                      timeout: 2000,
                      stop: function() {
                          report.update({ level: 'success', message: msg });
                          inWarning = false;
                      }
                  });
              }
          };

          var onMatchMaxReached = function(interaction, choice, report, msg, level) {
              var $container = containerHelper.get(interaction);

              if (inWarning === false) {
                  inWarning = true;

                  var $choice = $container.find(
                      '.qti-simpleAssociableChoice[data-identifier="' + choice.attributes.identifier + '"]'
                  );
                  var originalBackgroundColor = $choice.css('background-color');
                  var originalColor = $choice.css('color');

                  report.update({
                      level: 'warning',
                      message: __('The highlighted choice cannot be associated more than %d time(s).').replace(
                          '%d',
                          choice.attributes.matchMax
                      ),
                      timeout: 3000,
                      start: function() {
                          $choice.animate(
                              {
                                  backgroundColor: '#fff',
                                  color: '#ba122b'
                              },
                              250,
                              function() {
                                  $choice.animate(
                                      {
                                          backgroundColor: '#ba122b',
                                          color: '#fff'
                                      },
                                      250
                                  );
                              }
                          );
                      },
                      stop: function() {
                          $choice.animate(
                              {
                                  backgroundColor: originalBackgroundColor,
                                  color: originalColor
                              },
                              500
                          );
                          report.update({ level: level, message: msg });
                          inWarning = false;
                      }
                  });
              }
          };

          if (minAssociations === 0 && maxAssociations > 0) {
              // No minimum but maximum.
              msg = __('You must select 0 to %d choices.').replace('%d', maxAssociations);

              instructionMgr.appendInstruction(interaction, msg, function(choice) {
                  var responseCount = _.size(_getRawResponse(interaction));

                  if (
                      choice &&
                      choice.attributes &&
                      choice.attributes.matchMax > 0 &&
                      _countAssociations(interaction, choice) > choice.attributes.matchMax
                  ) {
                      onMatchMaxReached(interaction, choice, this, msg, this.getLevel());
                  } else if (responseCount <= maxAssociations) {
                      this.setLevel('success');
                  } else if (responseCount > maxAssociations) {
                      onMaxChoicesReached(this, msg);
                  } else {
                      this.reset();
                  }
              });
          } else if (minAssociations === 0 && maxAssociations === 0) {
              // No minimum, no maximum.
              msg = __('You must select 0 to %d choices.').replace('%d', choiceCount);

              instructionMgr.appendInstruction(interaction, msg, function(choice) {
                  if (
                      choice &&
                      choice.attributes &&
                      choice.attributes.matchMax > 0 &&
                      _countAssociations(interaction, choice) > choice.attributes.matchMax
                  ) {
                      onMatchMaxReached(interaction, choice, this, msg, this.getLevel());
                  } else {
                      this.setLevel('success');
                  }
              });
          } else if (minAssociations > 0 && maxAssociations === 0) {
              // minimum but no maximum.
              msg = __('You must select %1$d to %2$d choices.');
              msg = msg.replace('%1$d', minAssociations);
              msg = msg.replace('%2$d', choiceCount);

              instructionMgr.appendInstruction(interaction, msg, function(choice) {
                  var responseCount = _.size(_getRawResponse(interaction));

                  if (
                      choice &&
                      choice.attributes &&
                      choice.attributes.matchMax > 0 &&
                      _countAssociations(interaction, choice) > choice.attributes.matchMax
                  ) {
                      onMatchMaxReached(interaction, choice, this, msg, this.getLevel());
                  } else if (responseCount < minAssociations) {
                      this.setLevel('info');
                  } else if (responseCount > choiceCount) {
                      onMaxChoicesReached(this, msg);
                  } else {
                      this.setLevel('success');
                  }
              });
          } else if (minAssociations > 0 && maxAssociations > 0) {
              // minimum and maximum.
              if (minAssociations !== maxAssociations) {
                  msg = __('You must select %1$d to %2$d choices.');
                  msg = msg.replace('%1$d', minAssociations);
                  msg = msg.replace('%2$d', maxAssociations);
              } else {
                  msg = __('You must select exactly %d choice(s).');
                  msg = msg.replace('%d', minAssociations);
              }

              instructionMgr.appendInstruction(interaction, msg, function(choice) {
                  var responseCount = _.size(_getRawResponse(interaction));

                  if (
                      choice &&
                      choice.attributes &&
                      choice.attributes.matchMax > 0 &&
                      _countAssociations(interaction, choice) > choice.attributes.matchMax
                  ) {
                      onMatchMaxReached(interaction, choice, this, msg, this.getLevel());
                  } else if (responseCount < minAssociations) {
                      this.setLevel('info');
                  } else if (responseCount > maxAssociations) {
                      onMaxChoicesReached(this, msg);
                  } else if (responseCount >= minAssociations && responseCount <= maxAssociations) {
                      this.setLevel('success');
                  }
              });
          }
      };

      superClosure();
  };

  var destroy = function(interaction) {
      var $container = containerHelper.get(interaction);
      $container.off('.commonRenderer');

      instructionMgr.removeInstructions(interaction);

      //remove all references to a cache container
      containerHelper.reset(interaction);
  };

  /**
   * Set the interaction state. It could be done anytime with any state.
   *
   * @param {Object} interaction - the interaction instance
   * @param {Object} state - the interaction state
   */
  var setState = function setState(interaction, state) {
      var $container;

      if (_.isObject(state)) {
          //restore order of previously shuffled choices
          if (_.isArray(state.order) && state.order.length === 2) {
              $container = containerHelper.get(interaction);

              $$1('thead .qti-choice', $container)
                  .sort(function(a, b) {
                      var aIndex = _.indexOf(state.order[0], $$1(a).data('identifier'));
                      var bIndex = _.indexOf(state.order[0], $$1(b).data('identifier'));
                      if (aIndex > bIndex) {
                          return 1;
                      }
                      if (aIndex < bIndex) {
                          return -1;
                      }
                      return 0;
                  })
                  .detach()
                  .appendTo($$1('thead tr', $container));

              $$1('tbody .qti-choice', $container)
                  .sort(function(a, b) {
                      var aIndex = _.indexOf(state.order[1], $$1(a).data('identifier'));
                      var bIndex = _.indexOf(state.order[1], $$1(b).data('identifier'));
                      if (aIndex > bIndex) {
                          return 1;
                      }
                      if (aIndex < bIndex) {
                          return -1;
                      }
                      return 0;
                  })
                  .detach()
                  .each(function(index, elt) {
                      $$1(elt).prependTo($$1('tbody tr', $container).eq(index));
                  });
          }

          if (state.response) {
              interaction.resetResponse();
              interaction.setResponse(state.response);
          }
      }
  };

  /**
   * Get the interaction state.
   *
   * @param {Object} interaction - the interaction instance
   * @returns {Object} the interaction current state
   */
  var getState = function getState(interaction) {
      var $container;
      var state = {};
      var response = interaction.getResponse();

      if (response) {
          state.response = response;
      }

      //we store also the choice order if shuffled
      if (interaction.attr('shuffle') === true) {
          $container = containerHelper.get(interaction);

          state.order = [[], []];
          $$1('thead .qti-choice', $container).each(function() {
              state.order[0].push($$1(this).data('identifier'));
          });
          $$1('tbody .qti-choice', $container).each(function() {
              state.order[1].push($$1(this).data('identifier'));
          });
      }
      return state;
  };

  /**
   * Expose the common renderer for the match interaction
   * @exports qtiCommonRenderer/renderers/interactions/MatchInteraction
   */
  var MatchInteraction = {
      qtiClass: 'matchInteraction',
      template: tpl,
      render: render,
      getContainer: containerHelper.get,
      setResponse: setResponse,
      getResponse: getResponse,
      resetResponse: resetResponse,
      destroy: destroy,
      setState: setState,
      getState: getState,
      inferValue: _inferValue
  };

  return MatchInteraction;

});
